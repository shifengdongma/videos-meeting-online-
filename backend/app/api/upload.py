import os
import uuid
from datetime import datetime

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from app.services.deps import require_roles

router = APIRouter(prefix="/upload", tags=["upload"])

# Upload directory
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    """Upload a file (image, document, etc.) and return the URL."""

    # Check file size
    file.file.seek(0, 2)  # Move to end of file
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"文件大小超出限制（最大 {MAX_FILE_SIZE // 1024 // 1024}MB）"
        )

    # Generate unique filename
    original_filename = file.filename or "unknown"
    file_ext = os.path.splitext(original_filename)[1]
    unique_filename = f"{datetime.utcnow().strftime('%Y%m%d')}_{uuid.uuid4().hex[:8]}{file_ext}"

    # Save file
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Determine file type
    content_type = file.content_type or "application/octet-stream"
    msg_type = "file"
    if content_type.startswith("image/"):
        msg_type = "image"

    # Return file info
    return JSONResponse({
        "url": f"/uploads/{unique_filename}",
        "filename": original_filename,
        "stored_filename": unique_filename,
        "size": file_size,
        "type": msg_type,
        "content_type": content_type
    })