"""
Automated API test script - menguji seluruh endpoint backend.
Jalankan dari folder backend/: python tests/test_all_endpoints.py
"""
import requests
import json
import sys
import time

BASE = "http://127.0.0.1:8000"
passed = 0
failed = 0
errors = []

# Suffix unik per-run agar tidak tabrakan dengan data sebelumnya
TS = str(int(time.time()))[-6:]
TEST_MHS_EMAIL  = f"testmhs{TS}@test.com"
TEST_UMKM_EMAIL = f"testumkm{TS}@test.com"


def test(name, method, url, expected_status, **kwargs):
    global passed, failed
    try:
        resp = getattr(requests, method)(f"{BASE}{url}", **kwargs)
        if resp.status_code == expected_status:
            passed += 1
            print(f"  [OK] {name} -> {resp.status_code}")
            return resp.json() if resp.text else {}
        else:
            failed += 1
            detail = ""
            try:
                detail = resp.json().get("detail", "")
            except:
                detail = resp.text[:100]
            errors.append(f"{name}: expected {expected_status}, got {resp.status_code} ({detail})")
            print(f"  [FAIL] {name} -> {resp.status_code} ({detail})")
            return None
    except Exception as e:
        failed += 1
        errors.append(f"{name}: {e}")
        print(f"  [ERROR] {name} -> {e}")
        return None


print("=" * 60)
print("  IPB Food Hub - Backend API Full Test")
print("=" * 60)

# === 1. HEALTH CHECK ===
print("\n--- Health Check ---")
test("Health Check", "get", "/api/health", 200)
test("Root endpoint", "get", "/", 200)

# === 2. AUTH ===
print("\n--- Auth: Register ---")
test("Register mahasiswa", "post", "/api/auth/register", 201, json={
    "nama": "Test Mahasiswa", "email": TEST_MHS_EMAIL,
    "password": "test1234", "role": "mahasiswa", "nim": "G64999",
    "fakultas": "FMIPA", "departemen": "Ilmu Komputer", "angkatan": "64"
})
test("Register UMKM user", "post", "/api/auth/register", 201, json={
    "nama": "Test UMKM Owner", "email": TEST_UMKM_EMAIL,
    "password": "test1234", "role": "umkm", "nik": "320123456"
})
test("Register duplicate email", "post", "/api/auth/register", 400, json={
    "nama": "Dup", "email": TEST_MHS_EMAIL, "password": "test1234", "role": "mahasiswa"
})

print("\n--- Auth: Login ---")
mhs_login = test("Login mahasiswa", "post", "/api/auth/login", 200,
    data={"username": TEST_MHS_EMAIL, "password": "test1234"})
umkm_login = test("Login UMKM", "post", "/api/auth/login", 200,
    data={"username": TEST_UMKM_EMAIL, "password": "test1234"})
admin_login = test("Login Admin", "post", "/api/auth/login", 200,
    data={"username": "admin@ipb.ac.id", "password": "admin123"})
# Login seed mahasiswa lain (digunakan untuk uji akses terlarang)
mirza_login = requests.post(f"{BASE}/api/auth/login",
    data={"username": "mirza@apps.ipb.ac.id", "password": "mirza123"})
test("Login wrong password", "post", "/api/auth/login", 401,
    data={"username": TEST_MHS_EMAIL, "password": "wrongpass"})

MHS_TOKEN = mhs_login["access_token"] if mhs_login else ""
UMKM_TOKEN = umkm_login["access_token"] if umkm_login else ""
ADMIN_TOKEN = admin_login["access_token"] if admin_login else ""
MIRZA_TOKEN = mirza_login.json().get("access_token", "") if mirza_login.status_code == 200 else ""
mhs_headers = {"Authorization": f"Bearer {MHS_TOKEN}"}
umkm_headers = {"Authorization": f"Bearer {UMKM_TOKEN}"}
admin_headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
mirza_headers = {"Authorization": f"Bearer {MIRZA_TOKEN}"}

print("\n--- Auth: Profile ---")
test("Get me (mahasiswa)", "get", "/api/auth/me", 200, headers=mhs_headers)
test("Get me (no token)", "get", "/api/auth/me", 401)
test("Update profile", "put", "/api/auth/me", 200, headers=mhs_headers,
    json={"nama": "Test Mahasiswa Updated"})

