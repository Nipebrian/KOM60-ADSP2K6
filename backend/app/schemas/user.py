from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    """Schema untuk registrasi user baru."""
    nama: str
    email: EmailStr
    password: str
    no_telp: Optional[str] = None
    role: str  # mahasiswa, umkm, admin

    # Mahasiswa fields
    nim: Optional[str] = None
    fakultas: Optional[str] = None
    departemen: Optional[str] = None
    angkatan: Optional[str] = None

    # UMKM fields
    nik: Optional[str] = None
    nomor_rekening: Optional[str] = None
    nama_bank: Optional[str] = None
    nomor_ewallet: Optional[str] = None


class UserLogin(BaseModel):
    """Schema untuk login."""
    email: str
    password: str


class TokenResponse(BaseModel):
    """Schema untuk response token JWT."""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """Schema untuk response data user."""
    user_id: str
    nama: str
    email: str
    no_telp: Optional[str] = None
    foto_profil: Optional[str] = None
    tanggal_daftar: Optional[datetime] = None
    status: str
    role: str
    nim: Optional[str] = None
    fakultas: Optional[str] = None
    departemen: Optional[str] = None
    angkatan: Optional[str] = None
    nik: Optional[str] = None
    nomor_rekening: Optional[str] = None
    nama_bank: Optional[str] = None
    nomor_ewallet: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema untuk update profil user."""
    nama: Optional[str] = None
    no_telp: Optional[str] = None
    foto_profil: Optional[str] = None
    nim: Optional[str] = None
    fakultas: Optional[str] = None
    departemen: Optional[str] = None
    angkatan: Optional[str] = None
    nomor_rekening: Optional[str] = None
    nama_bank: Optional[str] = None
    nomor_ewallet: Optional[str] = None


# Resolve forward reference
TokenResponse.model_rebuild()
