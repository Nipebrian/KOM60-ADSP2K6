from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# === UMKM Schemas ===
class UMKMCreate(BaseModel):
    """Schema untuk membuat UMKM baru."""
    nama_umkm: str
    deskripsi: Optional[str] = None
    alamat: str
    kategori: str
    jam_buka: Optional[str] = None
    jam_tutup: Optional[str] = None
    foto_toko: Optional[str] = None
    # Metode pembayaran
    nomor_rekening: Optional[str] = None
    nama_bank: Optional[str] = None
    nomor_ewallet: Optional[str] = None


class UMKMUpdate(BaseModel):
    """Schema untuk update data UMKM."""
    nama_umkm: Optional[str] = None
    deskripsi: Optional[str] = None
    alamat: Optional[str] = None
    kategori: Optional[str] = None
    jam_buka: Optional[str] = None
    jam_tutup: Optional[str] = None
    foto_toko: Optional[str] = None
    status_operasional: Optional[str] = None
    # Metode pembayaran
    nomor_rekening: Optional[str] = None
    nama_bank: Optional[str] = None
    nomor_ewallet: Optional[str] = None


class UMKMResponse(BaseModel):
    """Schema response data UMKM."""
    umkm_id: str
    pemilik_id: str
    nama_pemilik: Optional[str] = None
    nama_umkm: str
    deskripsi: Optional[str] = None
    alamat: str
    kategori: str
    jam_buka: Optional[str] = None
    jam_tutup: Optional[str] = None
    foto_toko: Optional[str] = None
    foto_qris: Optional[str] = None
    status_operasional: str
    tanggal_dibuat: Optional[datetime] = None
    rating_rata_rata: float
    # Metode pembayaran
    nomor_rekening: Optional[str] = None
    nama_bank: Optional[str] = None
    nomor_ewallet: Optional[str] = None

    class Config:
        from_attributes = True


class UMKMListResponse(BaseModel):
    """Schema response daftar UMKM dengan paginasi."""
    data: list[UMKMResponse]
    total: int
    page: int
    per_page: int
