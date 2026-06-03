import asyncio
import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt

from app.core.config import SECRET_KEY, ALGORITHM, UPLOAD_DIR
from app.core.database import engine, SessionLocal, Base

# Import semua model agar SQLAlchemy mendaftarkan tabel
import app.models.user          # noqa: F401
import app.models.umkm          # noqa: F401
import app.models.menu          # noqa: F401
import app.models.pesanan       # noqa: F401
import app.models.rating        # noqa: F401
import app.models.promo         # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401

# Import routers
from app.routers import auth, admin, umkm, menu, pesanan, rating, promo, security

# Buat semua tabel hanya saat lokal (di Vercel tabel sudah ada di Neon DB)
if not os.getenv("VERCEL"):
    Base.metadata.create_all(bind=engine)


# Strip BOM (PowerShell pipe di Windows bisa sisipkan U+FEFF ke env var)
_raw_origins = os.getenv("ALLOWED_ORIGINS", "").lstrip('﻿').strip()
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]
# Fallback defaults + selalu sertakan URL production agar CORS tidak putus meski env var salah
_DEFAULT_ORIGINS = [
    "http://localhost:5173", "http://localhost:3000", "http://localhost:4173",
    "https://ipb-food-hub.vercel.app",
]
for _o in _DEFAULT_ORIGINS:
    if _o not in ALLOWED_ORIGINS:
        ALLOWED_ORIGINS.append(_o)

app = FastAPI(
    title="IPB Food Hub API",
    description="Backend API untuk sistem pemesanan makanan kampus IPB",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sajikan file upload (bukti pembayaran, foto profil) — tidak tersedia di Vercel serverless
import os as _os
if _os.path.isdir(UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def _write_audit_log(user_id, method, endpoint, status_code, ip, user_agent, duration_ms):
    """Tulis audit log ke DB — dijalankan di background agar tidak blokir response."""
    db = SessionLocal()
    try:
        log = AuditLog(
            user_id=user_id,
            method=method,
            endpoint=endpoint,
            status_code=status_code,
            ip_address=ip,
            user_agent=user_agent[:255],
            duration_ms=duration_ms,
        )
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


# ── Audit Logging Middleware (Accounting/AAA) ──
@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    # Lewati endpoint non-API sebelum memproses agar tidak ada overhead
    if not request.url.path.startswith("/api/"):
        return await call_next(request)

    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)

    # Ekstrak user_id dari JWT jika ada (tanpa await — pure CPU)
    user_id = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            token = auth_header.split(" ", 1)[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
        except JWTError:
            pass

    # DB write dijalankan di background — response sudah dikirim ke client
    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        None,
        _write_audit_log,
        user_id,
        request.method,
        request.url.path,
        response.status_code,
        request.client.host if request.client else "unknown",
        request.headers.get("user-agent", ""),
        duration_ms,
    )

    return response


# ── Daftarkan semua router ──
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(umkm.router)
app.include_router(menu.router)
app.include_router(pesanan.router)
app.include_router(rating.router)
app.include_router(promo.router)
app.include_router(security.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "IPB Food Hub API is running"}


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
