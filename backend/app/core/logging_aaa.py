import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

_default_log_dir = "/tmp/logs" if os.getenv("VERCEL") else "./logs"  # only writable path in Vercel serverless
LOG_DIR  = os.getenv("AAA_LOG_DIR", _default_log_dir)
LOG_FILE = os.path.join(LOG_DIR, "aaa_accounting.log")

_aaa_logger = logging.getLogger("aaa.accounting")
_aaa_logger.setLevel(logging.INFO)
_aaa_logger.propagate = False

if not _aaa_logger.handlers:
    try:
        Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
        _h = logging.FileHandler(LOG_FILE, encoding="utf-8")
        _h.setFormatter(logging.Formatter("%(message)s"))
        _aaa_logger.addHandler(_h)
    except OSError:
        # Filesystem may be read-only on Vercel cold start — fall back to stderr
        _aaa_logger.addHandler(logging.StreamHandler())


def log_accounting(user_id: str, action: str, details: str = "", ip: str = "") -> None:
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
