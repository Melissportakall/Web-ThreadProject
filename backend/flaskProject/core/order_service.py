from __future__ import annotations

import threading
import time
from datetime import datetime
from typing import Any

import redis
from flask import current_app
from sqlalchemy import select, text

from .extensions import db
from .models import Customer, LogEntry, Order, Product

_ORDER_QUEUE_KEY = "orders:priority"
_FALLBACK_QUEUE: dict[str, float] = {}


def get_redis_client() -> redis.Redis | None:
    try:
        return redis.Redis.from_url(current_app.config["REDIS_URL"], decode_responses=True)
    except Exception:
        return None


def _fallback_queue_map() -> dict[str, float]:
    if not hasattr(current_app, "extensions"):
        return _FALLBACK_QUEUE
    return current_app.extensions.setdefault("fallback_order_queue", _FALLBACK_QUEUE)


def calculate_priority(customer_type: str, waiting_seconds: float) -> float:
    base = 15 if (customer_type or "standard").lower() == "premium" else 10
    return float(base + (waiting_seconds * 0.5))


def enqueue_order(order: Order) -> Order:
    waiting_seconds = max(0.0, (datetime.utcnow() - order.created_at.replace(tzinfo=None)).total_seconds())
    priority_score = calculate_priority(order.customer_type_snapshot or "standard", waiting_seconds)
    order.priority_score = priority_score

    client = get_redis_client()
    if client is not None:
        try:
            client.zadd(_ORDER_QUEUE_KEY, {str(order.id): float(priority_score)})
            return order
        except Exception:
            pass

    _fallback_queue_map()[str(order.id)] = float(priority_score)
    return order


def get_queue_snapshot() -> list[dict[str, Any]]:
    client = get_redis_client()
    raw_entries = []
    if client is not None:
        try:
            raw_entries = client.zrevrange(_ORDER_QUEUE_KEY, 0, -1, withscores=True)
        except Exception:
            raw_entries = []
    if not raw_entries:
        fallback = _fallback_queue_map()
        raw_entries = [(str(item_id), float(score)) for item_id, score in sorted(fallback.items(), key=lambda kv: kv[1], reverse=True)]
    if not raw_entries:
        return []

    ordered_ids = [int(item_id) for item_id, _score in raw_entries]
    orders = db.session.execute(
        select(Order).where(Order.id.in_(ordered_ids)).order_by(Order.created_at.desc())
    ).scalars().all()

    order_map = {order.id: order for order in orders}
    queue = []
    for item_id, score in raw_entries:
        order = order_map.get(int(item_id))
        if order is None:
            continue
        queue.append({
            "order_id": order.id,
            "customer_id": order.customer_id,
            "product_id": order.product_id,
            "quantity": order.quantity,
            "total_price": order.total_price,
            "status": order.status,
            "priority_score": float(score),
            "customer_type": order.customer_type_snapshot,
        })
    return queue


def _log_order_event(customer_id: int, order_id: int, log_type: str, message: str) -> None:
    db.session.add(LogEntry(customer_id=customer_id, order_id=order_id, log_type=log_type, log_details=message))


