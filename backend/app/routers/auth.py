from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token, get_current_user
)
from app.models.user import User
from app.schemas.user import UserRegister, TokenResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Registrasi user baru (mahasiswa/umkm/admin)."""
    # Cek email sudah terdaftar
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    if data.role not in ["mahasiswa", "umkm", "admin"]:
        raise HTTPException(status_code=400, detail="Role tidak valid")

    user = User(
        nama=data.nama,
        email=data.email,
        password=get_password_hash(data.password),
        no_telp=data.no_telp,
        role=data.role,
        nim=data.nim,
        fakultas=data.fakultas,
        departemen=data.departemen,
        angkatan=data.angkatan,
        nik=data.nik,
        nomor_rekening=data.nomor_rekening,
        nama_bank=data.nama_bank,
        nomor_ewallet=data.nomor_ewallet,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.user_id, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login dengan email (diisi di kolom username pada Swagger) dan password."""
    # Swagger menggunakan field 'username', jadi kita mapping ke 'email' di database kita
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    if user.status != "aktif":
        raise HTTPException(status_code=403, detail="Akun tidak aktif")

    token = create_access_token(data={"sub": user.user_id, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Mendapatkan data user yang sedang login."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_me(data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update profil user yang sedang login."""
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
