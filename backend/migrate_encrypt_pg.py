"""
Script Migrasi PostgreSQL — ALTER COLUMN + Re-Enkripsi Data

Jalankan SEKALI setelah semua file patch di-copy ke repo:

    cd backend
    python migrate_encrypt_pg.py

Yang dilakukan script ini:
  STEP 1 — ALTER TABLE: ubah tipe kolom sensitif dari VARCHAR -> TEXT
  STEP 2 — Re-enkripsi: baca tiap baris, enkripsi nilai plaintext, simpan ciphertext
  STEP 3 — Verifikasi: decode beberapa sampel untuk konfirmasi

AMAN dijalankan lebih dari sekali — skip kolom yang sudah terenkripsi.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

import base64
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL   = os.getenv("DATABASE_URL", "")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")

if not DATABASE_URL:
    print("x  DATABASE_URL belum diset di .env")
    sys.exit(1)
if not ENCRYPTION_KEY:
    print("x  ENCRYPTION_KEY belum diset di .env")
    print('   Generate: python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"')
    sys.exit(1)
if "sqlite" in DATABASE_URL.lower():
    print("x  DATABASE_URL masih SQLite. Patch ini khusus PostgreSQL.")
    sys.exit(1)

from app.core.crypto import encrypt, decrypt
from cryptography.exceptions import InvalidTag

SENSITIVE_COLS = ["no_telp", "nik", "nomor_rekening", "nomor_ewallet"]


def looks_encrypted(val: str) -> bool:
    """Heuristic: ciphertext AES-GCM base64 selalu >= 40 char."""
    if not val or len(val) < 40:
        return False
    try:
        decoded = base64.b64decode(val, validate=True)
        return len(decoded) >= 28
    except Exception:
        return False


def alter_columns(conn):
    print("\n[STEP 1] Mengubah tipe kolom sensitif -> TEXT...")
    altered = 0
    for col in SENSITIVE_COLS:
        result = conn.execute(text("""
            SELECT data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = :col
        """), {"col": col}).fetchone()

        if result is None:
            print(f"  !  Kolom '{col}' tidak ditemukan di tabel users -- skip")
            continue

        data_type = result[0].lower()
        char_len  = result[1]

        if data_type == "text":
            print(f"  v  {col}: sudah TEXT -- tidak perlu ALTER")
        else:
            print(f"  -> {col}: {data_type}({char_len}) -> TEXT ... ", end="", flush=True)
            conn.execute(text(f"ALTER TABLE users ALTER COLUMN {col} TYPE TEXT"))
            print("OK")
            altered += 1

    if altered:
        print(f"  {altered} kolom berhasil di-ALTER ke TEXT")
    else:
        print("  Semua kolom sensitif sudah bertipe TEXT")


def reencrypt_data(conn):
    print("\n[STEP 2] Re-enkripsi data plaintext...")

    cols_select = ", ".join(["user_id"] + SENSITIVE_COLS)
    rows = conn.execute(text(f"SELECT {cols_select} FROM users")).fetchall()
    print(f"  Ditemukan {len(rows)} user\n")

    total_encrypted = 0
    total_skipped   = 0
    total_null      = 0

    for row in rows:
        user_id = row[0]
        updates = {}

        for i, col in enumerate(SENSITIVE_COLS, start=1):
            val = row[i]

            if val is None:
                total_null += 1
                continue

            if looks_encrypted(val):
                try:
                    decrypt(val)
                    total_skipped += 1
                    print(f"  [{user_id[:8]}] {col}: sudah terenkripsi v")
                except (InvalidTag, Exception):
                    updates[col] = encrypt(val)
                    total_encrypted += 1
                    print(f"  [{user_id[:8]}] {col}: re-encrypted (unknown format) v")
            else:
                updates[col] = encrypt(val)
                total_encrypted += 1
                masked = val[:3] + "***" if len(val) > 3 else "***"
                print(f"  [{user_id[:8]}] {col}: '{masked}' -> ciphertext v")

        if updates:
            set_clause = ", ".join(f"{k} = :{k}" for k in updates)
            updates["_uid"] = user_id
            conn.execute(
                text(f"UPDATE users SET {set_clause} WHERE user_id = :_uid"),
                updates,
            )

    return total_encrypted, total_skipped, total_null


def verify_sample(conn):
    print("\n[STEP 3] Verifikasi dekripsi sampel...")
    rows = conn.execute(text(
        "SELECT user_id, no_telp, nik, nomor_rekening FROM users LIMIT 3"
    )).fetchall()

    ok = True
    for row in rows:
        uid = row[0]
        for i, col in enumerate(["no_telp", "nik", "nomor_rekening"], start=1):
            val = row[i]
            if val is None:
                continue
            try:
                plain = decrypt(val)
                print(f"  [{uid[:8]}] {col}: decrypt OK -> '{plain[:4]}***'")
            except Exception as e:
                print(f"  [{uid[:8]}] {col}: x DECRYPT GAGAL -- {e}")
                ok = False
    return ok


def main():
    print("=" * 60)
    print("  Migrasi Keamanan PostgreSQL -- IPB Food Hub")
    print("=" * 60)
    print(f"\n  DB: {DATABASE_URL[:40]}...")

    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    with engine.begin() as conn:
        conn.execute(text("SELECT 1"))
        print("  Koneksi PostgreSQL: OK\n")

        alter_columns(conn)
        enc, skip, null = reencrypt_data(conn)
        ok = verify_sample(conn)

    print("\n" + "=" * 60)
    print("  HASIL MIGRASI")
    print("=" * 60)
    print(f"  Field dienkripsi baru  : {enc}")
    print(f"  Field sudah terenkripsi: {skip}")
    print(f"  Field NULL (skip)      : {null}")
    print(f"  Verifikasi dekripsi    : {'OK' if ok else 'GAGAL'}")

    if not ok:
        print("\n  Ada masalah dekripsi. Periksa ENCRYPTION_KEY di .env")
        sys.exit(1)

    print("\n  Migrasi selesai! App siap dijalankan.")
    print("  Jalankan: uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
