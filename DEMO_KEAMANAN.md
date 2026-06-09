# Panduan Demo Implementasi Keamanan Informasi
## IPB Food Hub — Kelompok 9 | KOM1315

**URL Aplikasi:** https://ipb-food-hub.vercel.app
**URL API:** https://ipb-food-hub-api.vercel.app
**Tools yang dibutuhkan:** Browser + DevTools (F12), atau Postman/Thunder Client (opsional)

---

## Urutan Demo (±20 menit)

| # | Fitur | Cara Demo | Durasi |
|---|-------|-----------|--------|
| 0 | HTTPS/TLS — Data in Transit | Lihat sertifikat TLS di browser + DevTools | 2 menit |
| 1 | Password Hashing — Bcrypt | Register → lihat hash di DB / API | 2 menit |
| 2 | JWT Session Token | Login → inspect token di browser | 2 menit |
| 3 | AES-256-GCM Column Encryption | Register dengan no. telepon → bandingkan plaintext vs ciphertext | 3 menit |
| 4 | RBAC — Role-Based Access Control | Coba akses endpoint terlarang → HTTP 403 | 3 menit |
| 5 | Digital Signature Pesanan | Buat pesanan → signing + verifikasi via API | 4 menit |
| 6 | AAA Audit Log & Security Dashboard | Login admin → buka security dashboard | 2 menit |

---

## Demo 0 — HTTPS/TLS (Data in Transit)

**Tujuan:** Membuktikan semua data yang dikirim antara client dan server dienkripsi oleh TLS — tidak bisa disadap dalam bentuk plaintext.

### Langkah-langkah:

**0.1 Lihat ikon kunci di URL bar**
- Buka https://ipb-food-hub.vercel.app di browser
- Klik **ikon kunci (🔒)** di sebelah kiri URL bar
- Klik **"Connection is secure"** atau **"Koneksi aman"**
- Tunjukkan:
  - "Certificate is valid" — sertifikat TLS valid
  - Issued by: **Let's Encrypt** (atau Vercel Trust)
  - Protocol: **TLS 1.3**

**0.2 Lihat detail sertifikat di DevTools**
- Buka DevTools (F12) → tab **Security**
- Klik **"View certificate"**
- Tunjukkan:
  - Subject: `*.vercel.app`
  - Issuer: Let's Encrypt
  - Valid From / Valid To (masa berlaku sertifikat)
  - Signature algorithm: SHA-256 with RSA

**0.3 Buktikan data terenkripsi saat transit di Network tab**
- DevTools → tab **Network** → pastikan filter **All**
- Login ke aplikasi → amati request `POST /api/auth/login`
- Klik request tersebut → tab **Headers**:
  - Tunjukkan: `Scheme: https` — bukan http
- Tab **Payload**: tunjukkan username + password terlihat di sini (di DevTools lokal)
- **Penjelasan:** "Data ini kelihatan di DevTools karena DevTools ada di mesin kita sendiri — data sudah didekripsi setelah TLS. Di jaringan (wireshark, MITM), yang terlihat hanya ciphertext TLS."

**0.4 Tunjukkan HTTP → HTTPS redirect (opsional)**
- Ketik `http://ipb-food-hub.vercel.app` (tanpa `s`) di browser
- Browser otomatis redirect ke `https://` — ini adalah HSTS

**Yang perlu ditunjukkan:**
> "Seluruh komunikasi antara browser dan server menggunakan TLS 1.3. Data seperti password, token JWT, dan data pesanan tidak bisa disadap dalam bentuk plaintext oleh pihak ketiga di jaringan."

---

## Demo 1 — Password Hashing (Bcrypt)

**Tujuan:** Membuktikan password tidak disimpan plaintext, menggunakan Bcrypt dengan salt acak.

### Langkah-langkah:

**1.1 Register akun baru**
- Buka https://ipb-food-hub.vercel.app/register
- Isi form:
  - Nama: `Demo Keamanan`
  - Email: `demo.keamanan@apps.ipb.ac.id`
  - No. Telepon: `081234567890`
  - Role: Mahasiswa
  - Password: `Demo@12345`
