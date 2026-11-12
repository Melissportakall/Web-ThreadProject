from __future__ import annotations

from pathlib import Path

from flask import Blueprint, current_app, g, jsonify, request, send_file
from sqlalchemy import select, text

from .auth import admin_required, auth_required, create_access_token, hash_password, verify_password
from .extensions import db
from .models import Customer, LogEntry, Order, Product
from .order_service import enqueue_order, get_queue_snapshot, process_next_order

api = Blueprint("api", __name__)


@api.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "service": current_app.config.get("APP_NAME", "threadyol"),
        "database": "pending-check",
    })


@api.get("/docs/openapi.yaml")
def openapi_yaml():
    openapi_path = Path(__file__).resolve().parents[3] / "docs" / "openapi" / "threadyol-openapi.yaml"
    return send_file(openapi_path, mimetype="application/yaml")


@api.get("/ready")
def ready():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({
            "status": "ready",
            "service": current_app.config.get("APP_NAME", "threadyol"),
            "database": "ok",
        })
    except Exception as exc:  # pragma: no cover - runtime health check only
        current_app.logger.warning("Database readiness check failed: %s", exc)
        return jsonify({
            "status": "not_ready",
            "service": current_app.config.get("APP_NAME", "threadyol"),
            "database": "error",
            "details": "Database check failed.",
        }), 503


@api.post("/auth/register")
def register_user():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        return jsonify({"error": "username and password are required."}), 400

    existing_user = db.session.execute(select(Customer).where(Customer.username == username)).scalar_one_or_none()
    if existing_user is not None:
        return jsonify({"error": "This username is already in use."}), 409

    user = Customer(
        username=username,
        password=hash_password(password),
        name=payload.get("name"),
        surname=payload.get("surname"),
        role="customer",
        budget=int(payload.get("budget") or 0),
        customer_type="standard",
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully.",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "customer_type": user.customer_type,
        },
    }), 201


@api.post("/auth/login")
def login_user():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        return jsonify({"error": "username and password are required."}), 400

    user = db.session.execute(select(Customer).where(Customer.username == username)).scalar_one_or_none()
    if user is None or not verify_password(password, user.password):
        return jsonify({"error": "Invalid username or password."}), 401

    token = create_access_token(user.id, user.username, user.role)
    return jsonify({
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "customer_type": user.customer_type,
        },
    })


@api.get("/auth/me")
@auth_required
def current_user_profile():
    user = g.current_user
    return jsonify({
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "surname": user.surname,
        "role": user.role,
        "customer_type": user.customer_type,
        "budget": user.budget,
        "total_spent": user.total_spent,
    })


@api.get("/customers/me")
@auth_required
def customer_profile():
    user = g.current_user
    return jsonify({
        "id": user.id,
        "username": user.username,
        "customer_type": user.customer_type,
        "budget": user.budget,
        "total_spent": user.total_spent,
    })


@api.get("/customers")
@admin_required
def list_customers():
    customers = db.session.execute(
        select(Customer).order_by(Customer.id.asc())
    ).scalars().all()

    return jsonify([
        {
            "id": customer.id,
            "username": customer.username,
            "name": customer.name,
            "surname": customer.surname,
            "role": customer.role,
            "customer_type": customer.customer_type,
            "budget": customer.budget,
            "total_spent": customer.total_spent,
        }
        for customer in customers
    ])


@api.get("/products")
def list_products():
    products = db.session.execute(
        select(Product).where(Product.is_deleted.is_(False)).order_by(Product.id.asc())
    ).scalars().all()

    return jsonify([
        {
            "id": product.id,
            "name": product.name,
            "stock": product.stock,
            "price": product.price,
            "is_deleted": product.is_deleted,
        }
        for product in products
    ])


@api.post("/orders")
@auth_required
def create_order():
    payload = request.get_json(silent=True) or {}
    product_id = payload.get("product_id")
    quantity = int(payload.get("quantity", 1) or 1)

    if not product_id:
        return jsonify({"error": "product_id is required."}), 400
    if not 1 <= quantity <= 5:
        return jsonify({"error": "Order quantity must be between 1 and 5."}), 400

    product = db.session.get(Product, product_id)
    if product is None or product.is_deleted:
        return jsonify({"error": "Product not found."}), 404

    order = Order(
        customer_id=g.current_user.id,
        product_id=product.id,
        quantity=quantity,
        total_price=product.price * quantity,
        status="PENDING",
        customer_type_snapshot=g.current_user.customer_type,
        priority_score=0.0,
    )
    db.session.add(order)
    db.session.commit()
    enqueue_order(order)
    db.session.commit()

    return jsonify({
        "message": "Order queued successfully.",
        "order": {
            "id": order.id,
            "status": order.status,
            "product_id": order.product_id,
            "quantity": order.quantity,
            "total_price": order.total_price,
            "priority_score": order.priority_score,
        },
    }), 201


@api.get("/orders/me")
@auth_required
def my_orders():
    orders = db.session.execute(
        select(Order).where(Order.customer_id == g.current_user.id).order_by(Order.created_at.desc())
    ).scalars().all()

    return jsonify([
        {
            "id": order.id,
            "product_id": order.product_id,
            "quantity": order.quantity,
            "total_price": order.total_price,
            "status": order.status,
            "priority_score": order.priority_score,
            "failure_reason": order.failure_reason,
            "customer_type": order.customer_type_snapshot,
            "created_at": order.created_at.isoformat(),
        }
        for order in orders
    ])


@api.get("/orders/queue")
@admin_required
def order_queue():
    return jsonify({"items": get_queue_snapshot()})


@api.post("/orders/process-next")
@admin_required
def process_next_order_route():
    result = process_next_order()
    if result is None:
        return jsonify({"status": "empty_queue"})
    return jsonify(result)


@api.get("/orders/<int:order_id>")
@auth_required
def get_order(order_id: int):
    order = db.session.get(Order, order_id)
    if order is None:
        return jsonify({"error": "Order not found."}), 404
    if order.customer_id != g.current_user.id and g.current_user.role != "admin":
        return jsonify({"error": "Not allowed to view this order."}), 403

    return jsonify({
        "id": order.id,
        "customer_id": order.customer_id,
        "product_id": order.product_id,
        "quantity": order.quantity,
        "total_price": order.total_price,
        "status": order.status,
        "failure_reason": order.failure_reason,
        "priority_score": order.priority_score,
        "customer_type": order.customer_type_snapshot,
        "created_at": order.created_at.isoformat(),
    })


@api.get("/logs")
@auth_required
def list_logs():
    user = g.current_user
    if user.role == "admin":
        logs = db.session.execute(select(LogEntry).order_by(LogEntry.created_at.desc())).scalars().all()
    else:
        logs = db.session.execute(
            select(LogEntry).where(LogEntry.customer_id == user.id).order_by(LogEntry.created_at.desc())
        ).scalars().all()

    return jsonify([
        {
            "id": log.id,
            "customer_id": log.customer_id,
            "order_id": log.order_id,
            "log_type": log.log_type,
            "log_details": log.log_details,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ])
