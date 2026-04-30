# Penjelasan Fitur — IPB Food & UMKM Student Hub
### Progress Report | KOM 1337 – Analisis dan Desain Sistem | Kelompok 6 P2

---

## Arsitektur Sistem: 3 Aktor, 12 Kelas, 5 Pilar Fitur

Sistem ini dibangun dengan arsitektur **Object-Oriented** menggunakan **12 kelas utama** yang saling terhubung melalui relasi Generalization, Composition, Association, dan Dependency.

### Aktor Sistem

| Aktor | Peran Utama |
|-------|-------------|
| **Mahasiswa** | Konsumen — browse UMKM, pesan makanan, bayar, beri rating |
| **Pelaku UMKM** | Penjual — kelola toko, menu, harga, promo, validasi pembayaran |
| **Admin** | Pengelola platform — moderasi, kelola akun, pantau transaksi |

> Ketiga aktor merupakan turunan (inheritance) dari kelas abstrak **User** yang memiliki atribut dan method dasar: `login()`, `logout()`, `updateProfil()`.

---

## Fitur 1: Direktori UMKM Terpusat

**Tujuan:** Menyediakan katalog lengkap semua UMKM makanan di kampus IPB dalam satu platform.

**Cara Kerja:**
- Mahasiswa memanggil `lihatDaftarUMKM()` → sistem menampilkan seluruh data UMKM (nama, foto, kategori, lokasi, rating)
- Bisa difilter berdasarkan **kategori** (makanan berat, minuman, snack) dan **status operasional**
- Method `UMKM.isOpen()` mengecek `jamBuka` & `jamTutup` secara real-time
- Pilih UMKM → `lihatDetailUMKM()` menampilkan profil lengkap + daftar menu

**Kelas:** `Mahasiswa`, `UMKM`, `Menu`
**Relasi:** Mahasiswa → UMKM (browse), UMKM ◆── Menu (Composition 1 : 0..*)

---

## Fitur 2: Pre-order & Pemesanan Digital

**Tujuan:** Mahasiswa bisa memesan makanan terlebih dahulu tanpa harus mengantri langsung.

**Cara Kerja:**
- Mahasiswa pilih menu → tentukan jumlah & catatan → `buatPesanan()`
- Sistem membuat objek `Pesanan` + satu/lebih `DetailPesanan`
- Setiap `DetailPesanan` menghitung `subtotal = jumlah × hargaSatuan`
- `Pesanan.hitungTotal()` menjumlahkan seluruh subtotal
- Mahasiswa menentukan `waktuPengambilan` untuk jadwal ambil

**Alur Status Pesanan:**
```
Menunggu Pembayaran → Menunggu Validasi → Diproses → Siap Diambil → Selesai
                                                ↘ Ditolak
```

**Kelas:** `Mahasiswa`, `Pesanan`, `DetailPesanan`, `Menu`, `UMKM`
**Relasi:**
- Mahasiswa → Pesanan (Association 1 : 0..*)
- Pesanan ◆── DetailPesanan (Composition 1 : 1..*)
- DetailPesanan → Menu (Directed Association 0..* : 1)
- Pesanan → UMKM (Directed Association 0..* : 1)

---

## Fitur 3: Pembayaran Manual & Upload Bukti

**Tujuan:** Mendukung transaksi cashless melalui transfer manual dengan verifikasi bukti oleh UMKM.

**Cara Kerja:**
1. Setelah pesanan dibuat, sistem otomatis membuat objek `Pembayaran` berisi info tujuan transfer (rekening/e-wallet UMKM)
2. Mahasiswa melakukan transfer **di luar aplikasi** (mbanking, e-wallet, scan QRIS)
3. Mahasiswa `uploadBuktiPembayaran()` → membuat objek `BuktiPembayaran` dengan foto bukti
4. Status berubah: **"Menunggu Validasi"**
5. Pelaku UMKM memanggil `validasiPembayaran()`:
   - ✅ Valid → `statusVerifikasi = "Terverifikasi"`, pesanan diproses
   - ❌ Tidak valid → `statusVerifikasi = "Ditolak"` + alasan penolakan

**Metode Pembayaran:** Transfer Bank, E-Wallet (GoPay/OVO/DANA), QRIS

**Kelas:** `Pembayaran`, `BuktiPembayaran`, `PelakuUMKM`, `Mahasiswa`
**Relasi:**
- Pesanan ◆── Pembayaran (Composition 1 : 1)
- Pembayaran ◆── BuktiPembayaran (Composition 1 : 0..1)

---

## Fitur 4: Rating & Ulasan

**Tujuan:** Membangun sistem reputasi UMKM berdasarkan pengalaman nyata mahasiswa.

