from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.user import User
from app.models.umkm import UMKM
from app.models.promo import Promo
from app.schemas.promo import PromoCreate, PromoUpdate, PromoResponse

router = APIRouter(prefix="/api/promo", tags=["Promo"])


@router.get("", response_model=list[PromoResponse])
def list_all_promos(db: Session = Depends(get_db)):
    promos = db.query(Promo).filter(Promo.status_aktif == True).order_by(Promo.tanggal_berakhir.desc()).all()
    result = []
    for p in promos:
        resp = PromoResponse.model_validate(p)
        resp.nama_umkm = p.umkm.nama_umkm if p.umkm else None
        result.append(resp)
    return result


@router.get("/umkm/{umkm_id}", response_model=list[PromoResponse])
def list_promos_by_umkm(umkm_id: str, db: Session = Depends(get_db)):
    promos = db.query(Promo).filter(Promo.umkm_id == umkm_id).order_by(Promo.tanggal_berakhir.desc()).all()
    result = []
    for p in promos:
        resp = PromoResponse.model_validate(p)
        resp.nama_umkm = p.umkm.nama_umkm if p.umkm else None
        result.append(resp)
    return result


@router.post("", response_model=PromoResponse, status_code=201)
def create_promo(
    data: PromoCreate,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.pemilik_id == current_user.user_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="Anda belum memiliki UMKM")

    if data.tanggal_mulai >= data.tanggal_berakhir:
        raise HTTPException(status_code=400, detail="Tanggal mulai harus sebelum tanggal berakhir")

    promo = Promo(
        umkm_id=umkm.umkm_id,
        judul=data.judul,
        deskripsi=data.deskripsi,
        diskon_persen=data.diskon_persen,
        tanggal_mulai=data.tanggal_mulai,
        tanggal_berakhir=data.tanggal_berakhir,
        syarat_ketentuan=data.syarat_ketentuan,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)

    resp = PromoResponse.model_validate(promo)
    resp.nama_umkm = umkm.nama_umkm
    return resp


@router.put("/{promo_id}", response_model=PromoResponse)
def update_promo(
    promo_id: str,
    data: PromoUpdate,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    promo = db.query(Promo).filter(Promo.promo_id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo tidak ditemukan")

    umkm = db.query(UMKM).filter(UMKM.umkm_id == promo.umkm_id).first()
    if not umkm or umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bukan UMKM Anda")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(promo, key, value)
    db.commit()
    db.refresh(promo)

    resp = PromoResponse.model_validate(promo)
    resp.nama_umkm = umkm.nama_umkm
    return resp


@router.delete("/{promo_id}")
def delete_promo(
    promo_id: str,
    current_user: User = Depends(require_role(["umkm", "admin"])),
    db: Session = Depends(get_db),
):
    promo = db.query(Promo).filter(Promo.promo_id == promo_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promo tidak ditemukan")

    if current_user.role == "umkm":
        umkm = db.query(UMKM).filter(UMKM.umkm_id == promo.umkm_id).first()
        if not umkm or umkm.pemilik_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="Bukan UMKM Anda")

    db.delete(promo)
    db.commit()
    return {"message": "Promo berhasil dihapus"}
