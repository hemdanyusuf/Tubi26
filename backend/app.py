from __future__ import annotations

import json
import os
import secrets
from datetime import date, datetime, timedelta
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint


BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / "dist"
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, static_folder=None)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY") or secrets.token_hex(32)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL", "sqlite:///tubi26.db"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JSON_AS_ASCII"] = False

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    gender = db.Column(db.String(20), nullable=False, default="other")
    activity_level = db.Column(db.String(20), nullable=False, default="light")
    daily_calories = db.Column(db.Integer, nullable=False, default=2000)
    preferences_json = db.Column(db.Text, nullable=False, default="[]")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class FoodItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(40), nullable=False)
    calories_per_100g = db.Column(db.Float, nullable=False)
    protein_per_100g = db.Column(db.Float, nullable=False, default=0)
    carbs_per_100g = db.Column(db.Float, nullable=False, default=0)
    fat_per_100g = db.Column(db.Float, nullable=False, default=0)


class Inventory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    food_id = db.Column(db.Integer, db.ForeignKey("food_item.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    expiry_date = db.Column(db.Date)
    added_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_id", "food_id"),)


class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=False)
    total_calories = db.Column(db.Float, nullable=False)
    servings = db.Column(db.Integer, nullable=False, default=1)
    prep_time = db.Column(db.Integer, nullable=False, default=10)
    cook_time = db.Column(db.Integer, nullable=False, default=20)
    difficulty = db.Column(db.String(20), nullable=False, default="easy")
    category = db.Column(db.String(30), nullable=False, default="dinner")


class RecipeIngredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"), nullable=False)
    food_id = db.Column(db.Integer, db.ForeignKey("food_item.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False, default="g")
    __table_args__ = (UniqueConstraint("recipe_id", "food_id"),)


class ShoppingItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    food_id = db.Column(db.Integer, db.ForeignKey("food_item.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=1)
    reason = db.Column(db.String(200), nullable=False, default="Manuel eklendi")
    checked = db.Column(db.Boolean, nullable=False, default=False)
    source = db.Column(db.String(20), nullable=False, default="manual")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_id", "food_id"),)


class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(160), nullable=False)
    calories = db.Column(db.Integer, nullable=False)
    meal_date = db.Column(db.Date, nullable=False, default=date.today)
    meal_type = db.Column(db.String(20), nullable=False, default="snack")


class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(160), nullable=False)
    burned_calories = db.Column(db.Integer, nullable=False)
    activity_date = db.Column(db.Date, nullable=False, default=date.today)


def _error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message}), status


def _number(value, field: str, *, minimum: float | None = None) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field} sayısal olmalı.") from exc
    if minimum is not None and parsed < minimum:
        raise ValueError(f"{field} en az {minimum} olmalı.")
    return parsed


def _date(value, field: str = "Tarih") -> date | None:
    if value in (None, ""):
        return None
    try:
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except ValueError as exc:
        raise ValueError(f"{field} YYYY-MM-DD formatında olmalı.") from exc


def _calculate_calories(age: int, weight: float, height: float, gender: str, activity: str) -> int:
    male_bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    female_bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age
    bmr = male_bmr if gender == "male" else female_bmr if gender == "female" else (male_bmr + female_bmr) / 2
    factors = {
        "low": 1.2,
        "light": 1.375,
        "medium": 1.55,
        "high": 1.725,
        "pro": 1.9,
    }
    return max(1200, int(bmr * factors.get(activity, 1.375)))


def _user_json(user: User) -> dict:
    try:
        preferences = json.loads(user.preferences_json or "[]")
    except json.JSONDecodeError:
        preferences = []
    return {
        "id": user.id,
        "username": user.username,
        "age": user.age,
        "weight": user.weight,
        "height": user.height,
        "gender": user.gender,
        "activity_level": user.activity_level,
        "daily_calories": user.daily_calories,
        "preferences": preferences,
    }


