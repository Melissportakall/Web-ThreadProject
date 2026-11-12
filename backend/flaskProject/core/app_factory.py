from __future__ import annotations

import logging
from logging.config import dictConfig

from flask import Flask
from flask_cors import CORS
from sqlalchemy import select

from .config import get_config
from .extensions import db
from .logging_utils import JsonFormatter
from .models import Product
from .order_service import start_order_worker
from .routes import api


def _configure_logging() -> None:
    dictConfig({
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {"()": JsonFormatter},
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "json",
                "level": "INFO",
            }
        },
        "root": {
            "level": "INFO",
            "handlers": ["console"],
        },
    })


def seed_demo_data(app: Flask) -> None:
    with app.app_context():
        existing_products = db.session.execute(select(Product)).scalars().all()
        if not existing_products:
            db.session.add_all([
                Product(name="Audio Pro X9", stock=12, price=280, is_deleted=False),
                Product(name="ChargeDock Mini", stock=25, price=65, is_deleted=False),
                Product(name="Blue Cursor Pro", stock=18, price=95, is_deleted=False),
            ])

        db.session.commit()


def create_app() -> Flask:
    _configure_logging()

    app = Flask(__name__)
    app.config.from_object(get_config())
    missing_secrets = []
    for key in ("SECRET_KEY", "JWT_SECRET_KEY"):
        value = app.config.get(key)
        if not value or len(value) < 32 or value.startswith("replace-"):
            missing_secrets.append(key)
    missing_settings = [
        key for key in ("SQLALCHEMY_DATABASE_URI",)
        if not app.config.get(key)
    ]
    if (
        missing_secrets
        or missing_settings
        or app.config["SECRET_KEY"] == app.config["JWT_SECRET_KEY"]
    ):
        raise RuntimeError(
            "Set DATABASE_URL and set SECRET_KEY and JWT_SECRET_KEY to different, "
            "independently generated values of at least 32 characters before starting the API."
        )

    db.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
    )
    app.register_blueprint(api, url_prefix="/api/v1")

    with app.app_context():
        try:
            db.create_all()
            seed_demo_data(app)
        except Exception as exc:  # pragma: no cover - DB will be ready in Compose runtime.
            app.logger.warning("Database is not ready yet during app bootstrap: %s", exc)

    if app.config.get("ENABLE_ORDER_WORKER"):
        start_order_worker(app)
    return app