def process_order(order_id: int) -> dict[str, Any]:
    order = db.session.execute(
        select(Order).where(Order.id == order_id).with_for_update()
    ).scalar_one_or_none()
    if order is None:
        return {"status": "missing", "order_id": order_id}

    if order.status != "PENDING":
        return {"status": order.status, "order_id": order_id}

    customer = db.session.get(Customer, order.customer_id)
    product = db.session.get(Product, order.product_id)

    if customer is None:
        order.status = "FAILED"
        order.failure_reason = "CUSTOMER_NOT_FOUND"
        _log_order_event(order.customer_id, order.id, "ERROR", "Customer not found for order.")
        db.session.commit()
        return {"status": "FAILED", "order_id": order_id, "reason": "CUSTOMER_NOT_FOUND"}

    if product is None or product.is_deleted:
        order.status = "FAILED"
        order.failure_reason = "PRODUCT_NOT_FOUND"
        _log_order_event(order.customer_id, order.id, "ERROR", "Product not found or deleted for order.")
        db.session.commit()
        return {"status": "FAILED", "order_id": order_id, "reason": "PRODUCT_NOT_FOUND"}

    order.customer_type_snapshot = customer.customer_type
    order.priority_score = calculate_priority(
        order.customer_type_snapshot,
        max(0.0, (datetime.utcnow() - order.created_at.replace(tzinfo=None)).total_seconds()),
    )

    try:
        product_update = db.session.execute(
            text("""
                UPDATE products
                SET stock = stock - :quantity
                WHERE id = :product_id AND stock >= :quantity
            """),
            {"quantity": order.quantity, "product_id": order.product_id},
        )
        if product_update.rowcount != 1:
            order.status = "FAILED"
            order.failure_reason = "INSUFFICIENT_STOCK"
            _log_order_event(order.customer_id, order.id, "ERROR", "Insufficient stock for order.")
            db.session.commit()
            return {"status": "FAILED", "order_id": order_id, "reason": "INSUFFICIENT_STOCK"}

        customer_update = db.session.execute(
            text("""
                UPDATE customers
                SET budget = budget - :total_price
                WHERE id = :customer_id AND budget >= :total_price
            """),
            {"total_price": order.total_price, "customer_id": order.customer_id},
        )
        if customer_update.rowcount != 1:
            raise RuntimeError("INSUFFICIENT_BUDGET")

        customer.total_spent += order.total_price
        order.status = "COMPLETED"
        order.failure_reason = None
        _log_order_event(order.customer_id, order.id, "INFO", f"Order processed successfully for product {product.name}.")
        db.session.commit()
        return {"status": "COMPLETED", "order_id": order_id}
    except Exception as exc:
        db.session.rollback()
        order.status = "FAILED"
        order.failure_reason = "INSUFFICIENT_BUDGET" if "BUDGET" in str(exc) else "DATABASE_ERROR"
        _log_order_event(order.customer_id, order.id, "ERROR", f"Order failed: {str(exc)}")
        db.session.commit()
        return {"status": "FAILED", "order_id": order_id, "reason": order.failure_reason}


def process_next_order() -> dict[str, Any] | None:
    client = get_redis_client()
    top = []
    if client is not None:
        try:
            top = client.zrevrange(_ORDER_QUEUE_KEY, 0, 0, withscores=True)
        except Exception:
            top = []
    if not top:
        fallback = _fallback_queue_map()
        if not fallback:
            return None
        order_id_raw = max(fallback, key=lambda key: float(fallback[key]))
        score = float(fallback.pop(order_id_raw))
        order_id = int(order_id_raw)
    else:
        order_id_raw, score = top[0]
        order_id = int(order_id_raw)
        if client is not None:
            try:
                client.zrem(_ORDER_QUEUE_KEY, order_id_raw)
            except Exception:
                pass
        else:
            _fallback_queue_map().pop(order_id_raw, None)

    try:
        outcome = process_order(order_id)
    except Exception as exc:  # pragma: no cover - runtime side effect only
        order = db.session.get(Order, order_id)
        if order is not None:
            order.status = "FAILED"
            order.failure_reason = "DATABASE_ERROR"
            _log_order_event(order.customer_id, order.id, "ERROR", f"Database processing error: {exc}")
            db.session.commit()
        return {"status": "FAILED", "order_id": order_id, "reason": "DATABASE_ERROR"}

    return {"order_id": order_id, "score": float(score), **outcome}


def start_order_worker(app) -> None:
    if app.extensions.get("order_worker_started"):
        return

    app.extensions["order_worker_started"] = True

    def worker_loop() -> None:
        while True:
            try:
                with app.app_context():
                    process_next_order()
            except Exception as exc:  # pragma: no cover - worker loop guard
                app.logger.exception("Order worker failed: %s", exc)
            time.sleep(1)

    thread = threading.Thread(target=worker_loop, name="threadyol-order-worker", daemon=True)
    thread.start()

