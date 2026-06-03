from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token, get_current_user
)
from app.core.logging_aaa import log_login_attempt, log_accounting
from app.models.user import User
from app.schemas.user import UserRegister, TokenResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _ip(request: Request) -> str:
    return request.headers.get("x-forwarded-for", "") or (
        request.client.host if request.client else ""
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, request: Request, db: Session = Depends(get_db)):
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

    log_accounting(user_id=user.user_id, action="USER_REGISTER",
                   details=f"role={user.role}", ip=_ip(request))

    token = create_access_token(data={"sub": user.user_id, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
def login(request: Request,
          form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses 'username' field; we accept email there
    ip   = _ip(request)
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password):
        log_login_attempt(email=form_data.username, success=False,
                          ip=ip, reason="invalid_credentials")
        raise HTTPException(status_code=401, detail="Email atau password salah")

    if user.status != "aktif":
        log_login_attempt(email=form_data.username, success=False,
                          ip=ip, reason=f"account_status={user.status}")
        raise HTTPException(status_code=403, detail="Akun tidak aktif")

    log_login_attempt(email=user.email, success=True, ip=ip)
    token = create_access_token(data={"sub": user.user_id, "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_me(data: UserUpdate, current_user: User = Depends(get_current_user),
              db: Session = Depends(get_db)):
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    log_accounting(user_id=current_user.user_id, action="PROFILE_UPDATE",
                   details=f"fields={list(update_data.keys())}")
    return UserResponse.model_validate(current_user)