- Klik **Daftar**

**1.2 Lihat hash password via API**
- Buka browser baru, akses:
  ```
  https://ipb-food-hub-api.vercel.app/api/auth/login
  ```
- Atau gunakan DevTools → Network → login → lihat response tidak mengandung password

**1.3 Bukti lewat endpoint `/api/auth/me`**
- Setelah login, buka DevTools (F12) → tab **Application** → **Local Storage**
- Salin nilai `token`
- Buka tab **Network** → request ke `/api/auth/me` → lihat response: **tidak ada field password**

**Yang perlu ditunjukkan:**
> "Password yang tersimpan di database berbentuk hash `$2b$12$...` (60 karakter), bukan password asli. Setiap registrasi menghasilkan hash berbeda meski password sama karena salt acak."

---

## Demo 2 — JWT Session Token

**Tujuan:** Membuktikan autentikasi berbasis token stateless dengan HS256.

### Langkah-langkah:

**2.1 Login dan ambil token**
- Buka https://ipb-food-hub.vercel.app/login
- Login dengan akun yang sudah dibuat
- Buka DevTools → **Application** → **Local Storage** → salin nilai `token`

**2.2 Decode token di jwt.io**
- Buka https://jwt.io (atau jelaskan struktur secara manual)
- Paste token → lihat:
  - **Header:** `{"alg": "HS256", "typ": "JWT"}`
  - **Payload:** `{"sub": "<user_id>", "role": "mahasiswa", "exp": <timestamp>}`
  - **Signature:** terenkripsi dengan SECRET_KEY

**2.3 Coba akses API tanpa token → gagal**
- Buka tab baru di browser, akses langsung:
  ```
  https://ipb-food-hub-api.vercel.app/api/auth/me
  ```
- Hasil: `{"detail": "Not authenticated"}` (HTTP 401)

**2.4 Coba akses dengan token yang valid → berhasil**
- Lewat DevTools → Console, jalankan:
  ```javascript
  fetch('https://ipb-food-hub-api.vercel.app/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => r.json()).then(console.log)
  ```
- Hasil: data user ditampilkan

**Yang perlu ditunjukkan:**
> "Token JWT berisi identitas user (user_id dan role) yang tidak bisa dipalsukan tanpa SECRET_KEY. Token kadaluarsa dalam 24 jam."

---

## Demo 3 — AES-256-GCM Column Encryption

**Tujuan:** Membuktikan data sensitif tersimpan terenkripsi di database, bukan plaintext.

### Langkah-langkah:

**3.1 Register dengan nomor telepon**
- Register akun baru dengan no. telepon yang jelas, misal: `081111222333`

**3.2 Lihat data via API (plaintext setelah dekripsi)**
- Login dengan akun tersebut
- Di DevTools → Console:
  ```javascript
  fetch('https://ipb-food-hub-api.vercel.app/api/auth/me', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => r.json()).then(d => console.log('no_telp di API:', d.no_telp))
  ```
- Hasil: `081111222333` (sudah didekripsi oleh backend)

**3.3 Bandingkan dengan yang tersimpan di database**
- Akses Neon DB Console di https://console.neon.tech
- Jalankan query:
  ```sql
  SELECT email, no_telp, nik, nomor_rekening
  FROM users
  WHERE email = 'demo.keamanan@apps.ipb.ac.id';
  ```
- Hasil kolom `no_telp`: bukan `081111222333`, melainkan ciphertext base64 seperti:
  ```
  abc123XYZ...== (±88 karakter)
  ```

**3.4 Demonstrasi deteksi tampering (opsional via Postman)**
- Ambil ciphertext dari DB
- Ubah 1 karakter di tengah
- Masukkan kembali lewat SQL UPDATE
- Saat user login → backend akan throw `InvalidTag` karena GCM tag tidak cocok

