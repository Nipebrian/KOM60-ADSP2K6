from pydantic import BaseModel
from typing import Optional


# === Menu Schemas ===
class MenuCreate(BaseModel):
    """Schema untuk menambahkan menu baru ke UMKM."""
    nama_menu: str
    deskripsi: Optional[str] = None
    harga: float
    kategori: Optional[str] = None
    foto_menu: Optional[str] = None


class MenuUpdate(BaseModel):
    """Schema untuk update data menu."""
    nama_menu: Optional[str] = None
    deskripsi: Optional[str] = None
    harga: Optional[float] = None
    kategori: Optional[str] = None
    foto_menu: Optional[str] = None
    status_ketersediaan: Optional[bool] = None


class MenuResponse(BaseModel):
    """Schema response data menu."""
    menu_id: str
    umkm_id: str
    nama_menu: str
    deskripsi: Optional[str] = None
    harga: float
    kategori: Optional[str] = None
    foto_menu: Optional[str] = None
    status_ketersediaan: bool

    class Config:
        from_attributes = True
