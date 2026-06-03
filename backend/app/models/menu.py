import uuid
from sqlalchemy import Column, String, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Menu(Base):
    __tablename__ = "menu"

    menu_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    umkm_id = Column(String, ForeignKey("umkm.umkm_id"), nullable=False)
    nama_menu = Column(String(100), nullable=False)
    deskripsi = Column(Text, nullable=True)
    harga = Column(Float, nullable=False)
    kategori = Column(String(50), nullable=True)
    foto_menu = Column(String(255), nullable=True)
    status_ketersediaan = Column(Boolean, default=True)

    umkm = relationship("UMKM", back_populates="menu_list")
