import os
from dotenv import load_dotenv

load_dotenv()


def _env(key: str, default: str = "") -> str:
    """Baca env var dan strip BOM (PowerShell pipe di Windows bisa sisipkan U+FEFF)."""
    return os.getenv(key, default).lstrip('﻿').strip()


SECRET_KEY = _env("SECRET_KEY", "default-secret-key")
ALGORITHM = _env("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(_env("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

DATABASE_URL = _env("DATABASE_URL", "")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL belum diset di .env. "
        "Isi dengan connection string PostgreSQL."
    )

# AES-256-GCM Encryption Key
# Generate: python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"
ENCRYPTION_KEY = _env("ENCRYPTION_KEY", "")

# RSA Keypair untuk Digital Signature
RSA_PRIVATE_KEY_PATH = _env("RSA_PRIVATE_KEY_PATH", "./keys/private.pem")
RSA_PUBLIC_KEY_PATH  = _env("RSA_PUBLIC_KEY_PATH",  "./keys/public.pem")

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except OSError:
    pass  # Read-only filesystem (e.g., Vercel serverless)
