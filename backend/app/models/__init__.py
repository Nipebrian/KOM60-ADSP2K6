# Models package - import semua model agar terdeteksi SQLAlchemy
from app.models.user import User
from app.models.umkm import UMKM
from app.models.menu import Menu
from app.models.pesanan import Pesanan, DetailPesanan, Pembayaran, BuktiPembayaran
from app.models.rating import Rating
from app.models.promo import Promo

__all__ = [
    "User", "UMKM", "Menu",
    "Pesanan", "DetailPesanan", "Pembayaran", "BuktiPembayaran",
    "Rating", "Promo"
]
