"""
Modul AAA Accounting — Logging Aktivitas User
"""

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

LOG_DIR  = os.getenv("AAA_LOG_DIR", "./logs")
Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "aaa_accounting.log")

_aaa_logger = logging.getLogger("aaa.accounting")
_aaa_logger.setLevel(logging.INFO)
_aaa_logger.propagate = False

if not _aaa_logger.handlers:
    _h = logging.FileHandler(LOG_FILE, encoding="utf-8")
    _h.setFormatter(logging.Formatter("%(message)s"))
    _aaa_logger.addHandler(_h)


def log_accounting(user_id: str, action: str, details: str = "", ip: str = "") -> None:
    """Catat satu entri AAA Accounting ke file JSON-line."""
    _aaa_logger.info(json.dumps({
        "ts":      datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "action":  action,
        "details": details,
        "ip":      ip,
    }, ensure_ascii=False))


def log_login_attempt(email: str, success: bool, ip: str = "", reason: str = "") -> None:
    log_accounting(
        user_id=email,
        action="LOGIN_SUCCESS" if success else "LOGIN_FAILED",
        details=reason,
        ip=ip,
    )
