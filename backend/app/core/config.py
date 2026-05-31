import os
from dotenv import load_dotenv

load_dotenv()


def _env(key: str, default: str = "") -> str:
    """Baca env var dan strip BOM (PowerShell pipe di Windows bisa sisipkan U+FEFF)."""
    return os.getenv(key, default).lstrip('﻿').strip()


SECRET_KEY = _env("SECRET_KEY", "default-secret-key")
ALGORITHM = _env("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(_env("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
DATABASE_URL = _env("DATABASE_URL", "sqlite:///./ipb_food_umkm.db")

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except OSError:
    pass  # Read-only filesystem (e.g., Vercel serverless)
