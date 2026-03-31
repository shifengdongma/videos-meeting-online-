import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.live_stream import LiveStream
from app.models.user import User
from app.schemas.live_stream import LiveStreamCreate, LiveStreamResponse
from app.services.deps import get_current_user, require_roles

router = APIRouter(prefix="/live-streams", tags=["live-streams"])


@router.get("", response_model=list[LiveStreamResponse])
def list_live_streams(db: Session = Depends(get_db)):
    return db.query(LiveStream).order_by(LiveStream.start_time.desc()).all()


@router.post("", response_model=LiveStreamResponse, status_code=status.HTTP_201_CREATED)
def create_live_stream(
    payload: LiveStreamCreate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    # Validate parent_id if provided
    if payload.parent_id is not None:
        parent_stream = db.query(LiveStream).filter(LiveStream.id == payload.parent_id).first()
        if not parent_stream:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="主会场直播不存在")
        # Ensure parent is not already a sub-venue (no nested hierarchy beyond 1 level)
        if parent_stream.parent_id is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="分会场不能作为主会场创建子会场")

    stream = LiveStream(
        title=payload.title,
        record_url=payload.record_url,
        host_id=current_user.id,
        room_code=uuid.uuid4().hex[:12],
        parent_id=payload.parent_id,
    )
    db.add(stream)
    db.commit()
    db.refresh(stream)
    return stream


@router.get("/{stream_id}", response_model=LiveStreamResponse)
def get_live_stream(stream_id: int, db: Session = Depends(get_db)):
    stream = db.query(LiveStream).filter(LiveStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="直播不存在")
    return stream


@router.get("/{stream_id}/sub-venues", response_model=list[LiveStreamResponse])
def get_sub_venues(stream_id: int, db: Session = Depends(get_db)):
    """Get all sub-venues for a main venue live stream."""
    main_stream = db.query(LiveStream).filter(LiveStream.id == stream_id).first()
    if not main_stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="直播不存在")
    if main_stream.parent_id is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="该直播是分会场，没有子会场")

    sub_venues = db.query(LiveStream).filter(LiveStream.parent_id == stream_id).order_by(LiveStream.start_time.desc()).all()
    return sub_venues


@router.post("/{stream_id}/stop", response_model=LiveStreamResponse)
def stop_live_stream(
    stream_id: int,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    stream = db.query(LiveStream).filter(LiveStream.id == stream_id).first()
    if not stream:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="直播不存在")
    if current_user.role != RoleEnum.admin and stream.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权结束该直播")
    return stream
