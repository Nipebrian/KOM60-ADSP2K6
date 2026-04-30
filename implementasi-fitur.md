# Penjelasan Implementasi Fitur
## IPB Food & UMKM Student Hub
### KOM 1337 – Analisis dan Desain Sistem | Kelompok 6 P2

---

## 1. Platform Informasi Terpusat (Direktori UMKM)

### Deskripsi
Fitur ini menyediakan **direktori digital terpusat** seluruh UMKM makanan di lingkungan kampus IPB. Mahasiswa dapat menelusuri, mencari, dan memfilter UMKM berdasarkan kategori, lokasi, dan status operasional.

### Kelas Terlibat
| Kelas | Peran |
|-------|-------|
| `Mahasiswa` | Aktor yang mengakses direktori |
| `UMKM` | Entitas utama yang ditampilkan |
| `Menu` | Daftar produk dari setiap UMKM |

### Alur Implementasi
1. Mahasiswa memanggil `lihatDaftarUMKM()` → sistem mengambil semua objek `UMKM` dari database
2. Data ditampilkan dalam bentuk kartu berisi: nama, foto, kategori, rating, dan status buka/tutup
3. Mahasiswa bisa memfilter berdasarkan `kategori` dan `statusOperasional`
4. Saat memilih UMKM, `lihatDetailUMKM(umkmId)` dipanggil → menampilkan profil lengkap + daftar `Menu`
5. Method `isOpen()` pada kelas `UMKM` mengecek `jamBuka` dan `jamTutup` untuk menentukan status real-time

### Atribut Kunci
- `UMKM.kategori` → filter berdasarkan jenis (Makanan Berat, Minuman, Snack, dll.)
- `UMKM.ratingRataRata` → sorting berdasarkan popularitas
- `UMKM.statusOperasional` → indikator buka/tutup

---

## 2. Pre-order & Pemesanan Digital

### Deskripsi
Mahasiswa dapat **memesan makanan lebih dulu** (pre-order) melalui platform tanpa harus datang langsung dan mengantri di UMKM.

### Kelas Terlibat
| Kelas | Peran |
|-------|-------|
| `Mahasiswa` | Membuat pesanan |
| `Pesanan` | Entitas utama transaksi |
| `DetailPesanan` | Item-item dalam pesanan |
| `Menu` | Produk yang dipesan |
| `UMKM` | Penerima pesanan |

### Alur Implementasi
1. Mahasiswa memilih menu dari `UMKM.getMenu()` → menambahkan ke keranjang
2. Untuk setiap item, dibuat objek `DetailPesanan` dengan atribut `jumlah`, `hargaSatuan`, dan `catatan`
3. `DetailPesanan.hitungSubtotal()` menghitung `jumlah × hargaSatuan`
4. Mahasiswa memanggil `buatPesanan()` → sistem membuat objek `Pesanan` baru
5. `Pesanan.hitungTotal()` menjumlahkan seluruh `subtotal` dari `DetailPesanan` terkait
6. `statusPesanan` diset ke **"Menunggu Pembayaran"**
7. Mahasiswa menentukan `waktuPengambilan` untuk jadwal ambil pesanan

### Status Pesanan (State Flow)
```
Menunggu Pembayaran → Menunggu Validasi → Diproses → Siap Diambil → Selesai
                                        ↘ Ditolak
```

---

## 3. Pembayaran Manual & Upload Bukti

### Deskripsi
Sistem pembayaran menggunakan metode **transfer manual** (bank transfer, e-wallet, atau QRIS) di mana mahasiswa melakukan pembayaran di luar aplikasi kemudian mengunggah bukti pembayaran untuk divalidasi oleh UMKM.

### Kelas Terlibat
| Kelas | Peran |
|-------|-------|
| `Pembayaran` | Menyimpan data transaksi pembayaran |
| `BuktiPembayaran` | Menyimpan foto bukti transfer |
| `PelakuUMKM` | Memvalidasi bukti pembayaran |
| `Mahasiswa` | Mengunggah bukti |

### Alur Implementasi
1. Setelah `Pesanan` dibuat, sistem otomatis membuat objek `Pembayaran` (relasi **Composition 1:1**)
2. Mahasiswa melihat informasi tujuan transfer (`tujuanTransfer` pada `Pembayaran`) — berisi nomor rekening/e-wallet UMKM
3. Mahasiswa melakukan transfer **di luar aplikasi** (mbanking, e-wallet, QRIS)
4. Mahasiswa memanggil `uploadBuktiPembayaran()` → membuat objek `BuktiPembayaran` dengan foto bukti transfer
5. `statusPembayaran` diubah ke **"Menunggu Validasi"**
6. `PelakuUMKM` memanggil `validasiPembayaran()`:
   - Jika valid → `statusVerifikasi = "Terverifikasi"`, `statusPesanan = "Diproses"`
   - Jika tidak valid → `statusVerifikasi = "Ditolak"`, ditambah `catatanVerifikasi` alasan penolakan

### Metode Pembayaran yang Didukung
- Transfer Bank (BCA, BRI, Mandiri, dll.)
- E-Wallet (GoPay, OVO, DANA, ShopeePay)
- QRIS (scan & pay)

---

## 4. Rating & Ulasan

### Deskripsi
Mahasiswa dapat **memberikan rating dan ulasan** setelah pesanan selesai. Fitur ini membantu mahasiswa lain memilih UMKM terbaik dan mendorong UMKM meningkatkan kualitas.

### Kelas Terlibat
| Kelas | Peran |
|-------|-------|
| `Rating` | Entitas ulasan |
| `Mahasiswa` | Pemberi rating |
| `UMKM` | Penerima rating |

