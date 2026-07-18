"""HTTP routes for the Tubi26 API and single-page application."""

from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request, send_from_directory

from .extensions import db
from .models import Activity, FoodItem, Inventory, Meal, Recipe, ShoppingItem, User
from .services import (
    calculate_calories,
    chat_reply,
    date_value,
    food_json,
    inventory_items,
    inventory_totals,
    number_value,
    recipe_json,
    recipes_for_user,
    sync_shopping_suggestions,
    user_json,
)


api = Blueprint("api", __name__, url_prefix="/api")
web = Blueprint("web", __name__)


def error_response(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message}), status


@api.get("/health")
def health():
    return jsonify({"ok": True, "service": "tubi26-flask"})


@api.post("/user")
def save_user():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    if len(username) < 3 or len(username) > 64:
        return error_response("Kullanıcı adı 3-64 karakter arasında olmalı.")
    try:
        age = int(number_value(data.get("age"), "Yaş", minimum=13))
        weight = number_value(data.get("weight"), "Kilo", minimum=30)
        height = number_value(data.get("height"), "Boy", minimum=120)
    except ValueError as exc:
        return error_response(str(exc))

    user_id = data.get("id")
    user = (
        db.session.get(User, int(user_id))
        if user_id
        else User.query.filter_by(username=username).first()
    )
    if user is None:
        user = User(username=username)
        db.session.add(user)
    elif user.username != username:
        conflict = User.query.filter_by(username=username).first()
        if conflict and conflict.id != user.id:
            return error_response("Bu kullanıcı adı başka bir profile ait.", 409)
        user.username = username

    gender = str(data.get("gender", "other"))
    activity = str(data.get("activity_level", "light"))
    preferences = data.get("preferences") if isinstance(data.get("preferences"), list) else []
    user.age = age
    user.weight = weight
    user.height = height
    user.gender = gender if gender in {"male", "female", "other"} else "other"
    user.activity_level = activity
    user.daily_calories = calculate_calories(age, weight, height, user.gender, activity)
    user.preferences_json = json.dumps(preferences, ensure_ascii=False)
    db.session.commit()
    return jsonify({"ok": True, "user": user_json(user)})


@api.get("/user/<int:user_id>")
def get_user(user_id: int):
    user = db.session.get(User, user_id)
    if not user:
        return error_response("Kullanıcı bulunamadı.", 404)
    return jsonify({"ok": True, "user": user_json(user)})


@api.get("/foods")
def get_foods():
    foods = FoodItem.query.order_by(FoodItem.category, FoodItem.name).all()
    return jsonify({"ok": True, "foods": [food_json(food) for food in foods]})


@api.get("/inventory/<int:user_id>")
def get_inventory(user_id: int):
    return jsonify({"ok": True, "items": inventory_items(user_id)})


@api.post("/inventory")
def add_inventory():
    data = request.get_json(silent=True) or {}
    try:
        user_id = int(data.get("user_id"))
        food_id = int(data.get("food_id"))
        quantity = number_value(data.get("quantity"), "Miktar", minimum=0.1)
        expiry = date_value(data.get("expiry_date"), "Son kullanma tarihi")
    except (TypeError, ValueError) as exc:
        return error_response(str(exc))
    if not db.session.get(User, user_id) or not db.session.get(FoodItem, food_id):
        return error_response("Kullanıcı veya gıda bulunamadı.", 404)
    item = Inventory.query.filter_by(user_id=user_id, food_id=food_id).first()
    if item:
        item.quantity += quantity
        if expiry and (not item.expiry_date or expiry < item.expiry_date):
            item.expiry_date = expiry
    else:
        item = Inventory(
            user_id=user_id,
            food_id=food_id,
            quantity=quantity,
            expiry_date=expiry,
        )
        db.session.add(item)
    db.session.commit()
    return jsonify({"ok": True, "item_id": item.id})


