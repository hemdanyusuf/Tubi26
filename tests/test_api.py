"""Integration tests for the public Tubi26 API contract."""

import pytest

from backend.app import create_app
from backend.extensions import db
from backend.services import seed_data


@pytest.fixture()
def app(monkeypatch):
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    flask_app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        }
    )
    with flask_app.app_context():
        db.create_all()
        seed_data()
    yield flask_app
    with flask_app.app_context():
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def create_user(client, username="test-kullanici"):
    response = client.post(
        "/api/user",
        json={
            "username": username,
            "age": 28,
            "weight": 72,
            "height": 178,
            "gender": "male",
            "activity_level": "medium",
            "preferences": ["protein"],
        },
    )
    assert response.status_code == 200
    return response.get_json()["user"]


def test_health_and_seeded_food_catalog(client):
    health = client.get("/api/health")
    foods = client.get("/api/foods")

    assert health.get_json() == {"ok": True, "service": "tubi26-flask"}
    assert foods.status_code == 200
    assert len(foods.get_json()["foods"]) == 15


def test_user_validation_and_calorie_calculation(client):
    invalid = client.post(
        "/api/user",
        json={"username": "ab", "age": 12, "weight": 20, "height": 100},
    )
    user = create_user(client)

    assert invalid.status_code == 400
    assert invalid.get_json()["ok"] is False
    assert user["daily_calories"] > 1200
    assert user["preferences"] == ["protein"]


def test_inventory_add_merge_and_authorized_delete(client):
    user = create_user(client)
    food_id = client.get("/api/foods").get_json()["foods"][0]["id"]

    first = client.post(
        "/api/inventory",
        json={"user_id": user["id"], "food_id": food_id, "quantity": 100},
    )
    second = client.post(
        "/api/inventory",
        json={"user_id": user["id"], "food_id": food_id, "quantity": 50},
    )
    item_id = second.get_json()["item_id"]
    inventory = client.get(f"/api/inventory/{user['id']}").get_json()["items"]

    assert first.status_code == 200
    assert len(inventory) == 1
    assert inventory[0]["quantity"] == 150
    assert client.delete(f"/api/inventory/{item_id}?user_id=999").status_code == 403
    assert (
        client.delete(f"/api/inventory/{item_id}?user_id={user['id']}").status_code
        == 200
    )


def test_recipe_shopping_and_local_chat_flow(client):
    user = create_user(client)

    recipes = client.get(f"/api/recipes/{user['id']}")
    shopping = client.get(f"/api/shopping/{user['id']}")
    chat = client.post(
        "/api/chat", json={"user_id": user["id"], "message": "Kalori hedefim nedir?"}
    )

    assert recipes.status_code == 200
    assert len(recipes.get_json()["recipes"]) == 5
    assert shopping.status_code == 200
    assert any(item["source"] == "recipe" for item in shopping.get_json()["items"])
    assert chat.get_json()["source"] == "local"
    assert str(user["daily_calories"]) in chat.get_json()["text"]