### Alur Implementasi
1. Setelah `statusPesanan = "Selesai"`, mahasiswa mendapat opsi memberi rating
2. Mahasiswa memanggil `beriRating()` → membuat objek `Rating` dengan `nilai` (1-5) dan `komentar`
3. Objek `Rating` terhubung ke `Mahasiswa` (pemberi) dan `UMKM` (penerima)
4. Setiap rating baru ditambahkan, `UMKM.hitungRatingRataRata()` dipanggil untuk memperbarui `ratingRataRata`
5. `PelakuUMKM` bisa merespon ulasan via `Rating.updateBalasan()`

### Validasi
- Hanya mahasiswa yang telah menyelesaikan pesanan yang dapat memberi rating
- Satu pesanan = satu rating (tidak bisa duplikat)
- Rating 1-5 bintang + komentar opsional

---

## 5. Pusat Promo

### Deskripsi
Pelaku UMKM dapat **membuat dan mengelola promo/diskon** untuk menarik lebih banyak pelanggan. Mahasiswa dapat melihat semua promo aktif dalam satu halaman terpusat.

### Kelas Terlibat
| Kelas | Peran |
|-------|-------|
| `Promo` | Entitas promosi |
| `PelakuUMKM` | Pembuat promo |
| `UMKM` | Pemilik promo |
| `Mahasiswa` | Melihat promo |

### Alur Implementasi
1. `PelakuUMKM` memanggil `buatPromo()` → membuat objek `Promo` terkait `UMKM`
2. Promo memiliki `tanggalMulai`, `tanggalBerakhir`, `diskonPersen`, dan `syaratKetentuan`
3. `Promo.isActive()` mengecek apakah tanggal saat ini berada di antara `tanggalMulai` dan `tanggalBerakhir`
4. Mahasiswa memanggil `lihatPromo()` → sistem menampilkan semua promo dengan `statusAktif = true`
5. `PelakuUMKM` bisa `activate()` atau `deactivate()` promo kapan saja

---

## 6. Dasbor Manajemen UMKM

### Deskripsi
Setiap pelaku UMKM memiliki **dashboard mandiri** untuk mengelola seluruh aspek operasional toko mereka tanpa bantuan admin.

### Kelas Terlibat
| Kelas | Peran |
|-------|-------|
| `PelakuUMKM` | Pengguna dashboard |
| `UMKM` | Data toko |
| `Menu` | Pengelolaan produk |
| `Pesanan` | Monitoring pesanan |
| `Pembayaran` | Validasi pembayaran |
| `Promo` | Pengelolaan promo |

### Fitur Dashboard
| Fitur | Method | Deskripsi |
|-------|--------|-----------|
| Kelola Menu | `tambahMenu()`, `editMenu()`, `hapusMenu()` | CRUD menu lengkap dengan harga dan foto |
| Pesanan Masuk | `updateStatusPesanan()` | Lihat dan proses pesanan baru |
| Validasi Bayar | `validasiPembayaran()` | Verifikasi bukti transfer mahasiswa |
| Kelola Promo | `buatPromo()`, `kelolaPromo()` | Buat dan atur promo aktif |
| Riwayat | `lihatRiwayatTransaksi()` | Lihat histori semua transaksi |
| Statistik | `lihatDashboard()` | Ringkasan penjualan, pendapatan, rating |

---

## 7. Panel Admin

### Deskripsi
Admin platform memiliki akses untuk **mengelola dan memoderasi** seluruh aktivitas di sistem.

### Kelas Terlibat
| Kelas | Peran |
|-------|-------|
| `Admin` | Pengelola platform |
| `User` (semua subclass) | Objek yang dikelola |
| `UMKM` | Objek yang dimoderasi |

### Fitur Admin
| Fitur | Method | Deskripsi |
|-------|--------|-----------|
| Kelola Akun | `kelolaAkunMahasiswa()`, `kelolaAkunUMKM()` | Approve, suspend, hapus akun |
| Approve UMKM | `approveUMKM()` | Verifikasi UMKM baru sebelum aktif |
| Moderasi | `moderasiUlasan()`, `moderasiPromo()` | Pantau konten yang tidak sesuai |
| Monitor | `pantauTransaksi()` | Lihat semua transaksi platform |
| Statistik | `lihatStatistik()` | Data keseluruhan platform |

---

## Ringkasan Hubungan Antar Kelas

| No | Relasi | Tipe | Multiplisitas |
|----|--------|------|---------------|
| 1 | User → Mahasiswa | Generalization | - |
| 2 | User → PelakuUMKM | Generalization | - |
| 3 | User → Admin | Generalization | - |
| 4 | PelakuUMKM → UMKM | Association | 1 : 1 |
| 5 | UMKM → Menu | Composition | 1 : 0..* |
| 6 | Mahasiswa → Pesanan | Association | 1 : 0..* |
| 7 | Pesanan → UMKM | Association | 0..* : 1 |
| 8 | Pesanan → DetailPesanan | Composition | 1 : 1..* |
| 9 | DetailPesanan → Menu | Association | 0..* : 1 |
| 10 | Pesanan → Pembayaran | Composition | 1 : 1 |
| 11 | Pembayaran → BuktiPembayaran | Composition | 1 : 0..1 |
| 12 | Mahasiswa → Rating | Association | 1 : 0..* |
| 13 | Rating → UMKM | Association | 0..* : 1 |
| 14 | UMKM → Promo | Composition | 1 : 0..* |
| 15 | Admin → User | Dependency | manages |
| 16 | Admin → UMKM | Dependency | moderates |
