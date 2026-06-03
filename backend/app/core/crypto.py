# AES-256-GCM symmetric encryption.
# DB storage format (base64): IV(12 byte) || CIPHERTEXT || GCM_TAG(16 byte)

import os
import base64
from typing import Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import ENCRYPTION_KEY


def _get_key() -> bytes:
    if not ENCRYPTION_KEY:
        raise RuntimeError(
            "ENCRYPTION_KEY belum diset di .env.\n"
            "Generate: python -c \"import os,base64; print(base64.b64encode(os.urandom(32)).decode())\""
        )
    try:
        key = base64.b64decode(ENCRYPTION_KEY)
    except Exception as e:
        raise RuntimeError(f"ENCRYPTION_KEY harus base64 valid: {e}")
    if len(key) != 32:
        raise RuntimeError(f"ENCRYPTION_KEY harus 32 byte (sekarang {len(key)} byte)")
    return key


def encrypt(plaintext: str) -> Optional[str]:
    if plaintext is None:
        return None
    key    = _get_key()
    aesgcm = AESGCM(key)
    iv     = os.urandom(12)
    ct     = aesgcm.encrypt(iv, plaintext.encode("utf-8"), associated_data=None)
    return base64.b64encode(iv + ct).decode("ascii")


def decrypt(ciphertext_b64: str) -> Optional[str]:
    # Raises InvalidTag if ciphertext was tampered (GCM integrity check)
    if ciphertext_b64 is None:
        return None
    key    = _get_key()
    aesgcm = AESGCM(key)
    blob   = base64.b64decode(ciphertext_b64)
    iv, ct = blob[:12], blob[12:]
    return aesgcm.decrypt(iv, ct, associated_data=None).decode("utf-8")
