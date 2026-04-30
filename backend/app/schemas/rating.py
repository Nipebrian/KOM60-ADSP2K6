from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# === Rating Schemas ===
class RatingCreate(BaseModel):
    """Schema untuk membuat rating/ulasan baru."""
    umkm_id: str
    pesanan_id: Optional[str] = None
    nilai: int  # 1-5
    komentar: Optional[str] = None


class RatingResponse(BaseModel):
    """Schema response data rating."""
    rating_id: str
    mahasiswa_id: str
    nama_mahasiswa: Optional[str] = None
    umkm_id: str
    pesanan_id: Optional[str] = None
    nilai: int
    komentar: Optional[str] = None
    tanggal_rating: Optional[datetime] = None
    balasan: Optional[str] = None

    class Config:
        from_attributes = True


class RatingBalasanRequest(BaseModel):
    """Schema untuk UMKM membalas ulasan."""
    balasan: str


class RatingSummary(BaseModel):
    """Schema ringkasan rating UMKM."""
    rata_rata: float
    total_ulasan: int
    distribusi: dict  # {"5": 10, "4": 5, "3": 2, "2": 1, "1": 0}
