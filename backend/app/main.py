from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.database import engine, Base
from app.core.config import UPLOAD_DIR
from app.models import *  # noqa: F401,F403 — import semua model agar tabel terbuat
from app.routers import auth, umkm, menu, pesanan, rating, promo, admin

# Buat semua tabel di database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IPB Food & UMKM Student Hub API",
    description="API untuk platform informasi dan pemesanan UMKM makanan di kampus IPB",
    version="1.0.0",
)

# CORS — izinkan frontend React mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files untuk upload gambar
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Register semua routers
app.include_router(auth.router)
app.include_router(umkm.router)
app.include_router(menu.router)
app.include_router(pesanan.router)
app.include_router(rating.router)
app.include_router(promo.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {
        "message": "IPB Food & UMKM Student Hub API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
