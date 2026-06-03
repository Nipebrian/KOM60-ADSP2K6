from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import require_role
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.security import (
    SecurityStats, AuditLogList, AuditLogEntry,
    AuthStats, AuthzStats, AccountingStats, RoleDistribution,
)

router = APIRouter(prefix="/api/security", tags=["Security (AAA)"])


def _today():
    now = datetime.now(timezone.utc)
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def _week_start():
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=now.weekday())
    return start.replace(hour=0, minute=0, second=0, microsecond=0)


@router.get("/stats", response_model=SecurityStats)
def get_security_stats(
    db: Session = Depends(get_db),
    _current: User = Depends(require_role(["admin"])),
):
    today = _today()
    week = _week_start()

    login_base = db.query(AuditLog).filter(
        AuditLog.endpoint == "/api/auth/login",
        AuditLog.method == "POST",
    )
    total_attempts = login_base.count()
    successful = login_base.filter(AuditLog.status_code == 200).count()
    failed = login_base.filter(AuditLog.status_code.in_([400, 401, 422])).count()
    logins_today = login_base.filter(
        AuditLog.created_at >= today, AuditLog.status_code == 200
    ).count()
    failed_today = login_base.filter(
        AuditLog.created_at >= today, AuditLog.status_code.in_([400, 401, 422])
    ).count()
    success_rate = round((successful / total_attempts * 100) if total_attempts > 0 else 0.0, 1)

    total_today = db.query(AuditLog).filter(AuditLog.created_at >= today).count()
    access_denied_today = db.query(AuditLog).filter(
        AuditLog.created_at >= today, AuditLog.status_code == 403
    ).count()
    active_users_today = (
        db.query(func.count(func.distinct(AuditLog.user_id)))
        .filter(AuditLog.created_at >= today, AuditLog.user_id.isnot(None))
        .scalar() or 0
    )
    total_all = db.query(AuditLog).count()

    logs_week = db.query(AuditLog).filter(AuditLog.created_at >= week).count()

    role_rows = db.query(User.role, func.count(User.user_id)).group_by(User.role).all()
    role_map = {r: c for r, c in role_rows}

    return SecurityStats(
        auth=AuthStats(
            total_login_attempts=total_attempts,
            successful_logins=successful,
            failed_logins=failed,
            success_rate=success_rate,
            logins_today=logins_today,
            failed_today=failed_today,
        ),
        authz=AuthzStats(
            total_requests_today=total_today,
            access_denied_today=access_denied_today,
            active_users_today=active_users_today,
            total_requests_all=total_all,
        ),
        accounting=AccountingStats(
            total_logs=total_all,
            logs_today=total_today,
            logs_this_week=logs_week,
        ),
        role_distribution=RoleDistribution(
            mahasiswa=role_map.get("mahasiswa", 0),
            umkm=role_map.get("umkm", 0),
            admin=role_map.get("admin", 0),
        ),
    )


@router.get("/audit-logs", response_model=AuditLogList)
def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    method: Optional[str] = None,
    status_code: Optional[int] = None,
    user_id: Optional[str] = None,
    endpoint: Optional[str] = None,
    db: Session = Depends(get_db),
    _current: User = Depends(require_role(["admin"])),
):
    q = db.query(AuditLog)
    if method:
        q = q.filter(AuditLog.method == method.upper())
    if status_code:
        q = q.filter(AuditLog.status_code == status_code)
    if user_id:
        q = q.filter(AuditLog.user_id == user_id)
    if endpoint:
        q = q.filter(AuditLog.endpoint.contains(endpoint))

    total = q.count()
    logs = (
        q.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = []
    for log in logs:
        user_obj = (
            db.query(User).filter(User.user_id == log.user_id).first()
            if log.user_id else None
        )
        items.append(
            AuditLogEntry(
                id=log.id,
                user_id=log.user_id,
                user_nama=user_obj.nama if user_obj else None,
                user_email=user_obj.email if user_obj else None,
                user_role=user_obj.role if user_obj else None,
                method=log.method,
                endpoint=log.endpoint,
                status_code=log.status_code,
                ip_address=log.ip_address,
                duration_ms=log.duration_ms,
                created_at=log.created_at,
            )
        )

    return AuditLogList(items=items, total=total, page=page, page_size=page_size)
