from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# === Promo Schemas ===
class PromoCreate(BaseModel):
    """Schema untuk membuat promo baru."""
    judul: str
    deskripsi: Optional[str] = None
    diskon_persen: float
    tanggal_mulai: datetime
    tanggal_berakhir: datetime
    syarat_ketentuan: Optional[str] = None


class PromoUpdate(BaseModel):
    """Schema untuk update data promo."""
    judul: Optional[str] = None
    deskripsi: Optional[str] = None
    diskon_persen: Optional[float] = None
    tanggal_mulai: Optional[datetime] = None
    tanggal_berakhir: Optional[datetime] = None
    status_aktif: Optional[bool] = None
    syarat_ketentuan: Optional[str] = None


class PromoResponse(BaseModel):
    """Schema response data promo."""
    promo_id: str
    umkm_id: str
    nama_umkm: Optional[str] = None
    judul: str
    deskripsi: Optional[str] = None
    diskon_persen: float
    tanggal_mulai: Optional[datetime] = None
    tanggal_berakhir: Optional[datetime] = None
    status_aktif: bool
    syarat_ketentuan: Optional[str] = None

    class Config:
        from_attributes = True
