# IPB Food Hub

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

A campus food ordering platform for IPB University — browse UMKM stalls, add items to cart, pay via transfer, and track your order in real time.

**Live:** https://ipb-food-hub.vercel.app &nbsp;|&nbsp; **API:** https://ipb-food-hub-api.vercel.app

---

## Features

**Mahasiswa (Student)**
- Browse and search UMKM directory with category / status / rating filters
- View menus, active promotions, and customer reviews per UMKM
- Add to cart, apply promo discount, set pickup time
- Upload payment proof (bank transfer / e-wallet / QRIS) with a 5-minute countdown
- Track order status with a live progress stepper
- Submit star ratings and written reviews after order completion

**Pelaku UMKM (Merchant)**
- Manage store profile, opening hours, and payment details
- Upload store photo and QRIS image via Cloudinary CDN
- Manage menus (add / edit / toggle availability / upload photo)
- View and manage incoming orders; verify payment proofs
- Reply to customer reviews
- Create and manage time-limited promo campaigns

**Admin**
- Platform statistics dashboard (users, orders, revenue)
- User management (list, update status, delete)
- Security dashboard: AAA statistics and audit log viewer

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Backend framework | FastAPI + Python 3.12 | REST API, background tasks |
| Database | Neon PostgreSQL (serverless) | Persistent data store |
| ORM | SQLAlchemy 2.x | Database models and queries |
| Auth | JWT (python-jose) + bcrypt | Stateless authentication |
| Encryption | AES-256-GCM (cryptography) | PII column encryption at rest |
| Digital signature | RSA-2048 PSS + SHA-256 | Order non-repudiation |
| File storage | Cloudinary CDN | Image uploads (production) |
| Frontend | React 19 + Vite | Single-page application |
| HTTP client | Axios | API calls with JWT interceptor |
| Deployment | Vercel (two projects) | Frontend + serverless backend |

---

## Architecture

```
Browser
  │
  ▼
React SPA (Vercel)
  │  Axios + JWT Bearer
  ▼
FastAPI (Vercel Serverless)
  ├── Auth / RBAC middleware
  ├── AAA audit logging (async, thread pool)
  ├── Routers: auth · umkm · menu · pesanan · rating · promo · admin · security
  │
  ├──► Neon PostgreSQL   (SQLAlchemy ORM)
  └──► Cloudinary CDN    (image uploads)
```

---

## Security

The project implements an **AAA (Authentication, Authorization, Accounting)** security module.

| Layer | Implementation |
|---|---|
| **Authentication** | JWT HS256 tokens, bcrypt password hashing, login attempt logging |
| **Authorization** | Role-based `require_role` dependency enforced per endpoint (roles: `mahasiswa`, `umkm`, `admin`) |
| **Accounting** | Every `/api/*` request is recorded to `audit_logs` asynchronously; structured JSON activity log written to file |
| **Data encryption** | Sensitive PII columns (phone, NIK, bank account numbers) stored as AES-256-GCM ciphertext via a SQLAlchemy `TypeDecorator` |
| **Digital signature** | RSA-2048 PSS + SHA-256 for transaction non-repudiation (`app/auth/digital_signature.py`) |

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, audit middleware
│   │   ├── core/
│   │   │   ├── config.py        # Env var loading (BOM-safe helper)
│   │   │   ├── database.py      # SQLAlchemy engine (Neon-tuned pool)
│   │   │   ├── security.py      # JWT helpers, get_current_user, require_role
│   │   │   ├── crypto.py        # AES-256-GCM encrypt/decrypt
│   │   │   ├── cloudinary_helper.py
│   │   │   └── logging_aaa.py   # AAA accounting file logger
│   │   ├── auth/
│   │   │   └── digital_signature.py  # RSA-2048 sign/verify
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   └── routers/             # FastAPI routers (one per domain)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/               # React class components (one per page)
│   │   ├── components/          # Shared components (sidebars, etc.)
│   │   ├── services/api.js      # Axios instance + all API functions
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Cloudinary](https://cloudinary.com) account (optional for local dev)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # fill in your secrets

# Generate RSA keypair (run once)
python -m app.auth.digital_signature

uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env              # set VITE_API_URL if not using the Vite proxy
npm run dev
```

App: http://localhost:5173

### Environment Variables

**Backend (`backend/.env`)**

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | JWT signing secret (min 64 chars) | `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `ENCRYPTION_KEY` | AES-256 key, base64-encoded 32 bytes | `python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"` |
| `RSA_PRIVATE_KEY_PATH` | Path to RSA private key PEM | `./keys/private.pem` |
| `RSA_PUBLIC_KEY_PATH` | Path to RSA public key PEM | `./keys/public.pem` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc...` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `https://myapp.vercel.app` |

**Frontend (`frontend/.env`)**

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL (leave empty to use Vite proxy in dev) | `https://ipb-food-hub-api.vercel.app` |

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Bearer | Get current user profile |
| PUT | `/api/auth/me` | Bearer | Update profile |
| GET | `/api/umkm` | Bearer | List UMKM (paginated, filterable) |
| GET | `/api/umkm/{id}` | Bearer | UMKM detail |
| GET | `/api/umkm/{id}/menu` | Bearer | Menu list for an UMKM |
| POST | `/api/pesanan` | mahasiswa | Create new order |
| GET | `/api/pesanan/saya` | mahasiswa | My orders |
| POST | `/api/pesanan/{id}/bukti` | mahasiswa | Upload payment proof |
| PUT | `/api/pesanan/{id}/status` | umkm / admin | Update order status |
| PUT | `/api/pesanan/{id}/verifikasi-bukti` | umkm | Verify payment proof |
| GET | `/api/rating/umkm/{id}` | Bearer | Reviews for an UMKM |
| POST | `/api/rating` | mahasiswa | Submit review |
| GET | `/api/promo` | Bearer | All active promos |
| GET | `/api/admin/stats` | admin | Platform statistics |
| GET | `/api/security/stats` | admin | AAA security statistics |
| GET | `/api/security/audit-logs` | admin | Paginated audit log |

Full interactive docs: https://ipb-food-hub-api.vercel.app/docs

---

## Deployment

Both services are deployed on **Vercel**:

- **Frontend** — https://ipb-food-hub.vercel.app (Vite static build)
- **Backend** — https://ipb-food-hub-api.vercel.app (Python serverless functions)

Images are served via **Cloudinary CDN**. The database is hosted on **Neon** (serverless PostgreSQL).

---

## Team

**Kelompok 6 — KOM60 Advanced Data Structures, IPB University 2025/2026**

| Name | Student ID | Role |
|---|---|---|
| Hasan Fadilah | G6401231051 | Frontend Core + Auth |
| Hanif Febrian | G6401231070 | Backend API + Database |
| Mohammad Mirza Shahbaz Avianto | G6401231143 | Frontend Features + Dashboard |