def _food_json(food: FoodItem) -> dict:
    return {
        "id": food.id,
        "name": food.name,
        "category": food.category,
        "calories_per_100g": food.calories_per_100g,
        "protein_per_100g": food.protein_per_100g,
        "carbs_per_100g": food.carbs_per_100g,
        "fat_per_100g": food.fat_per_100g,
    }


def _inventory_totals(user_id: int) -> dict[int, float]:
    return {
        row.food_id: row.quantity
        for row in Inventory.query.filter_by(user_id=user_id).all()
    }


def _recipe_json(recipe: Recipe, totals: dict[int, float]) -> dict:
    ingredients = (
        db.session.query(RecipeIngredient, FoodItem)
        .join(FoodItem, RecipeIngredient.food_id == FoodItem.id)
        .filter(RecipeIngredient.recipe_id == recipe.id)
        .all()
    )
    missing = []
    available = []
    for ingredient, food in ingredients:
        required = ingredient.quantity / max(recipe.servings, 1)
        current = totals.get(food.id, 0)
        item = {
            "food_id": food.id,
            "name": food.name,
            "required": round(required, 1),
            "available": round(current, 1),
            "unit": ingredient.unit,
        }
        if current >= required:
            available.append(item)
        else:
            item["shortage"] = round(required - current, 1)
            missing.append(item)
    return {
        "id": recipe.id,
        "name": recipe.name,
        "description": recipe.description,
        "calories_per_serving": round(recipe.total_calories / max(recipe.servings, 1)),
        "prep_time": recipe.prep_time,
        "cook_time": recipe.cook_time,
        "difficulty": recipe.difficulty,
        "category": recipe.category,
        "can_make": len(missing) == 0,
        "matching_count": len(available),
        "ingredient_count": len(ingredients),
        "available_ingredients": available,
        "missing_ingredients": missing,
    }


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "service": "tubi26-flask"})


@app.post("/api/user")
def save_user():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    if len(username) < 3 or len(username) > 64:
        return _error("Kullanıcı adı 3-64 karakter arasında olmalı.")
    try:
        age = int(_number(data.get("age"), "Yaş", minimum=13))
        weight = _number(data.get("weight"), "Kilo", minimum=30)
        height = _number(data.get("height"), "Boy", minimum=120)
    except ValueError as exc:
        return _error(str(exc))

    user_id = data.get("id")
    user = db.session.get(User, int(user_id)) if user_id else User.query.filter_by(username=username).first()
    if user is None:
        user = User(username=username)
        db.session.add(user)
    elif user.username != username:
        conflict = User.query.filter_by(username=username).first()
        if conflict and conflict.id != user.id:
            return _error("Bu kullanıcı adı başka bir profile ait.", 409)
        user.username = username

    gender = str(data.get("gender", "other"))
    activity = str(data.get("activity_level", "light"))
    preferences = data.get("preferences") if isinstance(data.get("preferences"), list) else []
    user.age = age
    user.weight = weight
    user.height = height
    user.gender = gender if gender in {"male", "female", "other"} else "other"
    user.activity_level = activity
    user.daily_calories = _calculate_calories(age, weight, height, user.gender, activity)
    user.preferences_json = json.dumps(preferences, ensure_ascii=False)
    db.session.commit()
    return jsonify({"ok": True, "user": _user_json(user)})


@app.get("/api/user/<int:user_id>")
def get_user(user_id: int):
    user = db.session.get(User, user_id)
    if not user:
        return _error("Kullanıcı bulunamadı.", 404)
    return jsonify({"ok": True, "user": _user_json(user)})


@app.get("/api/foods")
def get_foods():
    foods = FoodItem.query.order_by(FoodItem.category, FoodItem.name).all()
    return jsonify({"ok": True, "foods": [_food_json(food) for food in foods]})


