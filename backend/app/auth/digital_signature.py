# RSA-2048 PSS + SHA-256 for transaction non-repudiation.
# One-time setup: python -m app.auth.digital_signature

import base64
from pathlib import Path
from typing import Tuple
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa

try:
    from app.core.config import RSA_PRIVATE_KEY_PATH, RSA_PUBLIC_KEY_PATH
except ImportError:
    RSA_PRIVATE_KEY_PATH = "./keys/private.pem"
    RSA_PUBLIC_KEY_PATH  = "./keys/public.pem"


def generate_keypair(private_path=RSA_PRIVATE_KEY_PATH,
                     public_path=RSA_PUBLIC_KEY_PATH, key_size=2048) -> Tuple[str, str]:
    Path(private_path).parent.mkdir(parents=True, exist_ok=True)
    priv = rsa.generate_private_key(public_exponent=65537, key_size=key_size)
    Path(private_path).write_bytes(priv.private_bytes(
        serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption()))
    Path(public_path).write_bytes(priv.public_key().public_bytes(
        serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo))
    return private_path, public_path


def sign_message(message: str, private_key_path=RSA_PRIVATE_KEY_PATH) -> str:
    priv = serialization.load_pem_private_key(
        Path(private_key_path).read_bytes(), password=None)
    sig = priv.sign(message.encode("utf-8"),
                    padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
                                salt_length=padding.PSS.MAX_LENGTH),
                    hashes.SHA256())
    return base64.b64encode(sig).decode("ascii")


def verify_signature(message: str, signature_b64: str,
                     public_key_path=RSA_PUBLIC_KEY_PATH) -> bool:
    pub = serialization.load_pem_public_key(Path(public_key_path).read_bytes())
    try:
        pub.verify(base64.b64decode(signature_b64), message.encode("utf-8"),
                   padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
                               salt_length=padding.PSS.MAX_LENGTH),
                   hashes.SHA256())
        return True
    except InvalidSignature:
        return False


if __name__ == "__main__":
    import json
    p, q = generate_keypair()
    print(f"Private key -> {p}\nPublic key  -> {q}")
    print("JANGAN commit file .pem (sudah di .gitignore)")
    msg = json.dumps({"test": True}, sort_keys=True)
    sig = sign_message(msg)
    print(f"\nSmoke test: verify={verify_signature(msg, sig)} | tampered={verify_signature(msg+'!', sig)}")
