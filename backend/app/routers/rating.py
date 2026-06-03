from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.umkm import UMKM
from app.models.rating import Rating
from app.schemas.rating import RatingCreate, RatingResponse, RatingBalasanRequest, RatingSummary

router = APIRouter(prefix="/api/rating", tags=["Rating & Ulasan"])


@router.get("/umkm/{umkm_id}", response_model=list[RatingResponse])
def list_ratings(
    umkm_id: str,
    nilai: int = None,
    db: Session = Depends(get_db),
):
    query = db.query(Rating).filter(Rating.umkm_id == umkm_id)
    if nilai:
        query = query.filter(Rating.nilai == nilai)
    ratings = query.order_by(Rating.tanggal_rating.desc()).all()

    result = []
    for r in ratings:
        resp = RatingResponse.model_validate(r)
        resp.nama_mahasiswa = r.mahasiswa.nama if r.mahasiswa else None
        result.append(resp)
    return result


@router.get("/umkm/{umkm_id}/summary", response_model=RatingSummary)
def rating_summary(umkm_id: str, db: Session = Depends(get_db)):
    ratings = db.query(Rating).filter(Rating.umkm_id == umkm_id).all()
    total = len(ratings)
    if total == 0:
        return RatingSummary(
            rata_rata=0.0,
            total_ulasan=0,
            distribusi={"5": 0, "4": 0, "3": 0, "2": 0, "1": 0},
        )

    rata_rata = sum(r.nilai for r in ratings) / total
    distribusi = {str(i): sum(1 for r in ratings if r.nilai == i) for i in range(5, 0, -1)}

    return RatingSummary(
        rata_rata=round(rata_rata, 1),
        total_ulasan=total,
        distribusi=distribusi,
    )


@router.post("", response_model=RatingResponse, status_code=201)
def create_rating(
    data: RatingCreate,
    current_user: User = Depends(require_role(["mahasiswa"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.umkm_id == data.umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")

    if data.nilai < 1 or data.nilai > 5:
        raise HTTPException(status_code=400, detail="Nilai rating harus 1-5")

    if data.pesanan_id:
        existing = db.query(Rating).filter(
            Rating.mahasiswa_id == current_user.user_id,
            Rating.pesanan_id == data.pesanan_id,
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Anda sudah memberikan rating untuk pesanan ini")

    rating = Rating(
        mahasiswa_id=current_user.user_id,
        umkm_id=data.umkm_id,
        pesanan_id=data.pesanan_id,
        nilai=data.nilai,
        komentar=data.komentar,
    )
    db.add(rating)

    all_ratings = db.query(Rating).filter(Rating.umkm_id == data.umkm_id).all()
    total_nilai = sum(r.nilai for r in all_ratings) + data.nilai
    total_count = len(all_ratings) + 1
    umkm.rating_rata_rata = round(total_nilai / total_count, 1)

    db.commit()
    db.refresh(rating)

    resp = RatingResponse.model_validate(rating)
    resp.nama_mahasiswa = current_user.nama
    return resp


@router.put("/{rating_id}/balasan", response_model=RatingResponse)
def balas_rating(
    rating_id: str,
    data: RatingBalasanRequest,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    rating = db.query(Rating).filter(Rating.rating_id == rating_id).first()
    if not rating:
        raise HTTPException(status_code=404, detail="Rating tidak ditemukan")

    umkm = db.query(UMKM).filter(UMKM.umkm_id == rating.umkm_id).first()
    if not umkm or umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bukan UMKM Anda")

    rating.balasan = data.balasan
    db.commit()
    db.refresh(rating)

    resp = RatingResponse.model_validate(rating)
    resp.nama_mahasiswa = rating.mahasiswa.nama if rating.mahasiswa else None
    return resp


@router.delete("/{rating_id}")
def delete_rating(
    rating_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rating = db.query(Rating).filter(Rating.rating_id == rating_id).first()
    if not rating:
        raise HTTPException(status_code=404, detail="Rating tidak ditemukan")

    if current_user.role == "mahasiswa" and rating.mahasiswa_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bukan rating Anda")
    if current_user.role not in ["mahasiswa", "admin"]:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    umkm_id = rating.umkm_id
    db.delete(rating)

    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    remaining = db.query(Rating).filter(Rating.umkm_id == umkm_id).all()
    if remaining:
        umkm.rating_rata_rata = round(sum(r.nilai for r in remaining) / len(remaining), 1)
    else:
        umkm.rating_rata_rata = 0.0

    db.commit()
    return {"message": "Rating berhasil dihapus"}
