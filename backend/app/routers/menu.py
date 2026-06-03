from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.core.cloudinary_helper import upload_image
from app.models.user import User
from app.models.umkm import UMKM
from app.models.menu import Menu
from app.schemas.menu import MenuCreate, MenuUpdate, MenuResponse

router = APIRouter(prefix="/api/umkm/{umkm_id}/menu", tags=["Menu"])


@router.get("", response_model=list[MenuResponse])
def list_menu(umkm_id: str, db: Session = Depends(get_db)):
    """Daftar semua menu dari UMKM tertentu (publik)."""
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")
    menus = db.query(Menu).filter(Menu.umkm_id == umkm_id).all()
    return [MenuResponse.model_validate(m) for m in menus]


@router.get("/{menu_id}", response_model=MenuResponse)
def get_menu(umkm_id: str, menu_id: str, db: Session = Depends(get_db)):
    """Mendapatkan detail satu menu."""
    menu = db.query(Menu).filter(Menu.menu_id == menu_id, Menu.umkm_id == umkm_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu tidak ditemukan")
    return MenuResponse.model_validate(menu)


@router.post("", response_model=MenuResponse, status_code=201)
def create_menu(
    umkm_id: str,
    data: MenuCreate,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    """Menambahkan menu baru ke UMKM (hanya pemilik UMKM)."""
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm:
        raise HTTPException(status_code=404, detail="UMKM tidak ditemukan")
    if umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Bukan pemilik UMKM ini")

    menu = Menu(
        umkm_id=umkm_id,
        nama_menu=data.nama_menu,
        deskripsi=data.deskripsi,
        harga=data.harga,
        kategori=data.kategori,
        foto_menu=data.foto_menu,
    )
    db.add(menu)
    db.commit()
    db.refresh(menu)
    return MenuResponse.model_validate(menu)


@router.put("/{menu_id}", response_model=MenuResponse)
def update_menu(
    umkm_id: str,
    menu_id: str,
    data: MenuUpdate,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    """Update data menu (hanya pemilik UMKM)."""
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm or umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    menu = db.query(Menu).filter(Menu.menu_id == menu_id, Menu.umkm_id == umkm_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu tidak ditemukan")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(menu, key, value)
    db.commit()
    db.refresh(menu)
    return MenuResponse.model_validate(menu)


@router.delete("/{menu_id}")
def delete_menu(
    umkm_id: str,
    menu_id: str,
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    """Hapus menu (hanya pemilik UMKM). Jika menu sudah pernah dipesan, menu dinonaktifkan."""
    from app.models.pesanan import DetailPesanan

    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm or umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    menu = db.query(Menu).filter(Menu.menu_id == menu_id, Menu.umkm_id == umkm_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu tidak ditemukan")

    # Cek apakah menu pernah dipesan (ada di detail_pesanan)
    has_orders = db.query(DetailPesanan).filter(DetailPesanan.menu_id == menu_id).first()
    if has_orders:
        # Tidak bisa dihapus, nonaktifkan saja
        menu.status_ketersediaan = False
        db.commit()
        return {"message": "Menu sudah pernah dipesan, status diubah ke tidak tersedia"}

    db.delete(menu)
    db.commit()
    return {"message": "Menu berhasil dihapus"}


@router.post("/{menu_id}/upload-foto", response_model=MenuResponse)
async def upload_foto_menu(
    umkm_id: str,
    menu_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["umkm"])),
    db: Session = Depends(get_db),
):
    """Upload foto menu."""
    umkm = db.query(UMKM).filter(UMKM.umkm_id == umkm_id).first()
    if not umkm or umkm.pemilik_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    menu = db.query(Menu).filter(Menu.menu_id == menu_id, Menu.umkm_id == umkm_id).first()
    if not menu:
        raise HTTPException(status_code=404, detail="Menu tidak ditemukan")

    menu.foto_menu = await upload_image(file, folder="ipb-food-hub/menu")
    db.commit()
    db.refresh(menu)
    return MenuResponse.model_validate(menu)