**Yang perlu ditunjukkan:**
> "Kolom no_telp, NIK, nomor rekening, dan nomor e-wallet tidak bisa dibaca meski ada yang mengakses database secara langsung. AES-256-GCM juga mendeteksi jika data dimanipulasi."

---

## Demo 4 — RBAC (Role-Based Access Control)

**Tujuan:** Membuktikan pembatasan akses berbasis peran berjalan di level endpoint API.

### Langkah-langkah:

**4.1 Login sebagai Mahasiswa**
- Login dengan akun mahasiswa yang sudah dibuat

**4.2 Coba akses endpoint Admin → harus ditolak (403)**
- Di DevTools → Console:
  ```javascript
  // Coba akses endpoint khusus admin
  fetch('https://ipb-food-hub-api.vercel.app/api/admin/stats', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => r.json()).then(console.log)
  ```
- Hasil: `{"detail": "Akses ditolak"}` (HTTP 403)

**4.3 Coba akses endpoint UMKM sebagai Mahasiswa → harus ditolak (403)**
  ```javascript
  fetch('https://ipb-food-hub-api.vercel.app/api/pesanan/umkm/masuk', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => { console.log('Status:', r.status); return r.json() }).then(console.log)
  ```
- Hasil: HTTP 403

**4.4 Login sebagai Admin → akses berhasil**
- Login dengan akun admin:
  - Email: *(gunakan akun admin yang sudah ada)*
- Akses https://ipb-food-hub.vercel.app/dashboard/admin
- Atau via API:
  ```javascript
  fetch('https://ipb-food-hub-api.vercel.app/api/admin/stats', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => r.json()).then(console.log)
  ```
- Hasil: statistik user berhasil ditampilkan

**Yang perlu ditunjukkan:**
> "Setiap endpoint dilindungi `require_role`. Role mahasiswa tidak bisa mengakses data admin/UMKM meski memiliki token JWT yang valid. Penolakan akses juga dicatat di audit log."

---

## Demo 5 — Digital Signature Pesanan (RSA-PSS + SHA-256)

**Tujuan:** Membuktikan setiap pesanan memiliki tanda tangan digital yang mengikat ID dan total harga — jika data dimanipulasi, verifikasi gagal.

### Langkah-langkah:

**5.1 Buat pesanan baru (login sebagai mahasiswa)**
- Buka https://ipb-food-hub.vercel.app
- Pilih salah satu UMKM yang buka, pilih menu, klik Pesan
- Di DevTools → Network → klik request `POST /api/pesanan`
- Buka tab **Response**, tunjukkan field `tanda_tangan`:
  ```json
  {
    "pesanan_id": "abc-123-...",
    "total_harga": 25000,
    "tanda_tangan": "ZW5jcnlwdGVk...base64...==",
    ...
  }
  ```
- Catat `pesanan_id` dari response

**5.2 Proses Signing — jelaskan alur**
- Payload yang ditandatangani (deterministic):
  ```json
  {"pesanan_id": "abc-123-...", "total_harga": 25000}
  ```
- Backend menjalankan: `RSA-PSS.sign(SHA-256(payload), private_key)`
- Hasilnya disimpan sebagai `tanda_tangan` (base64, ~344 karakter)
- **Private key RSA-2048** hanya ada di server — tidak pernah dikirim ke client

