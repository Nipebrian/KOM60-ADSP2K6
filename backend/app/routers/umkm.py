from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.cloudinary_helper import upload_image
from app.models.user import User
from app.models.umkm import UMKM
from app.schemas.umkm import UMKMCreate, UMKMUpdate, UMKMResponse, UMKMListResponse

router = APIRouter(prefix="/api/umkm", tags=["UMKM"])


@router.get("", response_model=UMKMListResponse)
def list_umkm(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    kategori: str = None,
    status: str = None,
    search: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(UMKM)

    if kategori:
        query = query.filter(UMKM.kategori == kategori)
    if status:
        query = query.filter(UMKM.status_operasional == status)
    if search:
        query = query.filter(UMKM.nama_umkm.ilike(f"%{search}%"))

    total = query.count()
    umkm_list = query.order_by(UMKM.rating_rata_rata.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return UMKMListResponse(
        data=[UMKMResponse.model_validate(u) for u in umkm_list],
        total=total,
        page=page,
        per_page=per_page,
    )


# /me/toko must be defined before /{umkm_id} or FastAPI matches "me" as umkm_id
@router.get("/me/toko", response_model=UMKMResponse)
def get_my_umkm(
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.pemilik_id == current_user.user_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="Anda belum memiliki UMKM")
    return UMKMResponse.model_validate(umkm)


@router.get("/{umkm_id}", response_model=UMKMResponse)
def get_umkm(umkm_id: str, db: Session = Depends(get_db)):
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")
    return UMKMResponse.model_validate(umkm)


@router.post("", response_model=UMKMResponse, status_code=201)
def create_umkm(
    data: UMKMCreate,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    existing = db.query(UMKM).filter(UMKM.pemilik_id == current_user.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Anda sudah memiliki UMKM terdaftar")

    umkm = UMKM(
        pemilik_id=current_user.user_id,
        nama_umkm=data.nama_umkm,
        deskripsi=data.deskripsi,
        alamat=data.alamat,
        kategori=data.kategori,
        jam_buka=data.jam_buka,
        jam_tutup=data.jam_tutup,
        foto_toko=data.foto_toko,
    )
    db.add(umkm)
    db.commit()
    db.refresh(umkm)
    return UMKMResponse.model_validate(umkm)


@router.put("/{umkm_id}", response_model=UMKMResponse)
def update_umkm(
    umkm_id: str,
    data: UMKMUpdate,
    current_user: User = Depends(require_role(["umkm", "admin"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")
    if current_user.role == "umkm" and umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bukan pemilik UMKM ini")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(umkm, key, value)
    db.commit()
    db.refresh(umkm)
    return UMKMResponse.model_validate(umkm)


@router.delete("/{umkm_id}")
def delete_umkm(
    umkm_id: str,
    current_user: User = Depends(require_role(["umkm", "admin"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")
    if current_user.role == "umkm" and umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bukan pemilik UMKM ini")

    db.delete(umkm)
    db.commit()
    return {"message": "UMKM berhasil dihapus"}


@router.post("/{umkm_id}/upload-foto", response_model=UMKMResponse)
async def upload_foto_umkm(
    umkm_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["umkm", "admin"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")
    if current_user.role == "umkm" and umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bukan pemilik UMKM ini")

    umkm.foto_toko = await upload_image(file, folder="ipb-food-hub/toko")
    db.commit()
    db.refresh(umkm)
    return UMKMResponse.model_validate(umkm)


@router.post("/{umkm_id}/upload-qris", response_model=UMKMResponse)
async def upload_qris_umkm(
    umkm_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["umkm", "admin"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")
    if current_user.role == "umkm" and umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bukan pemilik UMKM ini")

    umkm.foto_qris = await upload_image(file, folder="ipb-food-hub/qris")
    db.commit()
    db.refresh(umkm)
    return UMKMResponse.model_validate(umkm)

