import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Rating(Base):
    __tablename__ = "rating"

    rating_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    mahasiswa_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    umkm_id = Column(String, ForeignKey("umkm.umkm_id"), nullable=False)
    pesanan_id = Column(String, ForeignKey("pesanan.pesanan_id"), nullable=True)
    nilai = Column(Integer, nullable=False)
    komentar = Column(Text, nullable=True)
    tanggal_rating = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    balasan = Column(Text, nullable=True)

    mahasiswa = relationship("User", backref="rating_list")
    umkm = relationship("UMKM", back_populates="rating_list")
