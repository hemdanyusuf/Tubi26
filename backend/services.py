"""Validation, serialization and domain services for Tubi26."""

from __future__ import annotations

import json
import os
from datetime import date, datetime

from flask import current_app

from .extensions import db
from .models import (
    FoodItem,
    Inventory,
    Recipe,
    RecipeIngredient,
    ShoppingItem,
    User,
)


def number_value(value, field: str, *, minimum: float | None = None) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field} sayısal olmalı.") from exc
    if minimum is not None and parsed < minimum:
        raise ValueError(f"{field} en az {minimum} olmalı.")
    return parsed


def date_value(value, field: str = "Tarih") -> date | None:
    if value in (None, ""):
        return None
    try:
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except ValueError as exc:
        raise ValueError(f"{field} YYYY-MM-DD formatında olmalı.") from exc


def calculate_calories(
    age: int, weight: float, height: float, gender: str, activity: str
) -> int:
    male_bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    female_bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age
    if gender == "male":
        bmr = male_bmr
    elif gender == "female":
        bmr = female_bmr
    else:
        bmr = (male_bmr + female_bmr) / 2
    factors = {
        "low": 1.2,
        "light": 1.375,
        "medium": 1.55,
        "high": 1.725,
        "pro": 1.9,
    }
    return max(1200, int(bmr * factors.get(activity, 1.375)))


def user_json(user: User) -> dict:
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


def food_json(food: FoodItem) -> dict:
    return {
        "id": food.id,
        "name": food.name,
        "category": food.category,
        "calories_per_100g": food.calories_per_100g,
        "protein_per_100g": food.protein_per_100g,
        "carbs_per_100g": food.carbs_per_100g,
        "fat_per_100g": food.fat_per_100g,
    }


def inventory_totals(user_id: int) -> dict[int, float]:
    return {
        row.food_id: row.quantity
        for row in Inventory.query.filter_by(user_id=user_id).all()
    }


def recipe_json(recipe: Recipe, totals: dict[int, float]) -> dict:
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


def inventory_items(user_id: int) -> list[dict]:
    rows = (
        db.session.query(Inventory, FoodItem)
        .join(FoodItem, Inventory.food_id == FoodItem.id)
        .filter(Inventory.user_id == user_id)
        .order_by(Inventory.added_at.desc())
        .all()
    )
    return [
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


def recipes_for_user(user_id: int) -> list[dict]:
    totals = inventory_totals(user_id)
    recipes = [
        recipe_json(recipe, totals) for recipe in Recipe.query.order_by(Recipe.name).all()
    ]
    recipes.sort(
        key=lambda item: (item["can_make"], item["matching_count"]), reverse=True
    )
    return recipes


def sync_shopping_suggestions(user_id: int) -> None:
    totals = inventory_totals(user_id)
    shortages: dict[int, dict] = {}
    for recipe in Recipe.query.all():
        for item in recipe_json(recipe, totals)["missing_ingredients"]:
            current = shortages.get(item["food_id"])
            if current is None or item["shortage"] > current["quantity"]:
                shortages[item["food_id"]] = {
                    "quantity": item["shortage"],
                    "reason": f"{recipe.name} tarifi için",
                }
    existing = {
        item.food_id: item
        for item in ShoppingItem.query.filter_by(user_id=user_id).all()
    }
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


def local_chat_reply(user: User, message: str) -> str:
    lowered = message.lower()
    inventory = inventory_items(user.id)
    recipes = recipes_for_user(user.id)
    if "envanter" in lowered or "malzeme" in lowered:
        if not inventory:
            return "Envanteriniz boş. Malzeme Ekle ekranından ilk ürününüzü ekleyebilirsiniz."
        summary = ", ".join(
            f"{item['name']} ({item['quantity']:g} g)" for item in inventory[:8]
        )
        return f"Envanterinizde şunlar var: {summary}."
    if "kalori" in lowered:
        return (
            f"Günlük hedefiniz {user.daily_calories} kcal. Dashboard üzerinden "
            "günlük dengeyi takip edebilirsiniz."
        )
    cookable = [recipe for recipe in recipes if recipe["can_make"]]
    if cookable:
        recipe = cookable[0]
        duration = recipe["prep_time"] + recipe["cook_time"]
        return (
            f"Elinizdeki malzemelerle {recipe['name']} yapabilirsiniz. Yaklaşık "
            f"{recipe['calories_per_serving']} kcal ve toplam hazırlama süresi "
            f"{duration} dakika."
        )
    if recipes:
        recipe = recipes[0]
        missing = ", ".join(item["name"] for item in recipe["missing_ingredients"][:4])
        return (
            f"{recipe['name']} en yakın seçenek. Eksik malzemeler: {missing}. "
            "Bunları alışveriş listesinde görebilirsiniz."
        )
    return "Tarif önerebilmem için önce envanterinize birkaç malzeme ekleyin."


def chat_reply(user: User, message: str) -> tuple[str, str]:
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai

            context = json.dumps(
                {
                    "profile": user_json(user),
                    "inventory": inventory_items(user.id),
                    "recipes": recipes_for_user(user.id),
                },
                ensure_ascii=False,
            )
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                system_instruction=(
                    "Sen Tubi26 mutfak asistanısın. Yalnızca verilen profil, "
                    "envanter ve tarif verisini kullan. Kısa, uygulanabilir ve "
                    "Türkçe yanıt ver. Tıbbi tavsiye verme; kalori değerlerinin "
                    "tahmini olduğunu belirt."
                ),
            )
            response = model.generate_content(
                f"Bağlam: {context}\n\nKullanıcı sorusu: {message}"
            )
            text = getattr(response, "text", None)
            if text:
                return text, "gemini"
        except Exception as exc:  # pragma: no cover - depends on external provider
            current_app.logger.warning("Gemini yanıtı alınamadı: %s", exc)
    return local_chat_reply(user, message), "local"


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
    for (
        name,
        description,
        calories,
        servings,
        prep,
        cook,
        difficulty,
        category,
        ingredients,
    ) in recipe_specs:
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
            exists = RecipeIngredient.query.filter_by(
                recipe_id=recipe.id, food_id=food.id
            ).first()
            if not exists:
                db.session.add(
                    RecipeIngredient(
                        recipe_id=recipe.id, food_id=food.id, quantity=quantity
                    )
                )
    db.session.commit()
