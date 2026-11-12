from __future__ import annotations

from datetime import datetime

from .extensions import db


class Customer(db.Model):
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=True)
    surname = db.Column(db.String(100), nullable=True)
    role = db.Column(db.String(20), default="customer", nullable=False)
    budget = db.Column(db.Integer, default=0)
    customer_type = db.Column(db.String(20), default="standard")
    total_spent = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    orders = db.relationship("Order", back_populates="customer")
    logs = db.relationship("LogEntry", back_populates="customer")

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    stock = db.Column(db.Integer, default=0, nullable=False)
    price = db.Column(db.Integer, default=0, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)

    orders = db.relationship("Order", back_populates="product")


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(30), default="PENDING", nullable=False)
    priority_score = db.Column(db.Float, default=0.0, nullable=False)
    customer_type_snapshot = db.Column(db.String(20), nullable=True)
    failure_reason = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    customer = db.relationship("Customer", back_populates="orders")
    product = db.relationship("Product", back_populates="orders")
    logs = db.relationship("LogEntry", back_populates="order")


class LogEntry(db.Model):
    __tablename__ = "logs"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id"), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=True)
    log_type = db.Column(db.String(20), default="INFO", nullable=False)
    log_details = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    customer = db.relationship("Customer", back_populates="logs")
    order = db.relationship("Order", back_populates="logs")
