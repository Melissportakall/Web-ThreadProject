from datetime import datetime
from flask import Flask, render_template, request, jsonify, make_response, current_app
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from database import db, init_db, Customers, Products, Orders, Logs
import threading
import time
import heapq
from flask_socketio import SocketIO, emit 

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/Yeni3'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

init_db(app)


order_queue = []
queue_lock = threading.Lock() 
stop_threads = False 
order_progress = {}

@app.route('/')
def index():
    return "WebSocket Server is Running!"

@socketio.on('connect')
def on_connect():
    print("Client connected:", request.sid)
    logs = Logs.query.order_by(Logs.LogDate.desc()).all()
    log_list = [
        {
            "LogID": log.LogID,
            "CustomerID": log.CustomerID,
            "OrderID": log.OrderID,
            "LogDate": log.LogDate.strftime("%Y-%m-%d %H:%M:%S"),
            "LogType": log.LogType,
            "LogDetails": log.LogDetails,
        }
        for log in logs
    ]

    emit('dynamic_logs', log_list)

@socketio.on('order_status')
def handle_order_status(data):
    print("Order status request received:", data)
    order_id = data.get('order_id')

    order = Orders.query.filter_by(OrderID=order_id).first()

    if order:
        if order.OrderStatus == 'Tamamlandı':
            socketio.emit('order_updated', {
                'order_id': order_id,
                'status': 'Completed',
                'progress': 100
            }, broadcast=True)
        else:
            current_progress = order_progress.get(order_id, 0)
            socketio.emit('order_updated', {
                'order_id': order_id,
                'status': 'In Progress',
                'progress': current_progress
            }, broadcast=True)
    else:
        print(f"No order found with ID: {order_id}")
        socketio.emit('order_updated', {
            'order_id': order_id,
            'status': 'Error',
            'progress': 0
        }, broadcast=True)


def calculate_priority(customer_type, wait_time):
    base_score = 15 if customer_type == "premium" else 10
    wait_weight = 0.5
    print("priority calculateee:", base_score + (wait_time * wait_weight))
    return base_score + (wait_time * wait_weight)



def process_order(order_data):
    with app.app_context():  
        try:
            print(f"Order işleniyor: {order_data['order_id']}")

            customer = db.session.get(Customers, order_data["customer_id"])
            product = db.session.get(Products, order_data["product_id"])

            if not customer:
                add_log(
                    order_data["customer_id"],
                    order_data["order_id"],
                    "Hata",
                    f"{customer.name} adlı müşteri bulunamadı."
                )
                print(f"Order {order_data['order_id']} hata: Müşteri bulunamadı.")
                return

            if not product:
                add_log(
                    order_data["customer_id"],
                    order_data["order_id"],
                    "Hata",
                    f"{product.name} adlı ürün bulunamadı."
                )
                print(f"Order {order_data['order_id']} hata: Ürün bulunamadı.")
                return

            
            if product.stock < order_data["quantity"]:
                add_log(
                    order_data["customer_id"],
                    order_data["order_id"],
                    "Hata",
                    f"Yetersiz stok, "
                        f"Ürün: {product.name}, "
                        f"Satın Alınan Miktar: {order_data['quantity']}, "
                        f"Mevcut Stok: {product.stock}"
                )
                print(f"Order {order_data['order_id']} hata: Yetersiz stok.")
                return

            if customer.budget < order_data["total_price"]:
                add_log(
                    order_data["customer_id"],
                    order_data["order_id"],
                    "Hata",
                    f"Yetersiz bütçe, "
                        f"Müşteri Türü: {customer.customer_type}, "
                        f"Ürün: {product.name}, "
                        f"Satın Alınan Miktar: {order_data['quantity']}, "
                        f"Gerekli Bütçe: {order_data['total_price']}, "
                        f"Mevcut Bütçe: {customer.budget}"
                )
                print(f"Order {order_data['order_id']} hata: Yetersiz bütçe.")
                return
            

            print(f"Order {order_data['order_id']} hazırlanıyor...")
            for progress in range(0, 101, 10):
                time.sleep(2)  
                order_progress[order_data['order_id']] = progress
                socketio.emit('order_updated', {
                    'order_id': order_data['order_id'],
                    'status': 'In Progress',
                    'progress': progress
                }, broadcast=True)

            
            product.stock -= order_data["quantity"]
            customer.budget -= order_data["total_price"]
            customer.total_spent += order_data["total_price"]

            
            order = db.session.get(Orders, order_data["order_id"])
            if order:
                order.OrderStatus = "Tamamlandı"

                add_log(
                    order_data["customer_id"],
                    order_data["order_id"],
                    "Bilgilendirme",
                    f"{product.name} sipariş tamamlandı."
                )

            db.session.commit()
            print(f"Order tamamlandı: {order_data['order_id']}")


            socketio.emit('order_updated', {
                'order_id': order_data['order_id'],
                'status': 'Completed',
                'progress': 100
            }, broadcast=True)

            order_progress.pop(order_data['order_id'], None)

        except Exception as e:
            db.session.rollback()  

            add_log(
                order_data["customer_id"],
                order_data["order_id"],
                "Hata",
                f"Sipariş {order_data['order_id']} hata: Veritabanı hatası."
            )

            socketio.emit('order_status', {
                'order_id': order_data['order_id'],
                'status': 'Error',
                'details': f'Sipariş işlenirken hata oluştu: {str(e)}'
            })

            print(f"Order {order_data['order_id']} hata: {str(e)}")

