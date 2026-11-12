import unittest

from flask import Flask

from core.auth import hash_password
from core.extensions import db
from core.models import Customer, LogEntry, Product
from core.routes import api


class Step4EvidenceTest(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"
        self.app.config["TESTING"] = True
        self.app.config["JWT_SECRET_KEY"] = "unit-test-secret"
        self.app.config["JWT_ALGORITHM"] = "HS256"
        self.app.config["JWT_ACCESS_TOKEN_TTL_MINUTES"] = 60
        self.app.config["SECRET_KEY"] = "unit-test-secret"
        self.app.config["REDIS_URL"] = "redis://localhost:6379/0"
        self.app.config["ENABLE_ORDER_WORKER"] = False
        db.init_app(self.app)
        self.app.register_blueprint(api, url_prefix="/api/v1")

        with self.app.app_context():
            db.create_all()
            admin = Customer(username="admin", password=hash_password("adminpass"), role="admin", customer_type="premium", budget=10000)
            customer = Customer(username="alice", password=hash_password("secret123"), role="customer", customer_type="standard", budget=1000)
            product = Product(name="Laptop", stock=10, price=100)
            db.session.add_all([admin, customer, product])
            db.session.commit()

        self.client = self.app.test_client()

    def test_auth_and_profile(self):
        resp = self.client.post("/api/v1/auth/login", json={"username": "alice", "password": "secret123"})
        self.assertEqual(resp.status_code, 200)
        token = resp.get_json()["access_token"]
        me = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.get_json()["username"], "alice")

    def test_registration_cannot_assign_admin_role_or_premium_tier(self):
        response = self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "attacker",
                "password": "secret123",
                "role": "admin",
                "customer_type": "premium",
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["user"]["role"], "customer")
        self.assertEqual(response.get_json()["user"]["customer_type"], "standard")

        token = self.client.post(
            "/api/v1/auth/login",
            json={"username": "attacker", "password": "secret123"},
        ).get_json()["access_token"]
        customers = self.client.get(
            "/api/v1/customers",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(customers.status_code, 403)

    def test_order_queue_and_admin_processing(self):
        self.assertEqual(self.client.get("/api/v1/orders/queue").status_code, 401)

        resp = self.client.post("/api/v1/auth/login", json={"username": "alice", "password": "secret123"})
        user_token = resp.get_json()["access_token"]
        self.assertEqual(
            self.client.get(
                "/api/v1/orders/queue",
                headers={"Authorization": f"Bearer {user_token}"},
            ).status_code,
            403,
        )

        create = self.client.post(
            "/api/v1/orders",
            json={"product_id": 1, "quantity": 2},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        self.assertEqual(create.status_code, 201)
        order_id = create.get_json()["order"]["id"]

        admin_login = self.client.post("/api/v1/auth/login", json={"username": "admin", "password": "adminpass"})
        admin_token = admin_login.get_json()["access_token"]
        process = self.client.post("/api/v1/orders/process-next", headers={"Authorization": f"Bearer {admin_token}"})
        self.assertEqual(process.status_code, 200)
        self.assertEqual(process.get_json()["status"], "COMPLETED")

        order_lookup = self.client.get(f"/api/v1/orders/{order_id}", headers={"Authorization": f"Bearer {user_token}"})
        self.assertEqual(order_lookup.status_code, 200)
        self.assertEqual(order_lookup.get_json()["status"], "COMPLETED")

    def test_product_listing(self):
        resp = self.client.get("/api/v1/products")
        self.assertEqual(resp.status_code, 200)
        payload = resp.get_json()
        self.assertIsInstance(payload, list)
        self.assertTrue(any(item["name"] == "Laptop" for item in payload))

    def test_admin_can_list_customers_and_all_logs(self):
        with self.app.app_context():
            customer = db.session.query(Customer).filter_by(username="alice").one()
            db.session.add(LogEntry(
                customer_id=customer.id,
                order_id=None,
                log_type="INFO",
                log_details="Test activity",
            ))
            db.session.commit()

        login = self.client.post("/api/v1/auth/login", json={"username": "admin", "password": "adminpass"})
        admin_token = login.get_json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_token}"}

        customers = self.client.get("/api/v1/customers", headers=headers)
        self.assertEqual(customers.status_code, 200)
        self.assertTrue(any(item["username"] == "alice" for item in customers.get_json()))

        logs = self.client.get("/api/v1/logs", headers=headers)
        self.assertEqual(logs.status_code, 200)
        self.assertTrue(any(item["log_details"] == "Test activity" and item["customer_id"] for item in logs.get_json()))


if __name__ == "__main__":
    unittest.main()
