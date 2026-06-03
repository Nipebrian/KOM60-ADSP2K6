import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Promo(Base):
    __tablename__ = "promo"

    promo_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    umkm_id = Column(String, ForeignKey("umkm.umkm_id"), nullable=False)
    judul = Column(String(100), nullable=False)
    deskripsi = Column(Text, nullable=True)
    diskon_persen = Column(Float, nullable=False, default=0.0)
    tanggal_mulai = Column(DateTime, nullable=False)
    tanggal_berakhir = Column(DateTime, nullable=False)
    status_aktif = Column(Boolean, default=True)
    syarat_ketentuan = Column(Text, nullable=True)

    umkm = relationship("UMKM", back_populates="promo_list")
