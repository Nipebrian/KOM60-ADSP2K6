import os
import uuid
from fastapi import HTTPException, UploadFile

from app.core.config import (
    USE_CLOUDINARY, CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
    UPLOAD_DIR,
)

ALLOWED_IMG_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_IMG_SIZE = 5 * 1024 * 1024  # 5 MB

if USE_CLOUDINARY:
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_image(file: UploadFile, folder: str = "ipb-food-hub") -> str:
    ext = os.path.splitext(file.filename or '')[1].lower()
    if ext not in ALLOWED_IMG_EXT:
        raise HTTPException(
            status_code=400,
            detail="Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.",
        )

    contents = await file.read()
    if len(contents) > MAX_IMG_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Ukuran file terlalu besar. Maksimal 5MB.",
        )

    if USE_CLOUDINARY:
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="image",
        )
        return result["secure_url"]

    # Fallback: local disk — only usable in development
    filename = f"{uuid.uuid4()}{ext}"
    with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
        f.write(contents)
    return f"/uploads/{filename}"
