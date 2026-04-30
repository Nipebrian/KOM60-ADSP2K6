# Implementation Plan — IPB Food & UMKM Student Hub

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React (Vite) — Class Components, React Router, Axios |
| **Backend** | FastAPI (Python) — SQLAlchemy ORM, Pydantic, JWT Auth |
| **Database** | PostgreSQL (production) / SQLite (development) |
| **Auth** | JWT (email + password) dengan bcrypt hashing |
| **Deploy** | Frontend: Vercel · Backend: Railway/Render · DB: Supabase/Neon |

## Struktur Project

```
Projek/
├── frontend/          ← React Vite App
│   ├── src/
│   │   ├── components/   ← Reusable class components
│   │   ├── pages/        ← Page-level class components
│   │   ├── services/     ← API call functions (Axios)
│   │   ├── assets/       ← Images, icons
│   │   └── App.jsx       ← Router setup
│   └── package.json
│
├── backend/           ← FastAPI App
│   ├── app/
│   │   ├── models/       ← SQLAlchemy models (12 kelas dari class diagram)
│   │   ├── schemas/      ← Pydantic schemas (request/response)
│   │   ├── routers/      ← API endpoints per modul
│   │   ├── services/     ← Business logic
│   │   ├── core/         ← Config, security, database
│   │   └── main.py       ← FastAPI entry point
│   └── requirements.txt
│
└── README.md
```

## Pembagian Kerja (3 Anggota)

### 👤 Anggota A — Frontend Core + Auth
- Setup Vite + React project
- Halaman: Login, Register, Home, Daftar UMKM, Detail UMKM
- Komponen: Navbar, Footer, Card, SearchBar, Filter
- Integrasi auth (JWT token management)

### 👤 Anggota B — Backend API + Database
- Setup FastAPI + SQLAlchemy + database
- Semua 12 model database (dari class diagram)
- API endpoints: Auth, UMKM, Menu, Pesanan, Pembayaran
- JWT authentication middleware
- Seed data (dummy data)

### 👤 Anggota C — Frontend Fitur + Dashboard
- Halaman: Buat Pesanan, Upload Bukti, Status Pesanan, Rating
- Halaman: Dashboard UMKM (kelola menu, pesanan, promo)
- Halaman: Panel Admin
- Responsive design & polish

## Fase Implementasi

### Fase 1 — Foundation (Minggu 1)
- [x] Setup Vite + React project
- [ ] Setup FastAPI + Database
- [ ] Model: User, Mahasiswa, PelakuUMKM, Admin
- [ ] API: Register, Login, Auth middleware
- [ ] Frontend: Login & Register pages

### Fase 2 — Direktori & Menu (Minggu 2)
- [ ] Model: UMKM, Menu
- [ ] API: CRUD UMKM, CRUD Menu
- [ ] Frontend: Home, Daftar UMKM, Detail UMKM + Menu
- [ ] Seed data: 10 UMKM dummy + menu

### Fase 3 — Pemesanan & Pembayaran (Minggu 3)
- [ ] Model: Pesanan, DetailPesanan, Pembayaran, BuktiPembayaran
- [ ] API: Buat pesanan, upload bukti, validasi pembayaran
- [ ] Frontend: Keranjang, Checkout, Upload bukti, Status pesanan

### Fase 4 — Rating, Promo, Dashboard (Minggu 4)
- [ ] Model: Rating, Promo
- [ ] API: CRUD Rating, CRUD Promo
- [ ] Frontend: Beri rating, Lihat promo, Dashboard UMKM

### Fase 5 — Admin & Polish (Minggu 5)
- [ ] Frontend: Panel Admin
- [ ] Responsive design final
- [ ] Testing & bug fixes
- [ ] Deploy online

## Pertanyaan Terbuka

1. **Database:** Pakai PostgreSQL (butuh setup) atau SQLite dulu untuk development awal?
2. **Deployment target:** Vercel + Railway, atau ada preferensi lain?
3. **Pembagian anggota:** Siapa yang mengerjakan bagian mana (A/B/C)?
