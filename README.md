# Blue — Concurrent Order & Inventory Management

Blue is an educational e-commerce-style application for exploring how concurrent orders can be prioritized and processed while keeping inventory and customer balances consistent. It combines a React storefront and admin dashboard with a Flask REST API, PostgreSQL, Redis, and a background order worker.

> This project is a learning/demo system, not a production payment platform. Customer budgets are virtual demo credits, not real money. New users can currently provide their own virtual budget during registration; do not use that value for real payments or financial decisions.

## Contents

- [English](#blue--concurrent-order--inventory-management)
- [Türkçe](#türkçe)

## What the project does

- Provides a storefront for browsing technology products, viewing product details, managing a cart, and placing orders.
- Provides customer pages for order history, profile information, and logs.
- Provides an admin dashboard for products, customers, the order queue, logs, and high-level charts.
- Calculates order priority from customer type and waiting time: Premium starts at 15, Standard at 10, with 0.5 points added per waiting second. The current implementation does not continuously re-sort existing queue entries as they wait.
- Processes orders asynchronously and records outcomes in the database.
- Uses database transactions, row-level locking, and conditional stock/budget updates to reduce race conditions when orders are processed concurrently.

The admin dashboard reads data through the REST API and refreshes it when requested. The current backend does not provide live WebSocket updates.

## Architecture

```text
React storefront / admin dashboard
                |
        JSON over REST (JWT)
                |
        Flask API (Python)
          /             \
 SQLAlchemy/PostgreSQL   Redis sorted-set queue
          \             /
       background order worker
                |
     atomic stock/budget updates
       and persistent order logs
```

- **Frontend:** React, React Router, Chart.js.
- **Backend:** Python 3.12, Flask, Flask-SQLAlchemy, SQLAlchemy, Alembic.
- **Authentication:** JWT bearer tokens; passwords are hashed with Argon2.
- **Persistence:** PostgreSQL stores customers, products, orders, and logs.
- **Queue and processing:** Redis stores queued order priorities; a Python background thread processes orders. If Redis is unavailable, the code has an in-process fallback intended only for local/single-process use. For multi-process or production deployments, use a reliable shared queue and validate its operational behavior.
- **Local orchestration:** Docker Compose starts PostgreSQL, Redis, and the API. The frontend is started separately.
- **API contract:** The OpenAPI specification is in [`docs/openapi/threadyol-openapi.yaml`](docs/openapi/threadyol-openapi.yaml) and is served at `/api/v1/docs/openapi.yaml`.

The supported backend entry point is `wsgi:app`. The old `app.py` API entry point has been retired and returns HTTP 410.

## Run locally

### Prerequisites

- Docker with the Compose plugin
- Node.js and npm
- Python 3.12 (for running backend tests or demo scripts outside Docker)

### Start the backend

From the repository root:

1. Copy `.env.example` to `.env`.
2. Generate independent values for `POSTGRES_PASSWORD`, `SECRET_KEY`, and `JWT_SECRET_KEY`. For each value, run:

   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

   Put the three different generated values in `.env`. Do not commit `.env` or reuse these secrets.
3. Start the API and its dependencies:

   ```bash
   docker compose up --build
   ```

   With the provided `.env.example`, the API is available at `http://localhost:8001`; PostgreSQL and Redis are only reachable on the Compose network.
4. Create an admin interactively. This prompts for a password without placing it in shell history:

   ```bash
   docker compose exec api python create_admin.py
   ```

   Use a unique password with at least 16 characters.

### Start the frontend

In another terminal:

```bash
cd frontend
npm ci
npm start
```

Open `http://localhost:3000`. If the API uses a different address, set `REACT_APP_API_BASE` to the full API prefix, for example `http://localhost:8001/api/v1`.

### Demo data

The demo seed script is for local development only and refuses to run unless `APP_ENV=development`:

```bash
APP_ENV=development python3 scripts/seed_demo.py
```

It adds demo customers and products; it does not create an administrator or drop existing tables. Do not use demo credentials or data in a public deployment.

## Tests and CI

Run the backend tests from the repository root:

```bash
cd backend/flaskProject
python3 -m unittest discover -s tests -p 'test_*.py'
```

The GitHub Actions workflow runs the backend unit tests on pushes to `main` and on pull requests.



# Türkçe

## Blue — Eş Zamanlı Sipariş ve Stok Yönetimi

Blue, eş zamanlı siparişlerin önceliklendirilmesini ve işlenmesini; stok ile müşteri bakiyelerinin tutarlı kalmasını incelemek için hazırlanmış, e-ticaret benzeri bir eğitim/demo uygulamasıdır. React mağaza arayüzü ve admin panelini Flask REST API, PostgreSQL, Redis ve arka plan sipariş işleyicisiyle bir araya getirir.

> Bu proje bir öğrenme/demo sistemidir; gerçek ödeme platformu değildir. Müşteri bakiyeleri sanal demo kredisidir, gerçek para değildir. Yeni kullanıcılar kayıt sırasında sanal bakiyeyi şu anda kendileri belirleyebilir; bu değeri gerçek ödemelerde veya finansal kararlarda kullanmayın.

## Proje neler yapar?

- Teknoloji ürünlerini listeleyen mağaza, ürün detayları, sepet ve sipariş oluşturma akışı sunar.
- Müşterilerin sipariş geçmişi, profil bilgileri ve loglarına erişmesini sağlar.
- Ürünleri, müşterileri, sipariş kuyruğunu, logları ve özet grafikleri gösteren bir admin paneli sağlar.
- Sipariş önceliğini müşteri türü ve bekleme süresine göre hesaplar: Premium için başlangıç puanı 15, Standard için 10; beklenen her saniye için 0,5 puan eklenir. Mevcut uygulama kuyrukta bekleyen siparişleri bekleme sırasında sürekli yeniden sıralamaz.
- Siparişleri arka planda işler ve sonuçları veritabanına kaydeder.
- Siparişler eş zamanlı işlenirken race condition riskini azaltmak için veritabanı transaction'ları, satır kilitleme ve koşullu stok/bakiye güncellemeleri kullanır.

Admin paneli verileri REST API üzerinden alır ve kullanıcı isteğiyle yeniler. Mevcut backend canlı WebSocket güncellemeleri sağlamaz.

## Mimari

```text
React mağaza arayüzü / admin paneli
                  |
       JWT ile JSON REST istekleri
                  |
          Flask API (Python)
            /            \
 SQLAlchemy/PostgreSQL   Redis sıralı kuyruk
            \            /
      arka plan sipariş işleyicisi
                  |
    atomik stok/bakiye güncellemeleri
           ve kalıcı sipariş logları
```

- **Frontend:** React, React Router, Chart.js.
- **Backend:** Python 3.12, Flask, Flask-SQLAlchemy, SQLAlchemy, Alembic.
- **Kimlik doğrulama:** JWT bearer token'ları; parolalar Argon2 ile hash'lenir.
- **Veri saklama:** PostgreSQL; müşteri, ürün, sipariş ve log verileri burada tutulur.
- **Kuyruk ve işleme:** Redis sipariş önceliklerini sıralı kümede tutar; Python arka plan thread'i siparişleri işler. Redis kullanılamadığında kodda yalnızca yerel/tek süreç kullanımı için tasarlanmış süreç içi bir yedek bulunur. Çok süreçli veya üretim ortamında güvenilir, paylaşımlı bir kuyruk kullanın ve çalışma davranışını doğrulayın.
- **Yerel servisler:** Docker Compose PostgreSQL, Redis ve API'yi başlatır. Frontend ayrı başlatılır.
- **API sözleşmesi:** OpenAPI tanımı [`docs/openapi/threadyol-openapi.yaml`](docs/openapi/threadyol-openapi.yaml) dosyasındadır ve `/api/v1/docs/openapi.yaml` adresinden sunulur.

Desteklenen backend giriş noktası `wsgi:app` şeklindedir. Eski `app.py` API giriş noktası devre dışı bırakılmıştır ve HTTP 410 döndürür.

## Yerel ortamda çalıştırma

### Gereksinimler

- Compose eklentili Docker
- Node.js ve npm
- Docker dışında backend testlerini veya demo script'lerini çalıştırmak için Python 3.12

### Backend'i başlatma

Proje kök dizininde:

1. `.env.example` dosyasını `.env` olarak kopyalayın.
2. `POSTGRES_PASSWORD`, `SECRET_KEY` ve `JWT_SECRET_KEY` için birbirinden bağımsız değerler üretin. Her değer için şu komutu çalıştırın:

   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

   Üretilen üç farklı değeri `.env` dosyasına yazın. `.env` dosyasını commit etmeyin ve bu secret'ları tekrar kullanmayın.
3. API ve bağımlılıklarını başlatın:

   ```bash
   docker compose up --build
   ```

   Sağlanan `.env.example` ile API `http://localhost:8001` adresinde çalışır; PostgreSQL ve Redis yalnızca Compose ağı üzerinden erişilebilir.
4. Admin hesabını etkileşimli olarak oluşturun. Parola shell geçmişine yazılmaz:

   ```bash
   docker compose exec api python create_admin.py
   ```

   En az 16 karakterli, benzersiz bir parola belirleyin.

### Frontend'i başlatma

Başka bir terminalde:

```bash
cd frontend
npm ci
npm start
```

`http://localhost:3000` adresini açın. API farklı bir adresteyse tam API prefix'ini `REACT_APP_API_BASE` değişkenine verin; örneğin `http://localhost:8001/api/v1`.

### Demo verileri

Demo seed script'i yalnızca yerel geliştirme içindir; `APP_ENV=development` değilse çalışmayı reddeder:

```bash
APP_ENV=development python3 scripts/seed_demo.py
```

Mevcut tabloları silmeden demo müşteri ve ürünleri ekler. Admin hesabı oluşturmaz. Demo kimlik bilgilerini veya verilerini public deployment'ta kullanmayın.

## Testler ve CI

Backend testlerini proje kökünden şu şekilde çalıştırın:

```bash
cd backend/flaskProject
python3 -m unittest discover -s tests -p 'test_*.py'
```

GitHub Actions workflow'u `main` branch'ine push ve pull request'lerde backend unit testlerini çalıştırır.

