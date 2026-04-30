# Progress Report: Implementasi Fase 1
## IPB Food & UMKM Student Hub
### KOM 1337 – Analisis dan Desain Sistem | Kelompok 6 P2

---

## 🚀 Status: Fase 1 (Foundation & Auth) Selesai

Pada fase pertama ini, kami telah berhasil membangun **fondasi sistem** secara *full-stack* (Backend & Frontend) dan mengimplementasikan fitur autentikasi untuk aktor sistem (Mahasiswa & UMKM).

### 1. Setup Arsitektur & Teknologi Utama
- **Backend**: Berhasil melakukan inisiasi project menggunakan **FastAPI (Python)**.
- **Frontend**: Berhasil melakukan inisiasi project menggunakan **React.js + Vite** dengan pendekatan *Class Component*.
- **Database**: Berhasil men-setup **SQLite** dengan **SQLAlchemy ORM** untuk environment *development* (siap migrasi ke PostgreSQL untuk *production*).

### 2. Implementasi Database Models (Backend)
Seluruh struktur data (12 kelas) yang dirancang di Class Diagram telah diimplementasikan ke dalam kode model database dengan relasinya masing-masing:
- `User` (Induk: Mahasiswa, PelakuUMKM, Admin)
- `UMKM`, `Menu`, `Promo`
- `Pesanan`, `DetailPesanan`, `Pembayaran`, `BuktiPembayaran`
- `Rating`

### 3. Implementasi Keamanan & Autentikasi (Backend)
- Sistem login menggunakan standar **JWT (JSON Web Token)**.
- Password pengguna dienkripsi dengan algoritma **Bcrypt** sebelum disimpan ke database.
- Terdapat *Middleware* untuk validasi token dan membatasi hak akses berdasarkan tipe *role* (mahasiswa, umkm, admin).

### 4. Implementasi API Endpoints (Backend)
Modul *Authentication* sudah memiliki endpoint fungsional:
- `POST /api/auth/register` : Mendaftarkan akun (bisa memilih *role* Mahasiswa atau UMKM, dengan input data yang menyesuaikan *role*).
- `POST /api/auth/login` : Autentikasi email dan password, mengembalikan token JWT.
- `GET /api/auth/me` : Mengambil data profil user yang sedang login.
- `PUT /api/auth/me` : Memperbarui data profil user.

### 5. Implementasi UI & Integrasi (Frontend)
Pada sisi antarmuka, kami telah membuat komponen halaman utama dengan desain *modern dark mode* yang responsif:
- **`LoginPage`**: Form login yang terintegrasi dengan API backend.
- **`RegisterPage`**: Form pendaftaran dinamis (kolom isian berubah tergantung pilihan mendaftar sebagai Mahasiswa atau UMKM).
- **`HomePage`**: Halaman utama / *Dashboard* yang memiliki *Navigation Bar* (menampilkan nama & *role* yang login) dan 6 modul utama sistem (*Direktori*, *Pre-order*, dll.).
- **`API Service`**: Setup modul `axios` dengan mekanisme *interceptor* yang secara otomatis menyisipkan token JWT pada setiap *request* ke server.

---

## 🎯 Target Selanjutnya (Fase 2)
1. **API Direktori UMKM & Menu**: Membuat endpoint backend untuk Create, Read, Update, Delete data UMKM dan daftar menunya.
2. **UI Direktori**: Membangun halaman katalog UMKM yang bisa diakses oleh Mahasiswa.
3. **Data Dummy**: Memasukkan (seed) data contoh UMKM dan menu makanan/minuman agar antarmuka dapat didemonstrasikan secara utuh.