**Cara Kerja:**
- Setelah pesanan berstatus **"Selesai"**, mahasiswa dapat `beriRating()`
- Rating berisi: **nilai** (1-5 bintang) + **komentar** (opsional)
- Setiap rating baru → `UMKM.hitungRatingRataRata()` memperbarui skor
- Pelaku UMKM bisa merespons ulasan via `Rating.updateBalasan()`

**Validasi:**
- Hanya mahasiswa yang telah menyelesaikan pesanan yang bisa memberi rating
- Satu pesanan = satu rating (mencegah duplikasi)

**Kelas:** `Rating`, `Mahasiswa`, `UMKM`
**Relasi:**
- Mahasiswa → Rating (Association 1 : 0..*)
- Rating → UMKM (Association 0..* : 1)

---

## Fitur 5: Pusat Promo & Diskon

**Tujuan:** UMKM dapat mempromosikan penawaran spesial, mahasiswa bisa melihat semua promo aktif.

**Cara Kerja:**
- Pelaku UMKM memanggil `buatPromo()` → membuat objek `Promo` dengan judul, deskripsi, persentase diskon, periode aktif, dan syarat ketentuan
- `Promo.isActive()` mengecek apakah promo masih berlaku (berdasarkan tanggal)
- Mahasiswa memanggil `lihatPromo()` → melihat semua promo yang `statusAktif = true`
- UMKM bisa `activate()` / `deactivate()` promo kapan saja

**Kelas:** `Promo`, `PelakuUMKM`, `UMKM`, `Mahasiswa`
**Relasi:** UMKM ◆── Promo (Composition 1 : 0..*)

---

## Fitur 6: Dashboard Manajemen UMKM

**Tujuan:** UMKM punya panel mandiri untuk mengelola seluruh operasional tanpa bantuan admin.

**Fitur dalam Dashboard:**

| Modul | Method | Fungsi |
|-------|--------|--------|
| Kelola Menu | `tambahMenu()`, `editMenu()`, `hapusMenu()` | CRUD menu + atur harga & ketersediaan |
| Pesanan Masuk | `updateStatusPesanan()` | Lihat & proses pesanan baru |
| Validasi Bayar | `validasiPembayaran()` | Verifikasi bukti transfer |
| Kelola Promo | `buatPromo()`, `kelolaPromo()` | Buat & atur promo |
| Riwayat | `lihatRiwayatTransaksi()` | Histori semua transaksi |
| Statistik | `lihatDashboard()` | Ringkasan penjualan & rating |

**Kelas:** `PelakuUMKM`, `UMKM`, `Menu`, `Pesanan`, `Pembayaran`, `Promo`

---

## Fitur 7: Panel Administrasi Platform

**Tujuan:** Admin dapat mengelola dan memoderasi seluruh ekosistem platform.

**Fitur Admin:**

| Modul | Method | Fungsi |
|-------|--------|--------|
| Kelola Akun | `kelolaAkunMahasiswa()`, `kelolaAkunUMKM()` | Approve, suspend, hapus akun |
| Verifikasi UMKM | `approveUMKM()` | Review & setujui pendaftaran UMKM baru |
| Moderasi | `moderasiUlasan()`, `moderasiPromo()` | Tindak konten tidak sesuai |
| Monitor | `pantauTransaksi()` | Pantau seluruh transaksi platform |
| Statistik | `lihatStatistik()` | Data & analitik keseluruhan platform |

**Kelas:** `Admin`, `User`, `UMKM`
**Relasi:** Admin ⇢ User (Dependency — manages), Admin ⇢ UMKM (Dependency — moderates)

---

## Ringkasan Relasi Antar Kelas

| No | Dari | Ke | Tipe Relasi | Multiplisitas |
|----|------|----|-------------|---------------|
| 1 | User | Mahasiswa | Generalization | is-a |
| 2 | User | PelakuUMKM | Generalization | is-a |
| 3 | User | Admin | Generalization | is-a |
| 4 | PelakuUMKM | UMKM | Association | 1 : 1 |
| 5 | UMKM | Menu | Composition | 1 : 0..* |
| 6 | Mahasiswa | Pesanan | Association | 1 : 0..* |
| 7 | Pesanan | UMKM | Association | 0..* : 1 |
| 8 | Pesanan | DetailPesanan | Composition | 1 : 1..* |
| 9 | DetailPesanan | Menu | Association | 0..* : 1 |
| 10 | Pesanan | Pembayaran | Composition | 1 : 1 |
| 11 | Pembayaran | BuktiPembayaran | Composition | 1 : 0..1 |
| 12 | Mahasiswa | Rating | Association | 1 : 0..* |
| 13 | Rating | UMKM | Association | 0..* : 1 |
| 14 | UMKM | Promo | Composition | 1 : 0..* |
| 15 | Admin | User | Dependency | manages |
| 16 | Admin | UMKM | Dependency | moderates |
