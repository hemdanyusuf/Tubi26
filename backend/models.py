"""Database models for Tubi26."""

from datetime import date, datetime

from sqlalchemy import UniqueConstraint

from .extensions import db


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