**5.3 Verifikasi Tanda Tangan — endpoint `/verify-signature`**
- Di DevTools → Console (sudah login):
  ```javascript
  const pesananId = 'ISI_PESANAN_ID_DI_SINI'  // ganti dengan ID dari 5.1

  fetch(`https://ipb-food-hub-api.vercel.app/api/pesanan/${pesananId}/verify-signature`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
  ```
- Response yang diharapkan:
  ```json
  {
    "pesanan_id": "abc-123-...",
    "total_harga": 25000,
    "payload_yang_ditandatangani": "{\"pesanan_id\": \"abc-123-...\", \"total_harga\": 25000}",
    "tanda_tangan_preview": "ZW5jcnlwdGVkQmFzZTY0U3RyaW5nSGVyZUZvcg==...",
    "valid": true
  }
  ```
- Tunjukkan **`"valid": true`** — tanda tangan cocok dengan data pesanan

**5.4 Simulasi Tampering — manipulasi data di DB**
- Di Neon DB Console, jalankan SQL (ubah total_harga):
  ```sql
  UPDATE pesanan
  SET total_harga = 99999
  WHERE pesanan_id = 'ISI_PESANAN_ID_YANG_SAMA';
  ```
- Jalankan ulang perintah verifikasi di Console:
  ```javascript
  fetch(`https://ipb-food-hub-api.vercel.app/api/pesanan/${pesananId}/verify-signature`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => r.json()).then(d => console.log('Valid:', d.valid))
  ```
- Hasil: **`"valid": false`** — sistem mendeteksi total_harga telah dimanipulasi

**5.5 Kembalikan data ke semula**
- Di Neon DB Console:
  ```sql
  UPDATE pesanan SET total_harga = 25000 WHERE pesanan_id = 'ISI_PESANAN_ID';
  ```
- Jalankan ulang verifikasi → kembali `"valid": true`

**Yang perlu ditunjukkan:**
> "Tanda tangan digital RSA-PSS memastikan non-repudiation: total harga dan ID pesanan tidak bisa diubah tanpa terdeteksi. Bahkan admin database sekalipun tidak bisa memanipulasi data transaksi tanpa signature menjadi invalid."

---

## Demo 6 — AAA Audit Log & Security Dashboard

**Tujuan:** Membuktikan semua aktivitas tercatat lengkap untuk akuntabilitas sistem.

### Langkah-langkah:

**6.1 Buat beberapa aktivitas terlebih dahulu**
- Coba login dengan password salah 2-3 kali
- Login dengan password benar
- Akses beberapa halaman

**6.2 Login sebagai Admin**
- Gunakan akun admin
- Akses https://ipb-food-hub.vercel.app/dashboard/admin
- Klik menu **Security / Keamanan**

**6.3 Tunjukkan Security Dashboard**
- Tampilkan statistik:
  - Total login attempts
  - Success rate
  - Failed logins hari ini
  - Active users hari ini
  - Distribusi role

**6.4 Tunjukkan Audit Log**
- Klik menu **Audit Log**
- Filter berdasarkan status code `401` → tampilkan login gagal
- Tunjukkan setiap entri berisi: timestamp, endpoint, status, IP, durasi

**6.5 Tunjukkan via API langsung**
- Di Console (login sebagai admin):
  ```javascript
  fetch('https://ipb-food-hub-api.vercel.app/api/security/audit-logs?page_size=5', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  }).then(r => r.json()).then(d => console.log(JSON.stringify(d.items, null, 2)))
  ```

**Yang perlu ditunjukkan:**
> "Setiap request ke API dicatat otomatis: siapa (user_id), melakukan apa (endpoint + method), kapan (timestamp), dari mana (IP address), dan berhasil atau tidak (status code). Hanya admin yang bisa melihat data ini."

---

## Tips Presentasi

- Gunakan **Browser DevTools tab Network** untuk menampilkan request/response secara real-time
- Untuk tampilan lebih meyakinkan, gunakan **Postman** atau **Thunder Client** agar response JSON lebih rapi
- Siapkan akun admin, UMKM, dan mahasiswa terlebih dahulu sebelum demo
- Screenshot beberapa response penting sebagai backup jika koneksi bermasalah

---

## Akun Demo yang Perlu Disiapkan

| Role | Email | Password | Keterangan |
|------|-------|----------|------------|
| Admin | *(admin yang sudah ada)* | *(password admin)* | Untuk demo RBAC & audit log |
| Mahasiswa | `demo.mhs@apps.ipb.ac.id` | `Demo@12345` | Untuk demo register & pesanan |
| UMKM | *(umkm yang sudah ada)* | *(password umkm)* | Pastikan ada 1 menu aktif |

---

*KOM1315 Keamanan Informasi — Kelompok 9 | Semester Genap 2025/2026*
