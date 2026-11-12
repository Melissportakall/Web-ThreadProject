from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy import create_engine

BASE_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = BASE_DIR / "backend" / "flaskProject"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from flask import Flask

from core.auth import hash_password
from core.extensions import db
from core.models import Customer, Product


def get_database_url() -> str:
    preferred = os.getenv("DATABASE_URL")
    if preferred and preferred.startswith("postgresql"):
        try:
            engine = create_engine(preferred)
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            return preferred
        except Exception:
            return "sqlite:////tmp/threadyol_seed.db"
    return preferred or "sqlite:////tmp/threadyol_seed.db"


def seed_demo() -> None:
    if os.getenv("APP_ENV") != "development":
        raise RuntimeError("Demo data may only be seeded when APP_ENV=development.")

    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = get_database_url()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()

        products = [
            Product(name="Laptop", stock=10, price=1200),
            Product(name="Mouse", stock=25, price=50),
            Product(name="Keyboard", stock=30, price=75),
            Product(name="Monitor", stock=12, price=800),
            Product(name="USB Hub", stock=40, price=20),
        ]

        known_usernames = {
            username
            for username, in db.session.query(Customer.username).all()
        }
        demo_customers = [
            ("premium1", "premium", 2000),
            ("standard1", "standard", 1200),
        ]
        for username, customer_type, budget in demo_customers:
            if username not in known_usernames:
                db.session.add(Customer(
                    username=username,
                    password=hash_password("pass123"),
                    role="customer",
                    customer_type=customer_type,
                    budget=budget,
                ))

        known_products = {
            name for name, in db.session.query(Product.name).all()
        }
        db.session.add_all(product for product in products if product.name not in known_products)
        db.session.commit()

        print("Seeded demo data:")
        print("- premium user: premium1 / pass123")
        print("- standard user: standard1 / pass123")
        print("- product catalog: 5 products with stock and prices")


if __name__ == "__main__":
    seed_demo()
