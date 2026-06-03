import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class UMKM(Base):
    __tablename__ = "umkm"

    umkm_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pemilik_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    nama_umkm = Column(String(100), nullable=False)
    deskripsi = Column(Text, nullable=True)
    alamat = Column(String(255), nullable=False)
    kategori = Column(String(50), nullable=False)
    jam_buka = Column(String(10), nullable=True)
    jam_tutup = Column(String(10), nullable=True)
    foto_toko = Column(String(255), nullable=True)
    status_operasional = Column(String(20), default="buka")
    tanggal_dibuat = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    rating_rata_rata = Column(Float, default=0.0)
    nomor_rekening = Column(String(50), nullable=True)
    nama_bank = Column(String(100), nullable=True)
    nomor_ewallet = Column(String(50), nullable=True)
    foto_qris = Column(String(255), nullable=True)

    @property
    def nama_pemilik(self):
        return self.pemilik.nama if self.pemilik else None

    pemilik = relationship("User", backref="umkm")
    menu_list = relationship("Menu", back_populates="umkm", cascade="all, delete-orphan")
    promo_list = relationship("Promo", back_populates="umkm", cascade="all, delete-orphan")
    rating_list = relationship("Rating", back_populates="umkm", cascade="all, delete-orphan")
