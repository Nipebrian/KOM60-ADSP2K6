"""
Script seed data: Mengisi database dengan data dummy untuk testing & demo.
Jalankan: python seed_data.py
"""
from datetime import datetime, timezone, timedelta
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.umkm import UMKM
from app.models.menu import Menu
from app.models.promo import Promo
from app.models.rating import Rating

# Buat semua tabel
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Cek apakah sudah pernah di-seed
    if db.query(User).filter(User.email == "admin@ipb.ac.id").first():
        print("Database sudah memiliki seed data. Seed dibatalkan.")
    else:
        print("Memasukkan seed data...")

        # ===== 1. USERS =====
        admin = User(
            nama="Admin IPB Food Hub",
            email="admin@ipb.ac.id",
            password=get_password_hash("admin123"),
            role="admin",
            no_telp="081200000001",
        )

        mhs1 = User(
            nama="Hasan Fadilah",
            email="hasan@apps.ipb.ac.id",
            password=get_password_hash("hasan123"),
            role="mahasiswa",
            no_telp="081311111111",
            nim="G6401231051",
            fakultas="FMIPA",
            departemen="Ilmu Komputer",
            angkatan="64",
        )

        mhs2 = User(
            nama="Mohammad Mirza Shahbaz",
            email="mirza@apps.ipb.ac.id",
            password=get_password_hash("mirza123"),
            role="mahasiswa",
            no_telp="081322222222",
            nim="G6401231143",
            fakultas="FMIPA",
            departemen="Ilmu Komputer",
            angkatan="64",
        )

        umkm_user1 = User(
            nama="Hanif Febrian",
            email="hanif@apps.ipb.ac.id",
            password=get_password_hash("hanif123"),
            role="umkm",
            no_telp="081333333333",
            nik="3201234567890001",
            nomor_rekening="1234567890",
            nama_bank="BCA",
            nomor_ewallet="081333333333",
        )

        umkm_user2 = User(
            nama="Siti Aminah",
            email="siti@apps.ipb.ac.id",
            password=get_password_hash("siti1234"),
            role="umkm",
            no_telp="081344444444",
            nik="3201234567890002",
            nomor_rekening="0987654321",
            nama_bank="Mandiri",
            nomor_ewallet="081344444444",
        )

        umkm_user3 = User(
            nama="Budi Santoso",
            email="budi@apps.ipb.ac.id",
            password=get_password_hash("budi1234"),
            role="umkm",
            no_telp="081355555555",
            nik="3201234567890003",
            nomor_rekening="1122334455",
            nama_bank="BRI",
        )

        db.add_all([admin, mhs1, mhs2, umkm_user1, umkm_user2, umkm_user3])
        db.flush()

        # ===== 2. UMKM =====
        toko1 = UMKM(
            pemilik_id=umkm_user1.user_id,
            nama_umkm="Warung Nasi Padang Minang",
            deskripsi="Nasi padang autentik dengan lauk lengkap. Sambal ijo dan rendang menjadi andalan kami sejak 2020.",
            alamat="Kantin Sapta Marga, Lantai 1, No. 5",
            kategori="makanan_berat",
            jam_buka="08:00",
            jam_tutup="21:00",
            status_operasional="buka",
            rating_rata_rata=4.7,
        )

        toko2 = UMKM(
            pemilik_id=umkm_user2.user_id,
            nama_umkm="Kedai Kopi Kampus",
            deskripsi="Kedai kopi specialty dengan biji kopi pilihan dari Jawa Barat. Tersedia juga aneka minuman non-kopi dan snack.",
            alamat="Kantin FEM, Lantai 2",
            kategori="minuman",
            jam_buka="07:00",
            jam_tutup="22:00",
            status_operasional="buka",
            rating_rata_rata=4.5,
        )

        toko3 = UMKM(
            pemilik_id=umkm_user3.user_id,
            nama_umkm="Ayam Geprek Mbok Darmi",
            deskripsi="Ayam geprek dengan level sambal 1-10. Crispy di luar, juicy di dalam. Porsi mahasiswa yang mengenyangkan!",
            alamat="Kantin Diploma, No. 12",
            kategori="makanan_berat",
            jam_buka="10:00",
            jam_tutup="20:00",
            status_operasional="buka",
            rating_rata_rata=4.8,
        )

        db.add_all([toko1, toko2, toko3])
        db.flush()

        # ===== 3. MENU =====
        menus = [
            # Warung Nasi Padang
            Menu(umkm_id=toko1.umkm_id, nama_menu="Nasi Padang Rendang", deskripsi="Nasi putih + rendang sapi + sayur daun singkong", harga=18000, kategori="makanan"),
            Menu(umkm_id=toko1.umkm_id, nama_menu="Nasi Padang Ayam Pop", deskripsi="Nasi putih + ayam pop + sambal ijo + perkedel", harga=15000, kategori="makanan"),
            Menu(umkm_id=toko1.umkm_id, nama_menu="Nasi Padang Telur Dadar", deskripsi="Nasi putih + telur dadar + gulai tahu + sambal", harga=12000, kategori="makanan"),
            Menu(umkm_id=toko1.umkm_id, nama_menu="Rendang Sapi (Lauk)", deskripsi="Rendang sapi empuk bumbu rempah", harga=10000, kategori="makanan"),
            Menu(umkm_id=toko1.umkm_id, nama_menu="Es Teh Manis", deskripsi="Es teh manis segar", harga=4000, kategori="minuman"),
            Menu(umkm_id=toko1.umkm_id, nama_menu="Es Jeruk", deskripsi="Es jeruk peras segar", harga=5000, kategori="minuman"),

            # Kedai Kopi Kampus
            Menu(umkm_id=toko2.umkm_id, nama_menu="Americano", deskripsi="Espresso + air panas, bold dan clean", harga=15000, kategori="minuman"),
            Menu(umkm_id=toko2.umkm_id, nama_menu="Caffe Latte", deskripsi="Espresso + susu steamed, creamy dan smooth", harga=18000, kategori="minuman"),
            Menu(umkm_id=toko2.umkm_id, nama_menu="Cappuccino", deskripsi="Espresso + susu + foam tebal", harga=18000, kategori="minuman"),
            Menu(umkm_id=toko2.umkm_id, nama_menu="Matcha Latte", deskripsi="Bubuk matcha premium + susu segar", harga=20000, kategori="minuman"),
            Menu(umkm_id=toko2.umkm_id, nama_menu="Roti Bakar Coklat", deskripsi="Roti bakar isi coklat meleleh + keju", harga=12000, kategori="snack"),
            Menu(umkm_id=toko2.umkm_id, nama_menu="Kentang Goreng", deskripsi="Kentang goreng crispy dengan saus sambal mayo", harga=10000, kategori="snack"),

            # Ayam Geprek
            Menu(umkm_id=toko3.umkm_id, nama_menu="Ayam Geprek Original", deskripsi="Ayam crispy + sambal bawang level 1-10", harga=14000, kategori="makanan"),
            Menu(umkm_id=toko3.umkm_id, nama_menu="Ayam Geprek Mozarella", deskripsi="Ayam geprek + lelehan keju mozarella", harga=18000, kategori="makanan"),
            Menu(umkm_id=toko3.umkm_id, nama_menu="Ayam Geprek Matah", deskripsi="Ayam geprek + sambal matah Bali", harga=16000, kategori="makanan"),
            Menu(umkm_id=toko3.umkm_id, nama_menu="Nasi Putih", deskripsi="Nasi putih pulen", harga=4000, kategori="makanan"),
            Menu(umkm_id=toko3.umkm_id, nama_menu="Es Teh Tarik", deskripsi="Teh tarik dengan busa lembut", harga=6000, kategori="minuman"),
            Menu(umkm_id=toko3.umkm_id, nama_menu="Es Jeruk Nipis", deskripsi="Jeruk nipis segar diperas", harga=5000, kategori="minuman"),
        ]
        db.add_all(menus)
        db.flush()

        # ===== 4. PROMO =====
        now = datetime.now(timezone.utc)
        promos = [
            Promo(
                umkm_id=toko1.umkm_id,
                judul="Diskon 20% Nasi Padang",
                deskripsi="Diskon 20% untuk semua menu nasi padang setiap hari Senin!",
                diskon_persen=20.0,
                tanggal_mulai=now,
                tanggal_berakhir=now + timedelta(days=30),
                syarat_ketentuan="Berlaku setiap hari Senin. Minimal pembelian 1 porsi nasi.",
            ),
            Promo(
                umkm_id=toko2.umkm_id,
                judul="Beli 2 Gratis 1 Kopi",
                deskripsi="Beli 2 gelas kopi apapun, gratis 1 gelas Americano!",
                diskon_persen=33.0,
                tanggal_mulai=now,
                tanggal_berakhir=now + timedelta(days=14),
                syarat_ketentuan="Berlaku untuk pembelian di tempat. Gelas gratis: Americano hot/ice.",
            ),
            Promo(
                umkm_id=toko3.umkm_id,
                judul="Geprek Hemat Rp 12.000",
                deskripsi="Paket ayam geprek original + nasi + es teh hanya Rp 12.000!",
                diskon_persen=15.0,
                tanggal_mulai=now,
                tanggal_berakhir=now + timedelta(days=21),
                syarat_ketentuan="Berlaku jam 11:00-14:00 setiap hari.",
            ),
        ]
        db.add_all(promos)
        db.flush()

        # ===== 5. RATINGS =====
        ratings = [
            Rating(mahasiswa_id=mhs1.user_id, umkm_id=toko1.umkm_id, nilai=5, komentar="Rendangnya juara! Porsi banyak, harga mahasiswa banget.", balasan="Terima kasih, Kak Hasan! Ditunggu kedatangan berikutnya ya 😊"),
            Rating(mahasiswa_id=mhs2.user_id, umkm_id=toko1.umkm_id, nilai=4, komentar="Enak sih, tapi kadang lauknya cepat habis siang hari."),
            Rating(mahasiswa_id=mhs1.user_id, umkm_id=toko2.umkm_id, nilai=5, komentar="Kopi terbaik di kampus! Barista-nya ramah dan latte art-nya keren."),
            Rating(mahasiswa_id=mhs2.user_id, umkm_id=toko2.umkm_id, nilai=4, komentar="Tempatnya nyaman buat ngerjain tugas, WiFi-nya kenceng."),
            Rating(mahasiswa_id=mhs1.user_id, umkm_id=toko3.umkm_id, nilai=5, komentar="Level 7 pedasnya mantul! Ayamnya besar dan crispy."),
            Rating(mahasiswa_id=mhs2.user_id, umkm_id=toko3.umkm_id, nilai=5, komentar="Geprek mozarella-nya gila sih, cheesy banget. Wajib coba!"),
        ]
        db.add_all(ratings)

        db.commit()
        print("Seed data berhasil dimasukkan!")
        print(f"   - 6 Users (1 admin, 2 mahasiswa, 3 UMKM)")
        print(f"   - 3 UMKM")
        print(f"   - 18 Menu items")
        print(f"   - 3 Promo")
        print(f"   - 6 Rating/ulasan")
        print()
        print("Akun login untuk testing:")
        print("   Admin   : admin@ipb.ac.id / admin123")
        print("   Mahasiswa: hasan@apps.ipb.ac.id / hasan123")
        print("   Mahasiswa: mirza@apps.ipb.ac.id / mirza123")
        print("   UMKM    : hanif@apps.ipb.ac.id / hanif123")
        print("   UMKM    : siti@apps.ipb.ac.id / siti1234")
        print("   UMKM    : budi@apps.ipb.ac.id / budi1234")

except Exception as e:
    db.rollback()
    print(f"Error saat seed: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
