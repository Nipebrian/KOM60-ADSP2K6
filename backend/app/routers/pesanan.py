from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Form
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
import json
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.cloudinary_helper import upload_image
from app.auth.digital_signature import sign_message
from app.models.user import User
from app.models.umkm import UMKM
from app.models.menu import Menu
from app.models.pesanan import Pesanan, DetailPesanan, Pembayaran, BuktiPembayaran
from app.models.promo import Promo
from app.schemas.pesanan import (
    PesananCreate, PesananResponse, PesananUpdateStatus,
    DetailPesananResponse, PembayaranResponse, BuktiPembayaranResponse,
    VerifikasiBuktiRequest,
)

router = APIRouter(prefix="/api/pesanan", tags=["Pesanan"])


def _build_pesanan_response(pesanan: Pesanan) -> PesananResponse:
    detail_list = []
    for d in pesanan.detail_list:
        dr = DetailPesananResponse.model_validate(d)
        dr.nama_menu = d.menu.nama_menu if d.menu else None
        detail_list.append(dr)

    pembayaran_resp = None
    if pesanan.pembayaran:
        p = pesanan.pembayaran
        bukti_resp = None
        if p.bukti:
            bukti_resp = BuktiPembayaranResponse.model_validate(p.bukti)
        pembayaran_resp = PembayaranResponse(
            pembayaran_id=p.pembayaran_id,
            pesanan_id=p.pesanan_id,
            metode_pembayaran=p.metode_pembayaran,
            jumlah_bayar=p.jumlah_bayar,
            status_pembayaran=p.status_pembayaran,
            tanggal_bayar=p.tanggal_bayar,
            tujuan_transfer=p.tujuan_transfer,
            bukti=bukti_resp,
        )

    return PesananResponse(
        pesanan_id=pesanan.pesanan_id,
        mahasiswa_id=pesanan.mahasiswa_id,
        nama_mahasiswa=pesanan.mahasiswa.nama if pesanan.mahasiswa else None,
        umkm_id=pesanan.umkm_id,
        nama_umkm=pesanan.umkm.nama_umkm if pesanan.umkm else None,
        tanggal_pesan=pesanan.tanggal_pesan,
        total_harga=pesanan.total_harga,
        tanda_tangan=pesanan.tanda_tangan,
        status_pesanan=pesanan.status_pesanan,
        catatan_pesanan=pesanan.catatan_pesanan,
        waktu_pengambilan=pesanan.waktu_pengambilan,
        detail_list=detail_list,
        pembayaran=pembayaran_resp,
    )


