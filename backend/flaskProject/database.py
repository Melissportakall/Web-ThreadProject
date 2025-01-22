# database.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
from sqlalchemy import func

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()

#Customers tablosu
class Customers(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(50))
    surname = db.Column(db.String(50))
    phone_number = db.Column(db.String(20))
    budget = db.Column(db.Integer)
    customer_type = db.Column(db.String(50),default= 'regular')
    total_spent = db.Column(db.Integer,default = 0)

#Products tablosu
class Products(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    stock = db.Column(db.Integer)
    price = db.Column(db.Integer)

#Orders tablosu
class Orders(db.Model):
    __tablename__ = 'orders'
    OrderID = db.Column(db.Integer, primary_key=True)
    CustomerID = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    ProductID = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    Quantity = db.Column(db.Integer)
    TotalPrice = db.Column(db.Integer)
    OrderDate = db.Column(db.DateTime)
    OrderStatus = db.Column(db.String(20))

#Logs tablosu
class Logs(db.Model):
    __tablename__ = 'logs'
    LogID = db.Column(db.Integer, primary_key=True)
    CustomerID = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    OrderID = db.Column(db.Integer, db.ForeignKey('orders.OrderID'), nullable=False)
    LogDate = db.Column(db.DateTime)
    LogType = db.Column(db.String(50))
    LogDetails = db.Column(db.String(200))