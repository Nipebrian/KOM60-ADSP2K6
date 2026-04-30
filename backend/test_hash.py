from app.core.security import get_password_hash
try:
    hash = get_password_hash("password")
    print("Hash success:", hash)
except Exception as e:
    import traceback
    traceback.print_exc()
