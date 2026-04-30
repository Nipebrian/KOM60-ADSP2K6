import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum as SAEnum
from app.core.database import Base


class User(Base):
    """Model User - kelas abstrak induk untuk Mahasiswa, PelakuUMKM, Admin."""
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nama = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    no_telp = Column(String(20), nullable=True)
    foto_profil = Column(String(255), nullable=True)
    tanggal_daftar = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String(20), default="aktif")  # aktif, nonaktif, suspended
    role = Column(String(20), nullable=False)  # mahasiswa, umkm, admin

    # Atribut spesifik Mahasiswa
    nim = Column(String(20), nullable=True)
    fakultas = Column(String(100), nullable=True)
    departemen = Column(String(100), nullable=True)
    angkatan = Column(String(4), nullable=True)

    # Atribut spesifik PelakuUMKM
    nik = Column(String(20), nullable=True)
    nomor_rekening = Column(String(30), nullable=True)
    nama_bank = Column(String(50), nullable=True)
    nomor_ewallet = Column(String(20), nullable=True)

    # Atribut spesifik Admin
    level = Column(String(20), nullable=True)
    hak_akses = Column(String(50), nullable=True)
