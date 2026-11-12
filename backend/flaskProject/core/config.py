from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Config:
    APP_NAME = os.getenv("APP_NAME", "threadyol")
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_TTL_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_TTL_MINUTES", "60"))
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    ENABLE_ORDER_WORKER = os.getenv("ENABLE_ORDER_WORKER", "true").lower() in {"1", "true", "yes"}
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:3001",
        ).split(",")
        if origin.strip()
    ]
    JSON_SORT_KEYS = False


def get_config() -> type[Config]:
    return Config