@api.delete("/inventory/<int:item_id>")
def delete_inventory(item_id: int):
    item = db.session.get(Inventory, item_id)
    if not item:
        return error_response("Envanter öğesi bulunamadı.", 404)
    requested_user = request.args.get("user_id", type=int)
    if requested_user is None or item.user_id != requested_user:
        return error_response("Bu öğe için yetkiniz yok.", 403)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})


@api.get("/recipes/<int:user_id>")
def get_recipes(user_id: int):
    if not db.session.get(User, user_id):
        return error_response("Kullanıcı bulunamadı.", 404)
    return jsonify({"ok": True, "recipes": recipes_for_user(user_id)})


@api.get("/shopping/<int:user_id>")
def get_shopping(user_id: int):
    if not db.session.get(User, user_id):
        return error_response("Kullanıcı bulunamadı.", 404)
    sync_shopping_suggestions(user_id)
    rows = (
        db.session.query(ShoppingItem, FoodItem)
        .join(FoodItem, ShoppingItem.food_id == FoodItem.id)
        .filter(ShoppingItem.user_id == user_id)
        .order_by(ShoppingItem.checked, FoodItem.category, FoodItem.name)
        .all()
    )
    items = [
        {
            "id": item.id,
            "food_id": food.id,
            "name": food.name,
            "category": food.category,
            "quantity": round(item.quantity, 1),
            "reason": item.reason,
            "checked": item.checked,
            "source": item.source,
        }
        for item, food in rows
    ]
    return jsonify({"ok": True, "items": items})


@api.post("/shopping")
def add_shopping():
    data = request.get_json(silent=True) or {}
    try:
        user_id = int(data.get("user_id"))
        food_id = int(data.get("food_id"))
        quantity = number_value(data.get("quantity", 1), "Miktar", minimum=0.1)
    except (TypeError, ValueError) as exc:
        return error_response(str(exc))
    if not db.session.get(User, user_id) or not db.session.get(FoodItem, food_id):
        return error_response("Kullanıcı veya gıda bulunamadı.", 404)
    item = ShoppingItem.query.filter_by(user_id=user_id, food_id=food_id).first()
    if item:
        item.quantity = quantity
        item.checked = False
        item.source = "manual"
        item.reason = str(data.get("reason") or "Manuel eklendi")[:200]
    else:
        item = ShoppingItem(
            user_id=user_id,
            food_id=food_id,
            quantity=quantity,
            reason=str(data.get("reason") or "Manuel eklendi")[:200],
        )
        db.session.add(item)
    db.session.commit()
    return jsonify({"ok": True, "item_id": item.id})


@api.patch("/shopping/<int:item_id>")
def update_shopping(item_id: int):
    item = db.session.get(ShoppingItem, item_id)
    data = request.get_json(silent=True) or {}
    if not item:
        return error_response("Alışveriş öğesi bulunamadı.", 404)
    if item.user_id != data.get("user_id"):
        return error_response("Bu öğe için yetkiniz yok.", 403)
    item.checked = bool(data.get("checked"))
    db.session.commit()
    return jsonify({"ok": True})


@api.delete("/shopping/<int:item_id>")
def delete_shopping(item_id: int):
    item = db.session.get(ShoppingItem, item_id)
    if not item:
        return error_response("Alışveriş öğesi bulunamadı.", 404)
    user_id = request.args.get("user_id", type=int)
    if user_id is None or item.user_id != user_id:
        return error_response("Bu öğe için yetkiniz yok.", 403)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})


@api.post("/meals")
def add_meal():
    data = request.get_json(silent=True) or {}
    try:
        meal = Meal(
            user_id=int(data.get("user_id")),
            name=str(data.get("name", "")).strip(),
            calories=int(number_value(data.get("calories"), "Kalori", minimum=0)),
            meal_date=date_value(data.get("date")) or date.today(),
            meal_type=str(data.get("meal_type") or "snack"),
        )
    except (TypeError, ValueError) as exc:
        return error_response(str(exc))
    if not meal.name or not db.session.get(User, meal.user_id):
        return error_response("Kullanıcı ve öğün adı gerekli.")
    db.session.add(meal)
    db.session.commit()
    return jsonify({"ok": True, "id": meal.id})