@app.get("/api/inventory/<int:user_id>")
def get_inventory(user_id: int):
    rows = (
        db.session.query(Inventory, FoodItem)
        .join(FoodItem, Inventory.food_id == FoodItem.id)
        .filter(Inventory.user_id == user_id)
        .order_by(Inventory.added_at.desc())
        .all()
    )
    items = [
        {
            "id": item.id,
            "food_id": food.id,
            "name": food.name,
            "category": food.category,
            "quantity": item.quantity,
            "expiry_date": item.expiry_date.isoformat() if item.expiry_date else None,
            "added_at": item.added_at.isoformat(),
            "calories": round(food.calories_per_100g * item.quantity / 100),
        }
        for item, food in rows
    ]
    return jsonify({"ok": True, "items": items})


@app.post("/api/inventory")
def add_inventory():
    data = request.get_json(silent=True) or {}
    try:
        user_id = int(data.get("user_id"))
        food_id = int(data.get("food_id"))
        quantity = _number(data.get("quantity"), "Miktar", minimum=0.1)
        expiry = _date(data.get("expiry_date"), "Son kullanma tarihi")
    except (TypeError, ValueError) as exc:
        return _error(str(exc))
    if not db.session.get(User, user_id) or not db.session.get(FoodItem, food_id):
        return _error("Kullanıcı veya gıda bulunamadı.", 404)
    item = Inventory.query.filter_by(user_id=user_id, food_id=food_id).first()
    if item:
        item.quantity += quantity
        if expiry and (not item.expiry_date or expiry < item.expiry_date):
            item.expiry_date = expiry
    else:
        item = Inventory(user_id=user_id, food_id=food_id, quantity=quantity, expiry_date=expiry)
        db.session.add(item)
    db.session.commit()
    return jsonify({"ok": True, "item_id": item.id})


@app.delete("/api/inventory/<int:item_id>")
def delete_inventory(item_id: int):
    item = db.session.get(Inventory, item_id)
    if not item:
        return _error("Envanter öğesi bulunamadı.", 404)
    requested_user = request.args.get("user_id", type=int)
    if requested_user is None or item.user_id != requested_user:
        return _error("Bu öğe için yetkiniz yok.", 403)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})


@app.get("/api/recipes/<int:user_id>")
def get_recipes(user_id: int):
    if not db.session.get(User, user_id):
        return _error("Kullanıcı bulunamadı.", 404)
    totals = _inventory_totals(user_id)
    recipes = [_recipe_json(recipe, totals) for recipe in Recipe.query.order_by(Recipe.name).all()]
    recipes.sort(key=lambda item: (item["can_make"], item["matching_count"]), reverse=True)
    return jsonify({"ok": True, "recipes": recipes})


def _sync_shopping_suggestions(user_id: int) -> None:
    totals = _inventory_totals(user_id)
    shortages: dict[int, dict] = {}
    for recipe in Recipe.query.all():
        recipe_data = _recipe_json(recipe, totals)
        for item in recipe_data["missing_ingredients"]:
            current = shortages.get(item["food_id"])
            if current is None or item["shortage"] > current["quantity"]:
                shortages[item["food_id"]] = {
                    "quantity": item["shortage"],
                    "reason": f"{recipe.name} tarifi için",
                }
    existing = {item.food_id: item for item in ShoppingItem.query.filter_by(user_id=user_id).all()}
    for food_id, shortage in shortages.items():
        item = existing.get(food_id)
        if item is None:
            db.session.add(
                ShoppingItem(
                    user_id=user_id,
                    food_id=food_id,
                    quantity=shortage["quantity"],
                    reason=shortage["reason"],
                    source="recipe",
                )
            )
        elif item.source == "recipe" and not item.checked:
            item.quantity = shortage["quantity"]
            item.reason = shortage["reason"]
    for food_id, item in existing.items():
        if item.source == "recipe" and food_id not in shortages and not item.checked:
            db.session.delete(item)
    db.session.commit()


