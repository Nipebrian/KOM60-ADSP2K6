# IPB Food & UMKM Student Hub 🍔

Proyek mata kuliah **KOM 1337 – Analisis dan Desain Sistem** (Kelompok 6 P2).
Aplikasi *web-based* yang berfungsi sebagai direktori terpusat dan sistem manajemen *pre-order* untuk kantin serta UMKM mahasiswa di Institut Pertanian Bogor (IPB).

## 👥 Anggota Kelompok (6 P2)
- Hasan Fadilah (G6401231051) — *Frontend Core + Auth*
- Hanif Febrian (G6401231070) — *Backend API + Database*
- Mohammad Mirza Shahbaz Avianto (G6401231143) — *Frontend Fitur + Dashboard*

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite
- **Backend**: FastAPI (Python), SQLAlchemy ORM, Pydantic, JWT Auth
- **Database**: SQLite (Development) -> PostgreSQL (Production ready)

---

## 🏗️ Struktur Proyek
Repository ini menggunakan arsitektur *monorepo* sederhana:
```text
📦 Projek
 ┣ 📂 backend/        # FastAPI Server & Database
 ┃ ┣ 📂 app/          # Core application
 ┃ ┃ ┣ 📂 core/       # Konfigurasi, DB Setup, Security (JWT/Bcrypt)
 ┃ ┃ ┣ 📂 models/     # SQLAlchemy Database Models
 ┃ ┃ ┣ 📂 routers/    # API Endpoints (Controllers)
 ┃ ┃ ┣ 📂 schemas/    # Pydantic Schemas (Data Validation)
 ┃ ┃ ┗ 📜 main.py     # Aplikasi Utama FastAPI
 ┃ ┣ 📜 seed_data.py  # Script untuk injeksi data dummy (demo)
 ┃ ┗ 📜 requirements.txt
 ┣ 📂 frontend/       # React Vite Web App
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 pages/      # React Views (Login, Home, dll)
 ┃ ┃ ┣ 📂 services/   # Konfigurasi Axios & API Calls
 ┃ ┃ ┗ 📜 main.jsx    # React Entry Point
 ┃ ┣ 📜 package.json
 ┃ ┗ 📜 vite.config.js
 ┗ 📜 README.md
```

---

## 🚀 Cara Menjalankan Aplikasi di Lokal

Karena ini adalah aplikasi *Full-stack*, Anda perlu menjalankan *Backend* dan *Frontend* di dua terminal (CMD/PowerShell) yang terpisah.

### 1. Menjalankan Backend (Terminal 1)
Buka terminal dan arahkan ke direktori `backend/`:
```bash
cd backend

# Buat virtual environment
python -m venv venv

# Aktifkan virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependensi
pip install -r requirements.txt

# (Opsional) Jalankan script seed untuk mengisi data dummy
python seed_data.py

# Jalankan server
uvicorn app.main:app --reload
```
Server backend akan berjalan di: **`http://localhost:8000`**
Dokumentasi API Interaktif (Swagger) bisa diakses di: **`http://localhost:8000/docs`**

### 2. Menjalankan Frontend (Terminal 2)
Buka terminal baru dan arahkan ke direktori `frontend/`:
```bash
cd frontend

# Install dependensi NPM
npm install

# Jalankan server development
npm run dev
```
Aplikasi web akan berjalan di browser pada: **`http://localhost:5173`**

---

## 📚 Endpoint API Tersedia (Backend)
Sistem memiliki 7 modul API utama:
1. **Auth** (`/api/auth`): Register, Login, Get/Update Profile.
2. **UMKM** (`/api/umkm`): Direktori UMKM, Registrasi toko, Profil UMKM.
3. **Menu** (`/api/umkm/{id}/menu`): Manajemen katalog menu per UMKM.
4. **Pesanan** (`/api/pesanan`): *Pre-order*, update status, upload/validasi bukti pembayaran.
5. **Rating** (`/api/rating`): Rating bintang dan ulasan antar mahasiswa dan UMKM.
6. **Promo** (`/api/promo`): Manajemen sistem diskon oleh UMKM.
7. **Admin** (`/api/admin`): Statistik platform dan manajemen status pengguna.

Semua detail payload (JSON) dan parameter bisa diuji langsung melalui **Swagger UI** (`http://localhost:8000/docs`).

---
*Dibuat untuk memenuhi tugas matakuliah Analisis dan Desain Sistem.*