# === 3. UMKM ===
print("\n--- UMKM: CRUD ---")
umkm_resp = test("Create UMKM", "post", "/api/umkm", 201, headers=umkm_headers, json={
    "nama_umkm": "Test Warung", "deskripsi": "Warung test",
    "alamat": "Kantin Test", "kategori": "makanan_berat",
    "jam_buka": "08:00", "jam_tutup": "20:00"
})
UMKM_ID = umkm_resp["umkm_id"] if umkm_resp else ""

test("Create UMKM duplicate", "post", "/api/umkm", 400, headers=umkm_headers, json={
    "nama_umkm": "Test2", "alamat": "Test", "kategori": "minuman"
})
test("List UMKM (public)", "get", "/api/umkm", 200)
test("List UMKM filtered", "get", "/api/umkm?kategori=makanan_berat&search=Test", 200)
test("Get UMKM detail", "get", f"/api/umkm/{UMKM_ID}", 200)
test("Get UMKM not found", "get", "/api/umkm/nonexistent-id", 404)
test("Update UMKM", "put", f"/api/umkm/{UMKM_ID}", 200, headers=umkm_headers,
    json={"deskripsi": "Updated description"})
test("Update UMKM forbidden (mahasiswa)", "put", f"/api/umkm/{UMKM_ID}", 403,
    headers=mhs_headers, json={"deskripsi": "Hack"})

# === 4. MENU ===
print("\n--- Menu: CRUD ---")
menu_resp = test("Create menu", "post", f"/api/umkm/{UMKM_ID}/menu", 201, headers=umkm_headers, json={
    "nama_menu": "Nasi Goreng Test", "harga": 15000, "kategori": "makanan",
    "deskripsi": "Nasi goreng spesial"
})
MENU_ID = menu_resp["menu_id"] if menu_resp else ""

menu2_resp = test("Create menu 2", "post", f"/api/umkm/{UMKM_ID}/menu", 201, headers=umkm_headers, json={
    "nama_menu": "Es Teh Test", "harga": 5000, "kategori": "minuman"
})
MENU2_ID = menu2_resp["menu_id"] if menu2_resp else ""

test("List menu (public)", "get", f"/api/umkm/{UMKM_ID}/menu", 200)
test("Get menu detail", "get", f"/api/umkm/{UMKM_ID}/menu/{MENU_ID}", 200)
test("Update menu", "put", f"/api/umkm/{UMKM_ID}/menu/{MENU_ID}", 200, headers=umkm_headers,
    json={"harga": 17000})
test("Update menu forbidden (mahasiswa)", "put", f"/api/umkm/{UMKM_ID}/menu/{MENU_ID}", 403,
    headers=mhs_headers, json={"harga": 0})

# === 5. PESANAN ===
print("\n--- Pesanan: Create & Flow ---")
pesanan_resp = test("Create pesanan", "post", "/api/pesanan", 201, headers=mhs_headers, json={
    "umkm_id": UMKM_ID,
    "items": [
        {"menu_id": MENU_ID, "jumlah": 2},
        {"menu_id": MENU2_ID, "jumlah": 1}
    ],
    "catatan_pesanan": "Tidak pake bawang"
})
PESANAN_ID = pesanan_resp["pesanan_id"] if pesanan_resp else ""

test("Create pesanan - menu not found", "post", "/api/pesanan", 404, headers=mhs_headers, json={
    "umkm_id": UMKM_ID, "items": [{"menu_id": "fake-id", "jumlah": 1}]
})
test("Get my pesanan", "get", "/api/pesanan/saya", 200, headers=mhs_headers)
test("Get pesanan detail", "get", f"/api/pesanan/{PESANAN_ID}", 200, headers=mhs_headers)
# UMKM owner bisa akses pesanan mereka sendiri (200), mahasiswa lain tidak (403)
test("Get pesanan detail (UMKM owner)", "get", f"/api/pesanan/{PESANAN_ID}", 200,
    headers=umkm_headers)
test("Get pesanan forbidden (mahasiswa lain)", "get", f"/api/pesanan/{PESANAN_ID}", 403,
    headers=mirza_headers)

print("\n--- Pesanan: UMKM side ---")
# Login as seed UMKM user to check pesanan masuk for their store
test("Get pesanan masuk (UMKM)", "get", "/api/pesanan/umkm/masuk", 200, headers=umkm_headers)

print("\n--- Pesanan: Status update ---")
test("Update status (UMKM)", "put", f"/api/pesanan/{PESANAN_ID}/status", 200, headers=umkm_headers,
    json={"status_pesanan": "menunggu_validasi"})
