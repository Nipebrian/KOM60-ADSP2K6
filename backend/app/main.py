import asyncio
import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt

from app.core.config import SECRET_KEY, ALGORITHM, UPLOAD_DIR
from app.core.database import engine, SessionLocal, Base

# These imports register all ORM models with SQLAlchemy's metadata
import app.models.user          # noqa: F401
import app.models.umkm          # noqa: F401
import app.models.menu          # noqa: F401
import app.models.pesanan       # noqa: F401
import app.models.rating        # noqa: F401
import app.models.promo         # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401

from app.routers import auth, admin, umkm, menu, pesanan, rating, promo, security

# Tables already exist in Neon DB on Vercel; only auto-create locally
if not os.getenv("VERCEL"):
    Base.metadata.create_all(bind=engine)


# Strip BOM — PowerShell on Windows can inject U+FEFF into env vars
_raw_origins = os.getenv("ALLOWED_ORIGINS", "").lstrip('﻿').strip()
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]
# Always include production URL so CORS doesn't break when env var is misconfigured
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

import os as _os
if _os.path.isdir(UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def _write_audit_log(user_id, method, endpoint, status_code, ip, user_agent, duration_ms):
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


@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    if not request.url.path.startswith("/api/"):
        return await call_next(request)

    start = time.time()
    response = await call_next(request)
    duration_ms = int((time.time() - start) * 1000)

    user_id = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        try:
            token = auth_header.split(" ", 1)[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
        except JWTError:
            pass

    # DB write is dispatched to a thread pool — response is already sent to the client
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
