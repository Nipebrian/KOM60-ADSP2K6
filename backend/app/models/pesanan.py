import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Pesanan(Base):
    __tablename__ = "pesanan"

    pesanan_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    mahasiswa_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    umkm_id = Column(String, ForeignKey("umkm.umkm_id"), nullable=False)
    tanggal_pesan = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    total_harga = Column(Float, default=0.0)
    status_pesanan = Column(String(30), default="menunggu_pembayaran")
    catatan_pesanan = Column(Text, nullable=True)
    waktu_pengambilan = Column(DateTime, nullable=True)

    mahasiswa = relationship("User", backref="pesanan_list")
    umkm = relationship("UMKM", backref="pesanan_list")
    detail_list = relationship("DetailPesanan", back_populates="pesanan", cascade="all, delete-orphan")
    pembayaran = relationship("Pembayaran", back_populates="pesanan", uselist=False, cascade="all, delete-orphan")


class DetailPesanan(Base):
    __tablename__ = "detail_pesanan"

    detail_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pesanan_id = Column(String, ForeignKey("pesanan.pesanan_id"), nullable=False)
    menu_id = Column(String, ForeignKey("menu.menu_id"), nullable=False)
    jumlah = Column(Integer, nullable=False, default=1)
    harga_satuan = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    catatan = Column(Text, nullable=True)

    pesanan = relationship("Pesanan", back_populates="detail_list")
    menu = relationship("Menu", backref="detail_pesanan_list")


class Pembayaran(Base):
    __tablename__ = "pembayaran"

    pembayaran_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pesanan_id = Column(String, ForeignKey("pesanan.pesanan_id"), nullable=False)
    metode_pembayaran = Column(String(30), nullable=True)
    jumlah_bayar = Column(Float, nullable=False)
    status_pembayaran = Column(String(30), default="belum_bayar")
    tanggal_bayar = Column(DateTime, nullable=True)
    tujuan_transfer = Column(String(100), nullable=True)

    pesanan = relationship("Pesanan", back_populates="pembayaran")
    bukti = relationship("BuktiPembayaran", back_populates="pembayaran", uselist=False, cascade="all, delete-orphan")


class BuktiPembayaran(Base):
    __tablename__ = "bukti_pembayaran"

    bukti_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pembayaran_id = Column(String, ForeignKey("pembayaran.pembayaran_id"), nullable=False)
    foto_url = Column(String(255), nullable=False)
    tanggal_upload = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status_verifikasi = Column(String(20), default="pending")
    catatan_verifikasi = Column(Text, nullable=True)

    pembayaran = relationship("Pembayaran", back_populates="bukti")
