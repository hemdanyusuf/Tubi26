"""Tubi26 Flask application entry point."""

from __future__ import annotations

import os
import secrets
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask

from .extensions import db
from .routes import api, web
from .services import seed_data


BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / "dist"


def create_app(test_config: dict | None = None) -> Flask:
    load_dotenv(BASE_DIR / ".env")
    app = Flask(__name__, static_folder=None)
    app.config.from_mapping(
        SECRET_KEY=os.getenv("FLASK_SECRET_KEY") or secrets.token_hex(32),
        SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL", "sqlite:///tubi26.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_AS_ASCII=False,
        DIST_DIR=DIST_DIR,
    )
    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    app.register_blueprint(api)
    app.register_blueprint(web)
    return app


def initialize_database(flask_app: Flask | None = None) -> None:
    target_app = flask_app or app
    with target_app.app_context():
        db.create_all()
        seed_data()


app = create_app()


if __name__ == "__main__":
    initialize_database()
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(
        host="127.0.0.1",
        port=port,
        debug=os.getenv("FLASK_DEBUG") == "1",
    )