def priority_updater():
    while True:
        with queue_lock:
            for index, (_, order_data) in enumerate(order_queue):
                new_priority = update_priority(order_data)
               
                order_queue[index] = (-new_priority, order_data)

            heapq.heapify(order_queue)

        time.sleep(1)

def update_priority(order_data):
    wait_time = (datetime.now() - order_data["order_time"]).total_seconds()
    
    return float(order_data["priority_score"] + wait_time)

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        username = data.get('username')
        password = data.get('password')
        print("Received user:", username, "password:", password)

        user = Customers.query.filter_by(username=username).first()

        if user and user.password == password:
            is_admin = user.username == "admin"
            response = jsonify({"success": True, "message": "Giriş başarılı", "is_admin": is_admin})
            response.set_cookie('user_data', str(user.id), httponly=False, samesite='None', secure=True)
            return response
        else:
            return jsonify({"success": False, "message": "Kullanıcı adı veya şifre hatalı"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": "Bir hata oluştu: " + str(e)}), 500

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print("Received data:", data)
    try:
        new_user = Customers(
            username=data['username'],
            password=data['password'],
            name=data['name'],
            surname=data['surname'],
            phone_number=data['phonenumber'],
            budget=data['budget'],
            customer_type='regular',
            total_spent=0
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Başarıyla kayıt olundu.",
            "userId": new_user.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Kayıt sırasında bir hata oluştu: {str(e)}"
        }), 500

@app.route('/urunekle', methods=['POST'])
def urunekle():
    try:
        data = request.json
        print('Gelen Veri:', data)
        name = data.get('name')
        stock = data.get('stock', 0)  
        price = data.get('price', 0)  

        
        new_product = Products(name=name, stock=stock, price=price)
        db.session.add(new_product)
        db.session.commit()

        return jsonify({'message': 'Ürün başarıyla eklendi!', 'product': {
            'id': new_product.id,
            'name': new_product.name,
            'stock': new_product.stock,
            'price': new_product.price
        }}), 201
    except Exception as e:
        print('Hata:', str(e))
        return jsonify({'error': str(e)}), 400

@app.route('/tumurunler', methods=['GET'])
def tumurunler():
    try:
        products = Products.query.all()
        products_list = []

        for product in products:
            products_list.append({
                'id': product.id,
                'name': product.name,
                'stock': product.stock,
                'price': product.price
            })

        return jsonify({'products': products_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/urunsil', methods=['POST'])
def urunsil():
    try:
        data = request.json
        name = data.get('name')

        if not name:
            return jsonify({'error': 'Ürün adı zorunludur!'}), 400


        product_to_delete = Products.query.filter_by(name=name).first()

        if not product_to_delete:
            return jsonify({'error': 'Ürün bulunamadı!'}), 404

        db.session.delete(product_to_delete)
        db.session.commit()

        return jsonify({'message': 'Ürün başarıyla silindi!'}), 200
    except Exception as e:
        print('Hata:', str(e))
        return jsonify({'error': str(e)}), 400

@app.route('/urunguncelle', methods=['POST'])
def urunguncelle():
    try:
        data = request.json
        name = data.get('name')
        stock = data.get('stock')
        price = data.get('price')

        if not name:
            return jsonify({'error': 'Ürün adı zorunludur!'}), 400

        product_to_update = Products.query.filter_by(name=name).first()

        if not product_to_update:
            return jsonify({'error': 'Ürün bulunamadı!'}), 404

        product_to_update.stock = stock
        product_to_update.price = price
        db.session.commit()

        return jsonify({'message': 'Ürün başarıyla güncellendi!'}), 200
    except Exception as e:
        print('Hata:', str(e))
        return jsonify({'error': str(e)}), 400

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    try:
        data = request.json
        customer_id = request.cookies.get('user_data')
        print(f"Customer ID from cookies: {customer_id}")
        customer_name = data.get('customer_name')
        product_id = data.get('product_id')
        quantity = data.get('quantity', 1)

        
        customer = db.session.get(Customers, customer_id)
        if not customer:
            return jsonify({"error": "Müşteri bulunamadı"}), 404

        customer_type = customer.customer_type
        

        
        product = db.session.get(Products, product_id)
        if not product:
            return jsonify({"error": "Ürün bulunamadı"}), 404

        if quantity > 5:
            add_log(
                customer_id,
                -1,
                "Hata",
                f"5'ten fazla ürün siparişi verilemez."
            )

            return jsonify({"error": "5'ten fazla ürün siparişi verilemez."}), 400
        if product.stock < quantity:
            add_log(
                customer_id,
                -1,
                "Hata",
                f"Ürün stoğu yetersiz. "
                    f"Müşteri Türü: {customer_type}, "
                    f"Ürün: {product.name}, "
                    f"Satın Alınan Miktar: {quantity}, "
            )

            return jsonify({"error": "Yetersiz stok", "available_stock": product.stock}), 400

        
        total_price = product.price * quantity
        if customer.budget < total_price:
            add_log(
                customer_id,
                -1,
                "Hata",
                f"Yetersiz bütçe. "
                    f"Müşteri Türü: {customer_type}, "
                    f"Ürün: {product.name}, "
                    f"Satın Alınan Miktar: {quantity}, "
                    f"Gerekli Bütçe: {total_price}, "
                    f"Mevcut Bütçe: {customer.budget}"
            )

            return jsonify({"error": "Yetersiz bütçe", "current_budget": customer.budget}), 400

        
        order = Orders(
            CustomerID=customer_id,
            ProductID=product_id,
            Quantity=quantity,
            TotalPrice=total_price,
            OrderDate=datetime.now(),  
            OrderStatus='Beklemede'
        )
        db.session.add(order)
        db.session.flush()

        add_log(
            customer_id,
            order.OrderID,
            "Bilgilendirme",
            f"{quantity} adet {product.name} sipariş edildi."
        )

        order_data = {
            "order_id": order.OrderID,
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": quantity,
            "total_price": total_price,
            "customer_type": ispremium(customer_id),
            "order_time": datetime.now(),
            "priority_score": float(calculate_priority(customer_type, 0))
        }
        
        with queue_lock:
            heapq.heappush(order_queue, (-order_data["priority_score"], order_data))  

        print(f"Thread oluşturuluyor: Order {order_data['order_id']} kuyruğa eklendi.")
        thread = threading.Thread( args=(order_data,), daemon=True)
        thread.start()

        return jsonify({"message": f"{quantity} adet {product.name} sepete eklendi!"}), 200

    except Exception as e:
        db.session.rollback()
        print(error := str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/orders/<int:customer_id>', methods=['GET'])
def get_orders_for_customer(customer_id):
    try:
        orders = Orders.query.filter_by(CustomerID=customer_id).all()
        
        orders_data = []
        for order in orders:
            orders_data.append({
                'OrderID': order.OrderID,
                'ProductID': order.ProductID,
                'Quantity': order.Quantity,
                'TotalPrice': order.TotalPrice,
                'OrderDate': order.OrderDate.strftime('%Y-%m-%d %H:%M:%S'),  
                'OrderStatus': order.OrderStatus
            })
        
        return jsonify({'orders': orders_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_pending_orders', methods=['GET'])
def get_pending_orders():
    try:
        pending_orders = (
            db.session.query(Orders, Customers, Products)
            .join(Customers, Orders.CustomerID == Customers.id)
            .join(Products, Orders.ProductID == Products.id)
            .filter(Orders.OrderStatus == 'Beklemede')
            .order_by(Orders.OrderDate.desc())
            .all()
        )

        result = [
            {
                "OrderID": order.OrderID,
                "CustomerName": f"{customer.name} {customer.surname}",
                "CustomerType": customer.customer_type,
                "ProductName": product.name,
                "Quantity": order.Quantity,
                "TotalPrice": order.TotalPrice,
                "OrderDate": order.OrderDate.strftime('%Y-%m-%d %H:%M'),
                "OrderStatus": order.OrderStatus,
            }
            for order, customer, product in pending_orders
        ]

        return jsonify({"orders": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_order_status/<int:order_id>', methods=['PATCH'])
def update_order_status(order_id):
    try:
        data = request.get_json()
        status = data.get('status')

        order = Orders.query.get(order_id)
        if not order:
            return jsonify({"error": "Sipariş bulunamadı"}), 404

        order.OrderStatus = status
        db.session.commit()

        return jsonify({"message": "Sipariş durumu güncellendi", "status": status}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/all-logs', methods=['GET'])
def get_logs():
    try:
        logs = Logs.query.order_by(Logs.LogDate.desc()).all()
        log_list = [
            {
                "LogID": log.LogID,
                "CustomerID": log.CustomerID,
                "OrderID": log.OrderID,
                "LogDate": log.LogDate.strftime("%Y-%m-%d %H:%M:%S"),
                "LogType": log.LogType,
                "LogDetails": log.LogDetails,
            }
            for log in logs
        ]
        return jsonify({"logs": log_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/all-customers', methods=['GET'])
def get_all_customers():
    try:
        customers = Customers.query.order_by(Customers.name.asc(), Customers.surname.asc()).all()
        customer_list = [
            {
                "CustomerID": customer.id,
                "Username": customer.username,
                "Name": customer.name,
                "Surname": customer.surname,
                "PhoneNumber": customer.phone_number,
                "Budget": customer.budget,
                "CustomerType": customer.customer_type,
                "TotalSpent": customer.total_spent,
            }
            for customer in customers
        ]
        return jsonify({"success": True, "customers": customer_list}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/logs/<int:customer_id>', methods=['GET'])
def get_user_logs(customer_id):
    try:
        logs = Logs.query.filter_by(CustomerID=customer_id).order_by(Logs.LogDate.asc()).all()
        log_list = [
            {
                "LogID": log.LogID,
                "CustomerID": log.CustomerID,
                "OrderID": log.OrderID,
                "LogDate": log.LogDate.strftime("%Y-%m-%d %H:%M:%S"),
                "LogType": log.LogType,
                "LogDetails": log.LogDetails,
            }
            for log in logs
        ]
        return jsonify({"logs": log_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update_all_orders', methods=['PATCH'])
def update_all_orders():
    try:
        data = request.get_json()
        new_status = data.get('status')

        if not new_status:
            return jsonify({"error": "Durum bilgisi eksik."}), 400

        updated_rows = Orders.query.filter(Orders.OrderStatus == 'Beklemede').update({"OrderStatus": new_status})
        db.session.commit()

        if new_status == 'Onaylandı':
            stop_threads = False 
            with queue_lock:
                for _, order_data in order_queue:
                    process_order(order_data)

        elif new_status == 'Reddedildi':
            stop_threads = True  
            print("Admin onayı vermediğinden çalışan threadler durduruldu")
        with queue_lock:
            while order_queue:  
                order_queue.pop(0)  

        if updated_rows == 0:
            return jsonify({"message": "Beklemede hiçbir sipariş bulunamadı veya güncellenmedi."}), 404

        return jsonify({"message": f"Tüm beklemede olan siparişler '{new_status}' durumuna güncellendi.", "updated_rows": updated_rows}), 200

    except Exception as e:
        db.session.rollback()
        print(error := str(e))
        return jsonify({"error": str(e)}), 500

def broadcast_log(log_data):
    socketio.emit('dynamic_logs', {
        "LogID": log_data.LogID,
        "CustomerID": log_data.CustomerID,
        "OrderID": log_data.OrderID,
        "LogDate": log_data.LogDate.strftime('%Y-%m-%d %H:%M:%S'),
        "LogType": log_data.LogType,
        "LogDetails": log_data.LogDetails
    }, broadcast=True)

def add_log(customer_id, order_id, log_type='', log_details=''):
    log_date = datetime.now()

    new_log = Logs(
        CustomerID=customer_id,
        OrderID=order_id,
        LogDate=log_date,
        LogType=log_type,
        LogDetails=log_details
    )

    db.session.add(new_log)
    db.session.commit()

    broadcast_log(new_log)

    return jsonify({
        "LogID": new_log.LogID,
        "CustomerID": new_log.CustomerID,
        "OrderID": new_log.OrderID,
        "LogDate": new_log.LogDate.strftime('%Y-%m-%d %H:%M:%S'),
        "LogType": new_log.LogType,
        "LogDetails": new_log.LogDetails
    })

def ispremium(customer_id):
    try:
        customer = Customers.query.filter_by(id=customer_id).first()
        if customer:
            print(f"Eski customer_type: {customer.customer_type}")
            if customer.total_spent >= 2000: 
                customer.customer_type = 'premium'
                db.session.commit()
                print(f"Güncellenmiş customer_type: {customer.customer_type}")
                return customer.customer_type
            else:
                return customer.customer_type
        else:
            print(f"Customer with ID {customer_id} not found.")
            return None
    except Exception as e:
        print(f"Hata oluştu: {str(e)}")
        return None



if __name__ == '__main__':
    priority_thread = threading.Thread(target=priority_updater, daemon=True)
    priority_thread.start()
    socketio.run(app, host='0.0.0.0',port=3000)

