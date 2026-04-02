import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.auth import router as auth_router
from app.api.live_streams import router as live_stream_router
from app.api.meeting_templates import router as meeting_template_router
from app.api.meetings import router as meeting_router
from app.api.participants import router as participant_router
from app.api.upload import router as upload_router
from app.api.users import router as user_router
from app.api.votes import router as vote_router
from app.api.ws import router as ws_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.services.notification import start_notification_service, stop_notification_service

logger = logging.getLogger(__name__)

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
app.include_router(participant_router, prefix=settings.api_v1_prefix)
app.include_router(meeting_template_router, prefix=settings.api_v1_prefix)
app.include_router(live_stream_router, prefix=settings.api_v1_prefix)
app.include_router(vote_router, prefix=settings.api_v1_prefix)
app.include_router(upload_router, prefix=settings.api_v1_prefix)
app.include_router(ws_router)


@app.on_event("startup")
async def startup_event():
    """应用启动时执行"""
    logger.info("应用启动中...")
    await start_notification_service()
    logger.info("会议通知推送服务已启动")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行"""
    logger.info("应用关闭中...")
    stop_notification_service()
    logger.info("会议通知推送服务已停止")


@app.get("/")
def root():
    return {"message": "视频会议管理系统 API 运行中"}