@app.get("/api/shopping/<int:user_id>")
def get_shopping(user_id: int):
    if not db.session.get(User, user_id):
        return _error("Kullanıcı bulunamadı.", 404)
    _sync_shopping_suggestions(user_id)
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


@app.post("/api/shopping")
def add_shopping():
    data = request.get_json(silent=True) or {}
    try:
        user_id = int(data.get("user_id"))
        food_id = int(data.get("food_id"))
        quantity = _number(data.get("quantity", 1), "Miktar", minimum=0.1)
    except (TypeError, ValueError) as exc:
        return _error(str(exc))
    if not db.session.get(User, user_id) or not db.session.get(FoodItem, food_id):
        return _error("Kullanıcı veya gıda bulunamadı.", 404)
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


@app.patch("/api/shopping/<int:item_id>")
def update_shopping(item_id: int):
    item = db.session.get(ShoppingItem, item_id)
    data = request.get_json(silent=True) or {}
    if not item:
        return _error("Alışveriş öğesi bulunamadı.", 404)
    if item.user_id != data.get("user_id"):
        return _error("Bu öğe için yetkiniz yok.", 403)
    item.checked = bool(data.get("checked"))
    db.session.commit()
    return jsonify({"ok": True})


@app.delete("/api/shopping/<int:item_id>")
def delete_shopping(item_id: int):
    item = db.session.get(ShoppingItem, item_id)
    if not item:
        return _error("Alışveriş öğesi bulunamadı.", 404)
    user_id = request.args.get("user_id", type=int)
    if user_id is None or item.user_id != user_id:
        return _error("Bu öğe için yetkiniz yok.", 403)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"ok": True})


@app.post("/api/meals")
def add_meal():
    data = request.get_json(silent=True) or {}
    try:
        meal = Meal(
            user_id=int(data.get("user_id")),
            name=str(data.get("name", "")).strip(),
            calories=int(_number(data.get("calories"), "Kalori", minimum=0)),
            meal_date=_date(data.get("date")) or date.today(),
            meal_type=str(data.get("meal_type") or "snack"),
        )
    except (TypeError, ValueError) as exc:
        return _error(str(exc))
    if not meal.name or not db.session.get(User, meal.user_id):
        return _error("Kullanıcı ve öğün adı gerekli.")
    db.session.add(meal)
    db.session.commit()
    return jsonify({"ok": True, "id": meal.id})


@app.post("/api/activities")
def add_activity():
    data = request.get_json(silent=True) or {}
    try:
        activity = Activity(
            user_id=int(data.get("user_id")),
            name=str(data.get("name", "")).strip(),
            burned_calories=int(_number(data.get("burned_calories"), "Yakılan kalori", minimum=0)),
            activity_date=_date(data.get("date")) or date.today(),
        )
    except (TypeError, ValueError) as exc:
        return _error(str(exc))
    if not activity.name or not db.session.get(User, activity.user_id):
        return _error("Kullanıcı ve aktivite adı gerekli.")
    db.session.add(activity)
    db.session.commit()
    return jsonify({"ok": True, "id": activity.id})


