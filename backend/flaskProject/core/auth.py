from __future__ import annotations

from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Any

import jwt
from argon2 import PasswordHasher
from flask import current_app, g, jsonify, request
from sqlalchemy import select

from .extensions import db
from .models import Customer

ph = PasswordHasher()


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return ph.verify(password_hash, password)
    except Exception:
        return False


def create_access_token(subject_id: int, username: str, role: str) -> str:
    payload = {
        "sub": subject_id,
        "username": username,
        "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=current_app.config["JWT_ACCESS_TOKEN_TTL_MINUTES"]),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm=current_app.config["JWT_ALGORITHM"])


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        current_app.config["JWT_SECRET_KEY"],
        algorithms=[current_app.config["JWT_ALGORITHM"]],
    )


def get_bearer_token() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip()


def auth_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        token = get_bearer_token()
        if not token:
            return jsonify({"error": "Authentication required."}), 401

        try:
            payload = decode_access_token(token)
            user = db.session.execute(select(Customer).where(Customer.id == payload["sub"])).scalar_one_or_none()
            if user is None:
                return jsonify({"error": "User not found."}), 401
            g.current_user = user
        except Exception:
            return jsonify({"error": "Invalid or expired token."}), 401

        return view(*args, **kwargs)

    return wrapped


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        token = get_bearer_token()
        if not token:
            return jsonify({"error": "Authentication required."}), 401

        try:
            payload = decode_access_token(token)
            user = db.session.execute(select(Customer).where(Customer.id == payload["sub"])).scalar_one_or_none()
            if user is None or user.role != "admin":
                return jsonify({"error": "Admin privileges required."}), 403
            g.current_user = user
        except Exception:
            return jsonify({"error": "Invalid or expired token."}), 401

        return view(*args, **kwargs)

    return wrapped