test("Update status invalid", "put", f"/api/pesanan/{PESANAN_ID}/status", 400, headers=umkm_headers,
    json={"status_pesanan": "invalid_status"})

# === 6. RATING ===
print("\n--- Rating ---")
# Use seed data UMKM IDs for rating tests
seed_umkm_list = requests.get(f"{BASE}/api/umkm").json()
SEED_UMKM_ID = seed_umkm_list["data"][0]["umkm_id"] if seed_umkm_list["data"] else ""

rating_resp = test("Create rating", "post", "/api/rating", 201, headers=mhs_headers, json={
    "umkm_id": SEED_UMKM_ID, "nilai": 5, "komentar": "Mantap!"
})
RATING_ID = rating_resp["rating_id"] if rating_resp else ""

test("Create rating invalid nilai", "post", "/api/rating", 400, headers=mhs_headers, json={
    "umkm_id": SEED_UMKM_ID, "nilai": 6, "komentar": "Too high"
})
test("List ratings (public)", "get", f"/api/rating/umkm/{SEED_UMKM_ID}", 200)
test("Rating summary", "get", f"/api/rating/umkm/{SEED_UMKM_ID}/summary", 200)

# Balas rating - UMKM list diurutkan by rating_rata_rata DESC
# data[0] = Ayam Geprek Mbok Darmi (4.8) milik budi@apps.ipb.ac.id
seed_umkm_owner_login = requests.post(f"{BASE}/api/auth/login",
    data={"username": "budi@apps.ipb.ac.id", "password": "budi1234"})
if seed_umkm_owner_login.status_code == 200:
    seed_umkm_headers = {"Authorization": f"Bearer {seed_umkm_owner_login.json()['access_token']}"}
    test("Balas rating (UMKM owner)", "put", f"/api/rating/{RATING_ID}/balasan", 200,
        headers=seed_umkm_headers, json={"balasan": "Terima kasih!"})

# === 7. PROMO ===
print("\n--- Promo ---")
test("List promo (public)", "get", "/api/promo", 200)
promo_resp = test("Create promo", "post", "/api/promo", 201, headers=umkm_headers, json={
    "judul": "Diskon Test 10%", "deskripsi": "Promo test",
    "diskon_persen": 10, "tanggal_mulai": "2025-01-01T00:00:00",
    "tanggal_berakhir": "2025-12-31T23:59:59"
})
PROMO_ID = promo_resp["promo_id"] if promo_resp else ""

test("Create promo invalid dates", "post", "/api/promo", 400, headers=umkm_headers, json={
    "judul": "Bad Promo", "diskon_persen": 10,
    "tanggal_mulai": "2025-12-31T00:00:00", "tanggal_berakhir": "2025-01-01T00:00:00"
})
test("Update promo", "put", f"/api/promo/{PROMO_ID}", 200, headers=umkm_headers,
    json={"judul": "Diskon Updated 15%"})
test("List promo by UMKM", "get", f"/api/promo/umkm/{UMKM_ID}", 200)

# === 8. ADMIN ===
print("\n--- Admin ---")
test("Admin stats", "get", "/api/admin/stats", 200, headers=admin_headers)
test("Admin stats forbidden (mahasiswa)", "get", "/api/admin/stats", 403, headers=mhs_headers)
test("Admin list users", "get", "/api/admin/users", 200, headers=admin_headers)
test("Admin list users filtered", "get", "/api/admin/users?role=mahasiswa&search=Test", 200, headers=admin_headers)
test("Admin update user status", "put", "/api/admin/users/fake-id/status?new_status=suspended", 404, headers=admin_headers)

# === 9. CLEANUP ===
print("\n--- Cleanup ---")
if PROMO_ID:
    test("Delete promo", "delete", f"/api/promo/{PROMO_ID}", 200, headers=umkm_headers)
if RATING_ID:
    test("Delete rating", "delete", f"/api/rating/{RATING_ID}", 200, headers=mhs_headers)
if MENU2_ID:
    test("Delete menu", "delete", f"/api/umkm/{UMKM_ID}/menu/{MENU2_ID}", 200, headers=umkm_headers)

# === SUMMARY ===
print("\n" + "=" * 60)
print(f"  HASIL: {passed} PASSED, {failed} FAILED")
print("=" * 60)
if errors:
    print("\nDetail error:")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print("\nSemua endpoint berjalan dengan benar!")
    sys.exit(0)
