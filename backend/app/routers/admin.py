from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User
from app.models.umkm import UMKM
from app.models.pesanan import Pesanan
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
def get_stats(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    total_mahasiswa = db.query(User).filter(User.role == "mahasiswa").count()
    total_umkm_user = db.query(User).filter(User.role == "umkm").count()
    total_umkm = db.query(UMKM).count()
    total_pesanan = db.query(Pesanan).count()
    pesanan_hari_ini = db.query(Pesanan).filter(
        func.date(Pesanan.tanggal_pesan) == func.date(func.now())
    ).count()
    total_pendapatan = db.query(func.sum(Pesanan.total_harga)).filter(
        Pesanan.status_pesanan == "selesai"
    ).scalar() or 0

    return {
        "total_mahasiswa": total_mahasiswa,
        "total_umkm_user": total_umkm_user,
        "total_umkm": total_umkm,
        "total_pesanan": total_pesanan,
        "pesanan_hari_ini": pesanan_hari_ini,
        "total_pendapatan": total_pendapatan,
    }


@router.get("/users", response_model=list[UserResponse])
def list_users(
    role: str = None,
    status: str = None,
    search: str = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
    if search:
        query = query.filter(
            (User.nama.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    users = query.offset((page - 1) * per_page).limit(per_page).all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    new_status: str,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if new_status not in ["aktif", "suspended", "nonaktif"]:
        raise HTTPException(status_code=400, detail="Status tidak valid")

    user.status = new_status
    db.commit()
    return {"message": f"Status user diubah menjadi {new_status}"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: str,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if user.user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Tidak bisa menghapus akun sendiri")

    db.delete(user)
    db.commit()
    return {"message": "User berhasil dihapus"}
