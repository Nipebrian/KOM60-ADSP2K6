from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AuditLogEntry(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_nama: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    method: str
    endpoint: str
    status_code: int
    ip_address: Optional[str] = None
    duration_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuthStats(BaseModel):
    total_login_attempts: int
    successful_logins: int
    failed_logins: int
    success_rate: float
    logins_today: int
    failed_today: int


class AuthzStats(BaseModel):
    total_requests_today: int
    access_denied_today: int
    active_users_today: int
    total_requests_all: int


class AccountingStats(BaseModel):
    total_logs: int
    logs_today: int
    logs_this_week: int


class RoleDistribution(BaseModel):
    mahasiswa: int
    umkm: int
    admin: int


class SecurityStats(BaseModel):
    auth: AuthStats
    authz: AuthzStats
    accounting: AccountingStats
    role_distribution: RoleDistribution


class AuditLogList(BaseModel):
    items: List[AuditLogEntry]
    total: int
    page: int
    page_size: int
