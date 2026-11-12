from __future__ import annotations

import os
from getpass import getpass

os.environ["ENABLE_ORDER_WORKER"] = "false"

from core.app_factory import create_app
from core.auth import hash_password
from core.extensions import db
from core.models import Customer


def create_admin() -> None:
    username = input("Admin username: ").strip()
    password = getpass("Admin password (at least 16 characters): ")
    confirmation = getpass("Confirm admin password: ")
    if not username or len(password) < 16:
        raise SystemExit("Choose a username and a password of at least 16 characters.")
    if password != confirmation:
        raise SystemExit("Passwords do not match.")

    app = create_app()
    with app.app_context():
        existing = db.session.query(Customer).filter_by(username=username).first()
        if existing is not None and existing.role != "admin":
            raise SystemExit("That username belongs to a non-admin account; no account was changed.")

        if existing is not None:
            existing.password = hash_password(password)
        else:
            db.session.add(Customer(
                username=username,
                password=hash_password(password),
                role="admin",
                customer_type="premium",
                budget=0,
            ))
        db.session.commit()
        print(f"Admin account created or password updated for username: {username}")


if __name__ == "__main__":
    create_admin()
