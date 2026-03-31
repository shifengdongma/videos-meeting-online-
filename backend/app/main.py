import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.live_streams import router as live_stream_router
from app.api.meeting_templates import router as meeting_template_router
from app.api.meetings import router as meeting_router
from app.api.upload import router as upload_router
from app.api.users import router as user_router
from app.api.votes import router as vote_router
from app.api.ws import router as ws_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Create uploads directory if not exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(user_router, prefix=settings.api_v1_prefix)
app.include_router(meeting_router, prefix=settings.api_v1_prefix)
app.include_router(meeting_template_router, prefix=settings.api_v1_prefix)
app.include_router(live_stream_router, prefix=settings.api_v1_prefix)
app.include_router(vote_router, prefix=settings.api_v1_prefix)
app.include_router(upload_router, prefix=settings.api_v1_prefix)
app.include_router(ws_router)


@app.get("/")
def root():
    return {"message": "视频会议管理系统 API 运行中"}