@api.post("/activities")
def add_activity():
    data = request.get_json(silent=True) or {}
    try:
        activity = Activity(
            user_id=int(data.get("user_id")),
            name=str(data.get("name", "")).strip(),
            burned_calories=int(
                number_value(
                    data.get("burned_calories"), "Yakılan kalori", minimum=0
                )
            ),
            activity_date=date_value(data.get("date")) or date.today(),
        )
    except (TypeError, ValueError) as exc:
        return error_response(str(exc))
    if not activity.name or not db.session.get(User, activity.user_id):
        return error_response("Kullanıcı ve aktivite adı gerekli.")
    db.session.add(activity)
    db.session.commit()
    return jsonify({"ok": True, "id": activity.id})


@api.get("/dashboard/<int:user_id>")
def dashboard(user_id: int):
    user = db.session.get(User, user_id)
    if not user:
        return error_response("Kullanıcı bulunamadı.", 404)
    today = date.today()
    consumed = sum(
        item.calories
        for item in Meal.query.filter_by(user_id=user_id, meal_date=today).all()
    )
    burned = sum(
        item.burned_calories
        for item in Activity.query.filter_by(
            user_id=user_id, activity_date=today
        ).all()
    )
    inventory_rows = (
        db.session.query(Inventory, FoodItem)
        .join(FoodItem, Inventory.food_id == FoodItem.id)
        .filter(Inventory.user_id == user_id)
        .all()
    )
    categories: dict[str, int] = {}
    expiring = 0
    for item, food in inventory_rows:
        categories[food.category] = categories.get(food.category, 0) + 1
        if item.expiry_date and item.expiry_date <= today + timedelta(days=3):
            expiring += 1
    totals = inventory_totals(user_id)
    recipes = [recipe_json(recipe, totals) for recipe in Recipe.query.all()]
    recipes.sort(
        key=lambda item: (item["can_make"], item["matching_count"]), reverse=True
    )
    return jsonify(
        {
            "ok": True,
            "profile": user_json(user),
            "calories": {
                "target": user.daily_calories,
                "consumed": consumed,
                "burned": burned,
                "remaining": max(user.daily_calories - consumed + burned, 0),
            },
            "inventory": {
                "item_count": len(inventory_rows),
                "expiring_count": expiring,
                "categories": categories,
            },
            "recommended_recipe": recipes[0] if recipes else None,
        }
    )


@api.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}
    try:
        user_id = int(data.get("user_id"))
    except (TypeError, ValueError):
        return error_response("Geçerli bir kullanıcı gerekli.")
    message = str(data.get("message", "")).strip()
    if not message or len(message) > 1000:
        return error_response("Mesaj 1-1000 karakter arasında olmalı.")
    user = db.session.get(User, user_id)
    if not user:
        return error_response("Kullanıcı bulunamadı.", 404)
    text, source = chat_reply(user, message)
    return jsonify({"ok": True, "text": text, "source": source})


@web.get("/")
def serve_root():
    dist_dir = Path(current_app.config["DIST_DIR"])
    if (dist_dir / "index.html").exists():
        return send_from_directory(dist_dir, "index.html")
    return jsonify(
        {
            "ok": True,
            "message": (
                "Tubi26 API çalışıyor. Geliştirme arayüzü için "
                "npm run dev komutunu kullanın."
            ),
        }
    )


@web.get("/<path:path>")
def serve_spa(path: str):
    if path.startswith("api/"):
        return error_response("Endpoint bulunamadı.", 404)
    dist_dir = Path(current_app.config["DIST_DIR"])
    requested = dist_dir / path
    if requested.is_file():
        return send_from_directory(dist_dir, path)
    if (dist_dir / "index.html").exists():
        return send_from_directory(dist_dir, "index.html")
    return error_response("Frontend build bulunamadı.", 404)