@router.post("", response_model=PesananResponse, status_code=201)
def create_pesanan(
    data: PesananCreate,
    current_user: User = Depends(require_role(["mahasiswa"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.umkm_id == data.umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")
    if umkm.status_operasional != "buka":
        raise HTTPException(status_code=400, detail="UMKM sedang tidak buka")

    pesanan = Pesanan(
        mahasiswa_id=current_user.user_id,
        umkm_id=data.umkm_id,
        catatan_pesanan=data.catatan_pesanan,
        waktu_pengambilan=data.waktu_pengambilan,
        status_pesanan="menunggu_pembayaran",
    )

    total = 0.0
    for item in data.items:
        menu = db.query(Menu).filter(
            Menu.menu_id == item.menu_id,
            Menu.umkm_id == data.umkm_id
        ).first()
        if not menu:
            raise HTTPException(status_code=404, detail=f"Menu {item.menu_id} tidak ditemukan")
        if not menu.status_ketersediaan:
            raise HTTPException(status_code=400, detail=f"Menu '{menu.nama_menu}' sedang habis")

        subtotal = menu.harga * item.jumlah
        total += subtotal
        detail = DetailPesanan(
            pesanan_id=pesanan.pesanan_id,
            menu_id=item.menu_id,
            jumlah=item.jumlah,
            harga_satuan=menu.harga,
            subtotal=subtotal,
            catatan=item.catatan,
        )
        pesanan.detail_list.append(detail)

    pesanan.total_harga = total

    # Apply promo: discount is computed on-the-fly to avoid adding a DB column
    if data.promo_id:
        from datetime import datetime, timezone as tz
        promo = db.query(Promo).filter(
            Promo.promo_id == data.promo_id,
            Promo.umkm_id == data.umkm_id,
            Promo.status_aktif == True,
        ).first()
        now = datetime.utcnow()
        t_mulai = promo.tanggal_mulai.replace(tzinfo=None) if promo and promo.tanggal_mulai else None
        t_akhir = promo.tanggal_berakhir.replace(tzinfo=None) if promo and promo.tanggal_berakhir else None
        if promo and t_mulai and t_akhir and t_mulai <= now <= t_akhir:
            diskon = round(total * promo.diskon_persen / 100, 0)
            total = max(0.0, total - diskon)
            pesanan.total_harga = total

    try:
        payload = json.dumps({
            "pesanan_id": pesanan.pesanan_id,
            "total_harga": total,
            "ts": datetime.now(timezone.utc).isoformat(),
        }, sort_keys=True)
        pesanan.tanda_tangan = sign_message(payload)
    except Exception:
        pesanan.tanda_tangan = None

    pembayaran = Pembayaran(
        pesanan_id=pesanan.pesanan_id,
        jumlah_bayar=total,
        status_pembayaran="belum_bayar",
    )
    pesanan.pembayaran = pembayaran

    db.add(pesanan)
    db.commit()
    db.refresh(pesanan)
    return _build_pesanan_response(pesanan)


@router.get("/saya", response_model=list[PesananResponse])
def get_my_pesanan(
    status: str = None,
    current_user: User = Depends(require_role(["mahasiswa"])),
    db: Session = Depends(get_db),
):
    query = db.query(Pesanan).options(
        joinedload(Pesanan.detail_list).joinedload(DetailPesanan.menu),
        joinedload(Pesanan.pembayaran).joinedload(Pembayaran.bukti),
        joinedload(Pesanan.umkm),
        joinedload(Pesanan.mahasiswa),
    ).filter(Pesanan.mahasiswa_id == current_user.user_id)

    if status:
        query = query.filter(Pesanan.status_pesanan == status)

    pesanan_list = query.order_by(Pesanan.tanggal_pesan.desc()).all()
    return [_build_pesanan_response(p) for p in pesanan_list]


@router.get("/{pesanan_id}", response_model=PesananResponse)
def get_pesanan(
    pesanan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pesanan = db.query(Pesanan).options(
        joinedload(Pesanan.detail_list).joinedload(DetailPesanan.menu),
        joinedload(Pesanan.pembayaran).joinedload(Pembayaran.bukti),
        joinedload(Pesanan.umkm),
        joinedload(Pesanan.mahasiswa),
    ).filter(Pesanan.pesanan_id == pesanan_id).first()

    if not pesanan:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")

    is_owner = pesanan.mahasiswa_id == current_user.user_id
    is_umkm = pesanan.umkm and pesanan.umkm.pemilik_id == current_user.user_id
    if not is_owner and not is_umkm and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak")

    return _build_pesanan_response(pesanan)


@router.post("/{pesanan_id}/bukti", response_model=PesananResponse)
async def upload_bukti_pembayaran(
    pesanan_id: str,
    metode_pembayaran: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["mahasiswa"])),
    db: Session = Depends(get_db),
):
    pesanan = db.query(Pesanan).options(
        joinedload(Pesanan.pembayaran).joinedload(Pembayaran.bukti),
        joinedload(Pesanan.detail_list).joinedload(DetailPesanan.menu),
        joinedload(Pesanan.umkm),
        joinedload(Pesanan.mahasiswa),
    ).filter(
        Pesanan.pesanan_id == pesanan_id,
        Pesanan.mahasiswa_id == current_user.user_id,
    ).first()

    if not pesanan:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    if pesanan.status_pesanan != "menunggu_pembayaran":
        raise HTTPException(status_code=400, detail="Pesanan tidak dalam status menunggu pembayaran")

    foto_url = await upload_image(file, folder="ipb-food-hub/bukti")

    pembayaran = pesanan.pembayaran
    pembayaran.metode_pembayaran = metode_pembayaran
    pembayaran.tanggal_bayar = datetime.now(timezone.utc)
    pembayaran.status_pembayaran = "menunggu_validasi"

    bukti = BuktiPembayaran(
        pembayaran_id=pembayaran.pembayaran_id,
        foto_url=foto_url,
    )
    pembayaran.bukti = bukti
    pesanan.status_pesanan = "menunggu_validasi"

    db.commit()
    db.refresh(pesanan)
    return _build_pesanan_response(pesanan)


@router.put("/{pesanan_id}/batal", response_model=PesananResponse)
def batal_pesanan(
    pesanan_id: str,
    current_user: User = Depends(require_role(["mahasiswa"])),
    db: Session = Depends(get_db),
):
    pesanan = db.query(Pesanan).options(
        joinedload(Pesanan.detail_list).joinedload(DetailPesanan.menu),
        joinedload(Pesanan.pembayaran).joinedload(Pembayaran.bukti),
        joinedload(Pesanan.umkm),
        joinedload(Pesanan.mahasiswa),
    ).filter(
        Pesanan.pesanan_id == pesanan_id,
        Pesanan.mahasiswa_id == current_user.user_id,
    ).first()

    if not pesanan:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    if pesanan.status_pesanan != "menunggu_pembayaran":
        raise HTTPException(status_code=400, detail="Pesanan tidak dapat dibatalkan pada status ini")

    pesanan.status_pesanan = "ditolak"
    if pesanan.pembayaran:
        pesanan.pembayaran.status_pembayaran = "ditolak"

    db.commit()
    db.refresh(pesanan)
    return _build_pesanan_response(pesanan)


@router.get("/umkm/masuk", response_model=list[PesananResponse])
def get_pesanan_masuk(
    status: str = None,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    umkm = db.query(UMKM).filter(UMKM.pemilik_id == current_user.user_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="Anda belum memiliki UMKM")

    query = db.query(Pesanan).options(
        joinedload(Pesanan.detail_list).joinedload(DetailPesanan.menu),
        joinedload(Pesanan.pembayaran).joinedload(Pembayaran.bukti),
        joinedload(Pesanan.umkm),
        joinedload(Pesanan.mahasiswa),
    ).filter(Pesanan.umkm_id == umkm.umkm_id)

    if status:
        query = query.filter(Pesanan.status_pesanan == status)

    pesanan_list = query.order_by(Pesanan.tanggal_pesan.desc()).all()
    return [_build_pesanan_response(p) for p in pesanan_list]


@router.put("/{pesanan_id}/status", response_model=PesananResponse)
def update_status_pesanan(
    pesanan_id: str,
    data: PesananUpdateStatus,
    current_user: User = Depends(require_role(["umkm", "admin"])),
    db: Session = Depends(get_db),
):
    pesanan = db.query(Pesanan).options(
        joinedload(Pesanan.detail_list).joinedload(DetailPesanan.menu),
        joinedload(Pesanan.pembayaran).joinedload(Pembayaran.bukti),
        joinedload(Pesanan.umkm),
        joinedload(Pesanan.mahasiswa),
    ).filter(Pesanan.pesanan_id == pesanan_id).first()

    if not pesanan:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")

    if current_user.role == "umkm":
        umkm = db.query(UMKM).filter(UMKM.pemilik_id == current_user.user_id).first()
        if not umkm or pesanan.umkm_id != umkm.umkm_id:
            raise HTTPException(status_code=403, detail="Bukan UMKM Anda")

    valid_statuses = [
        "menunggu_pembayaran", "menunggu_validasi",
        "diproses", "siap_diambil", "selesai", "ditolak"
    ]
    if data.status_pesanan not in valid_statuses:
        raise HTTPException(status_code=400, detail="Status tidak valid")

    pesanan.status_pesanan = data.status_pesanan

    if data.status_pesanan == "ditolak" and pesanan.pembayaran:
        pesanan.pembayaran.status_pembayaran = "ditolak"

    db.commit()
    db.refresh(pesanan)
    return _build_pesanan_response(pesanan)


@router.put("/{pesanan_id}/verifikasi-bukti", response_model=PesananResponse)
def verifikasi_bukti(
    pesanan_id: str,
    data: VerifikasiBuktiRequest,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    pesanan = db.query(Pesanan).options(
        joinedload(Pesanan.detail_list).joinedload(DetailPesanan.menu),
        joinedload(Pesanan.pembayaran).joinedload(Pembayaran.bukti),
        joinedload(Pesanan.umkm),
        joinedload(Pesanan.mahasiswa),
    ).filter(Pesanan.pesanan_id == pesanan_id).first()

    if not pesanan:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")

    umkm = db.query(UMKM).filter(UMKM.pemilik_id == current_user.user_id).first()
    if not umkm or pesanan.umkm_id != umkm.umkm_id:
        raise HTTPException(status_code=403, detail="Bukan UMKM Anda")

    if not pesanan.pembayaran or not pesanan.pembayaran.bukti:
        raise HTTPException(status_code=400, detail="Belum ada bukti pembayaran")

    bukti = pesanan.pembayaran.bukti
    bukti.status_verifikasi = data.status_verifikasi
    bukti.catatan_verifikasi = data.catatan_verifikasi

    if data.status_verifikasi == "terverifikasi":
        pesanan.pembayaran.status_pembayaran = "terverifikasi"
        pesanan.status_pesanan = "diproses"
    elif data.status_verifikasi == "ditolak":
        pesanan.pembayaran.status_pembayaran = "ditolak"
        pesanan.status_pesanan = "menunggu_pembayaran"  # Allow mahasiswa to re-upload proof

    db.commit()
    db.refresh(pesanan)
    return _build_pesanan_response(pesanan)