@app.get("/api/dashboard/<int:user_id>")
def dashboard(user_id: int):
    user = db.session.get(User, user_id)
    if not user:
        return _error("Kullanıcı bulunamadı.", 404)
    today = date.today()
    consumed = sum(item.calories for item in Meal.query.filter_by(user_id=user_id, meal_date=today).all())
    burned = sum(item.burned_calories for item in Activity.query.filter_by(user_id=user_id, activity_date=today).all())
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
    totals = _inventory_totals(user_id)
    recipes = [_recipe_json(recipe, totals) for recipe in Recipe.query.all()]
    recipes.sort(key=lambda item: (item["can_make"], item["matching_count"]), reverse=True)
    return jsonify(
        {
            "ok": True,
            "profile": _user_json(user),
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


def _local_chat_reply(user_id: int, message: str) -> str:
    lowered = message.lower()
    inventory = get_inventory(user_id).get_json().get("items", [])
    recipes = get_recipes(user_id).get_json().get("recipes", [])
    if "envanter" in lowered or "malzeme" in lowered:
        if not inventory:
            return "Envanteriniz boş. Malzeme Ekle ekranından ilk ürününüzü ekleyebilirsiniz."
        summary = ", ".join(f"{item['name']} ({item['quantity']:g} g)" for item in inventory[:8])
        return f"Envanterinizde şunlar var: {summary}."
    if "kalori" in lowered:
        user = db.session.get(User, user_id)
        return f"Günlük hedefiniz {user.daily_calories} kcal. Dashboard üzerinden günlük dengeyi takip edebilirsiniz."
    cookable = [recipe for recipe in recipes if recipe["can_make"]]
    if cookable:
        recipe = cookable[0]
        return f"Elinizdeki malzemelerle {recipe['name']} yapabilirsiniz. Yaklaşık {recipe['calories_per_serving']} kcal ve toplam hazırlama süresi {recipe['prep_time'] + recipe['cook_time']} dakika."
    if recipes:
        recipe = recipes[0]
        missing = ", ".join(item["name"] for item in recipe["missing_ingredients"][:4])
        return f"{recipe['name']} en yakın seçenek. Eksik malzemeler: {missing}. Bunları alışveriş listesinde görebilirsiniz."
    return "Tarif önerebilmem için önce envanterinize birkaç malzeme ekleyin."


@app.post("/api/chat")
def chat():
    data = request.get_json(silent=True) or {}
    try:
        user_id = int(data.get("user_id"))
    except (TypeError, ValueError):
        return _error("Geçerli bir kullanıcı gerekli.")
    message = str(data.get("message", "")).strip()
    if not message or len(message) > 1000:
        return _error("Mesaj 1-1000 karakter arasında olmalı.")
    user = db.session.get(User, user_id)
    if not user:
        return _error("Kullanıcı bulunamadı.", 404)

    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai

            inventory = get_inventory(user_id).get_json().get("items", [])
            recipes = get_recipes(user_id).get_json().get("recipes", [])
            context = json.dumps(
                {
                    "profile": _user_json(user),
                    "inventory": inventory,
                    "recipes": recipes,
                },
                ensure_ascii=False,
            )
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                system_instruction=(
                    "Sen Tubi26 mutfak asistanısın. Yalnızca verilen profil, envanter ve tarif verisini kullan. "
                    "Kısa, uygulanabilir ve Türkçe yanıt ver. Tıbbi tavsiye verme; kalori değerlerinin tahmini olduğunu belirt."
                ),
            )
            response = model.generate_content(f"Bağlam: {context}\n\nKullanıcı sorusu: {message}")
            text = getattr(response, "text", None)
            if text:
                return jsonify({"ok": True, "text": text, "source": "gemini"})
        except Exception as exc:
            app.logger.warning("Gemini yanıtı alınamadı: %s", exc)

    return jsonify({"ok": True, "text": _local_chat_reply(user_id, message), "source": "local"})


@app.get("/")
def serve_root():
    if (DIST_DIR / "index.html").exists():
        return send_from_directory(DIST_DIR, "index.html")
    return jsonify(
        {
            "ok": True,
            "message": "Tubi26 API çalışıyor. Geliştirme arayüzü için npm run dev komutunu kullanın.",
        }
    )


@app.get("/<path:path>")
def serve_spa(path: str):
    if path.startswith("api/"):
        return _error("Endpoint bulunamadı.", 404)
    requested = DIST_DIR / path
    if requested.is_file():
        return send_from_directory(DIST_DIR, path)
    if (DIST_DIR / "index.html").exists():
        return send_from_directory(DIST_DIR, "index.html")
    return _error("Frontend build bulunamadı.", 404)


def seed_data() -> None:
    foods = [
        ("Tavuk Göğsü", "protein", 165, 31, 0, 3.6),
        ("Somon", "protein", 208, 25, 0, 12),
        ("Yumurta", "protein", 155, 13, 1.1, 11),
        ("Pirinç", "carb", 130, 2.7, 28, 0.3),
        ("Kinoa", "carb", 120, 4.4, 21.3, 1.9),
        ("Patates", "carb", 77, 2, 17, 0.1),
        ("Brokoli", "vegetable", 34, 2.8, 7, 0.4),
        ("Domates", "vegetable", 18, 0.9, 3.9, 0.2),
        ("Ispanak", "vegetable", 23, 2.9, 3.6, 0.4),
        ("Biber", "vegetable", 31, 1, 6, 0.3),
        ("Soğan", "vegetable", 40, 1.1, 9.3, 0.1),
        ("Avokado", "fruit", 160, 2, 9, 15),
        ("Elma", "fruit", 52, 0.3, 14, 0.2),
        ("Süt", "dairy", 42, 3.4, 5, 1),
        ("Yoğurt", "dairy", 59, 10, 3.6, 0.4),
    ]
    for name, category, calories, protein, carbs, fat in foods:
        if not FoodItem.query.filter_by(name=name).first():
            db.session.add(
                FoodItem(
                    name=name,
                    category=category,
                    calories_per_100g=calories,
                    protein_per_100g=protein,
                    carbs_per_100g=carbs,
                    fat_per_100g=fat,
                )
            )
    db.session.commit()

    recipe_specs = [
        (
            "Tavuklu Kinoa Salatası",
            "Protein ve lif açısından dengeli, pratik bir ana öğün.",
            620,
            2,
            15,
            20,
            "easy",
            "lunch",
            {"Tavuk Göğsü": 300, "Kinoa": 200, "Domates": 160, "Avokado": 100},
        ),
        (
            "Sebzeli Omlet",
            "Yumurta, süt ve taze sebzelerle hızlı kahvaltı.",
            340,
            1,
            8,
            10,
            "easy",
            "breakfast",
            {"Yumurta": 120, "Süt": 50, "Ispanak": 60, "Domates": 60},
        ),
        (
            "Brokoli Çorbası",
            "Hafif ve doyurucu sebze çorbası.",
            360,
            2,
            10,
            25,
            "easy",
            "lunch",
            {"Brokoli": 300, "Süt": 250, "Patates": 120, "Soğan": 60},
        ),
        (
            "Fırında Somon ve Sebzeler",
            "Omega-3 yönünden zengin somon ve fırın sebzeleri.",
            760,
            2,
            12,
            30,
            "medium",
            "dinner",
            {"Somon": 360, "Brokoli": 200, "Patates": 250, "Biber": 100},
        ),
        (
            "Yoğurtlu Meyve Kasesi",
            "Hızlı ara öğün veya hafif kahvaltı.",
            300,
            1,
            5,
            0,
            "easy",
            "snack",
            {"Yoğurt": 200, "Elma": 120},
        ),
    ]
    for name, description, calories, servings, prep, cook, difficulty, category, ingredients in recipe_specs:
        recipe = Recipe.query.filter_by(name=name).first()
        if not recipe:
            recipe = Recipe(
                name=name,
                description=description,
                total_calories=calories,
                servings=servings,
                prep_time=prep,
                cook_time=cook,
                difficulty=difficulty,
                category=category,
            )
            db.session.add(recipe)
            db.session.flush()
        for food_name, quantity in ingredients.items():
            food = FoodItem.query.filter_by(name=food_name).first()
            exists = RecipeIngredient.query.filter_by(recipe_id=recipe.id, food_id=food.id).first()
            if not exists:
                db.session.add(
                    RecipeIngredient(recipe_id=recipe.id, food_id=food.id, quantity=quantity)
                )
    db.session.commit()


def initialize_database() -> None:
    with app.app_context():
        db.create_all()
        seed_data()


if __name__ == "__main__":
    initialize_database()
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=os.getenv("FLASK_DEBUG") == "1")
