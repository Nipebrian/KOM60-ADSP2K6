from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# === Detail Item Pesanan ===
class DetailPesananCreate(BaseModel):
    """Schema item dalam pesanan (menu_id + jumlah)."""
    menu_id: str
    jumlah: int = 1
    catatan: Optional[str] = None


class DetailPesananResponse(BaseModel):
    """Schema response detail item pesanan."""
    detail_id: str
    menu_id: str
    nama_menu: Optional[str] = None  # Akan diisi dari relasi
    jumlah: int
    harga_satuan: float
    subtotal: float
    catatan: Optional[str] = None

    class Config:
        from_attributes = True


# === Pesanan ===
class PesananCreate(BaseModel):
    """Schema untuk membuat pesanan baru."""
    umkm_id: str
    items: list[DetailPesananCreate]
    catatan_pesanan: Optional[str] = None
    waktu_pengambilan: Optional[datetime] = None
    promo_id: Optional[str] = None


class PesananResponse(BaseModel):
    """Schema response data pesanan."""
    pesanan_id: str
    mahasiswa_id: str
    nama_mahasiswa: Optional[str] = None
    umkm_id: str
    nama_umkm: Optional[str] = None
    tanggal_pesan: Optional[datetime] = None
    total_harga: float
    tanda_tangan: Optional[str] = None
    status_pesanan: str
    catatan_pesanan: Optional[str] = None
    waktu_pengambilan: Optional[datetime] = None
    detail_list: list[DetailPesananResponse] = []
    pembayaran: Optional["PembayaranResponse"] = None

    class Config:
        from_attributes = True


class PesananUpdateStatus(BaseModel):
    """Schema untuk update status pesanan (oleh UMKM atau sistem)."""
    status_pesanan: str
    # Nilai valid: menunggu_pembayaran, menunggu_validasi, diproses, siap_diambil, selesai, ditolak


# === Pembayaran ===
class PembayaranResponse(BaseModel):
    """Schema response data pembayaran."""
    pembayaran_id: str
    pesanan_id: str
    metode_pembayaran: Optional[str] = None
    jumlah_bayar: float
    status_pembayaran: str
    tanggal_bayar: Optional[datetime] = None
    tujuan_transfer: Optional[str] = None
    bukti: Optional["BuktiPembayaranResponse"] = None

    class Config:
        from_attributes = True


class UploadBuktiRequest(BaseModel):
    """Schema untuk upload bukti pembayaran."""
    metode_pembayaran: str  # transfer_bank, ewallet, qris
    tujuan_transfer: Optional[str] = None


class BuktiPembayaranResponse(BaseModel):
    """Schema response bukti pembayaran."""
    bukti_id: str
    foto_url: str
    tanggal_upload: Optional[datetime] = None
    status_verifikasi: str
    catatan_verifikasi: Optional[str] = None

    class Config:
        from_attributes = True


class VerifikasiBuktiRequest(BaseModel):
    """Schema untuk verifikasi bukti pembayaran oleh UMKM owner."""
    status_verifikasi: str  # terverifikasi, ditolak
    catatan_verifikasi: Optional[str] = None


# Resolve forward references
PesananResponse.model_rebuild()
PembayaranResponse.model_rebuild()
