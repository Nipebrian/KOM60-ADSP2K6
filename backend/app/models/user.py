import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Text, TypeDecorator
from app.core.database import Base
from app.core.crypto import encrypt, decrypt


class EncryptedString(TypeDecorator):
    """Kolom TEXT yang otomatis dienkripsi (AES-256-GCM) saat disimpan."""
    impl     = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return encrypt(value)

    def process_result_value(self, value, dialect):
        return decrypt(value)


class User(Base):
    """Model User - kelas abstrak induk untuk Mahasiswa, PelakuUMKM, Admin."""
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nama    = Column(String(100), nullable=False)
    email   = Column(String(100), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)

    # Kolom sensitif — dienkripsi AES-256-GCM
    no_telp        = Column(EncryptedString, nullable=True)
    nik            = Column(EncryptedString, nullable=True)
    nomor_rekening = Column(EncryptedString, nullable=True)
    nomor_ewallet  = Column(EncryptedString, nullable=True)

    foto_profil    = Column(String(255), nullable=True)
    tanggal_daftar = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status         = Column(String(20), default="aktif")
    role           = Column(String(20), nullable=False)

    # Atribut spesifik Mahasiswa
    nim        = Column(String(20),  nullable=True)
    fakultas   = Column(String(100), nullable=True)
    departemen = Column(String(100), nullable=True)
    angkatan   = Column(String(4),   nullable=True)

    # Atribut spesifik PelakuUMKM
    nama_bank = Column(String(50), nullable=True)

    # Atribut spesifik Admin
    level     = Column(String(20), nullable=True)
    hak_akses = Column(String(50), nullable=True)
