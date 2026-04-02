import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.enums import MeetingStatus, RoleEnum
from app.models.meeting import Meeting, MeetingModule, MeetingParticipant
from app.models.user import User
from app.schemas.meeting import (
    MeetingCreate,
    MeetingDetailResponse,
    MeetingModuleBatchUpdate,
    MeetingModuleCreate,
    MeetingModuleResponse,
    MeetingModuleUpdate,
    MeetingParticipantBatchCreate,
    MeetingParticipantCreate,
    MeetingParticipantResponse,
    MeetingPublish,
    MeetingResponse,
    MeetingUpdate,
)
from app.services.deps import get_current_user, require_roles

router = APIRouter(prefix="/meetings", tags=["meetings"])
logger = logging.getLogger(__name__)


@router.get("", response_model=list[MeetingResponse])
def list_meetings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    id: int | None = Query(None, description="会议编号"),
    title: str | None = Query(None, description="会议名称"),
    is_published: bool | None = Query(None, description="是否发布"),
):
    query = db.query(Meeting).order_by(Meeting.start_time.desc())
    if id is not None:
        query = query.filter(Meeting.id == id)
    if title:
        query = query.filter(Meeting.title.contains(title))
    if is_published is not None:
        query = query.filter(Meeting.is_published == is_published)
    if current_user.role == RoleEnum.user:
        return query.all()
    return query.all()


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = Meeting(
        title=payload.title,
        address=payload.address,
        start_time=payload.start_time,
        end_time=payload.end_time,
        earliest_entry_time=payload.earliest_entry_time,
        record_url=payload.record_url,
        host_id=current_user.id,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # 创建默认模块
    default_modules = [
        {"module_name": "会议须知", "icon": "Document", "sort_order": 1},
        {"module_name": "会议议程", "icon": "Calendar", "sort_order": 2},
        {"module_name": "投票选举", "icon": "Vote", "sort_order": 3},
        {"module_name": "文件材料", "icon": "Folder", "sort_order": 4},
        {"module_name": "智能排座", "icon": "Grid", "sort_order": 5},
        {"module_name": "签到", "icon": "Check", "sort_order": 6},
    ]
    for module_data in default_modules:
        module = MeetingModule(
            meeting_id=meeting.id,
            module_name=module_data["module_name"],
            icon=module_data["icon"],
            is_active=True,
            sort_order=module_data["sort_order"],
        )
        db.add(module)
    db.commit()

    return meeting


@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
def get_meeting(
    meeting_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = (
        db.query(Meeting)
        .options(joinedload(Meeting.participants), joinedload(Meeting.modules))
        .filter(Meeting.id == meeting_id)
        .first()
    )
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")
    return meeting


@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: int,
    payload: MeetingUpdate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")
    if current_user.role != RoleEnum.admin and meeting.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权修改该会议")

    if payload.title is not None:
        meeting.title = payload.title
    if payload.address is not None:
        meeting.address = payload.address
    if payload.start_time is not None:
        meeting.start_time = payload.start_time
    if payload.end_time is not None:
        meeting.end_time = payload.end_time
    if payload.earliest_entry_time is not None:
        meeting.earliest_entry_time = payload.earliest_entry_time
    if payload.status is not None:
        meeting.status = payload.status
    if payload.record_url is not None:
        meeting.record_url = payload.record_url

    db.commit()
    db.refresh(meeting)
    return meeting


@router.put("/{meeting_id}/publish", response_model=MeetingResponse)
def publish_meeting(
    meeting_id: int,
    payload: MeetingPublish,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")
    if current_user.role != RoleEnum.admin and meeting.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权发布该会议")

    meeting.is_published = payload.is_published
    db.commit()
    db.refresh(meeting)

    if payload.is_published:
        logger.info(f"会议 [{meeting.id}] 已发布: {meeting.title}")

    return meeting


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(
    meeting_id: int,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")
    if current_user.role != RoleEnum.admin and meeting.host_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="无权删除该会议")
    db.delete(meeting)
    db.commit()


# === 参会人员管理 API ===

@router.get("/{meeting_id}/participants", response_model=list[MeetingParticipantResponse])
def list_participants(
    meeting_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")

    participants = (
        db.query(MeetingParticipant)
        .filter(MeetingParticipant.meeting_id == meeting_id)
        .order_by(MeetingParticipant.created_at.desc())
        .all()
    )
    return participants


@router.post(
    "/{meeting_id}/participants",
    response_model=MeetingParticipantResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_participant(
    meeting_id: int,
    payload: MeetingParticipantCreate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")

    participant = MeetingParticipant(
        meeting_id=meeting_id,
        name=payload.name,
        phone=payload.phone,
        department=payload.department,
        user_id=payload.user_id,
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


@router.post(
    "/{meeting_id}/participants/batch",
    response_model=list[MeetingParticipantResponse],
    status_code=status.HTTP_201_CREATED,
)
def batch_create_participants(
    meeting_id: int,
    payload: MeetingParticipantBatchCreate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")

    participants = []
    for item in payload.participants:
        participant = MeetingParticipant(
            meeting_id=meeting_id,
            name=item.name,
            phone=item.phone,
            department=item.department,
            user_id=item.user_id,
        )
        db.add(participant)
        participants.append(participant)

    db.commit()
    for p in participants:
        db.refresh(p)
    return participants


@router.delete("/{meeting_id}/participants/{participant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_participant(
    meeting_id: int,
    participant_id: int,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    participant = (
        db.query(MeetingParticipant)
        .filter(MeetingParticipant.meeting_id == meeting_id, MeetingParticipant.id == participant_id)
        .first()
    )
    if not participant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="参会人员不存在")
    db.delete(participant)
    db.commit()


# === 会议模块管理 API ===

@router.get("/{meeting_id}/modules", response_model=list[MeetingModuleResponse])
def list_modules(
    meeting_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")

    modules = (
        db.query(MeetingModule)
        .filter(MeetingModule.meeting_id == meeting_id)
        .order_by(MeetingModule.sort_order)
        .all()
    )
    return modules


@router.post(
    "/{meeting_id}/modules",
    response_model=MeetingModuleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_module(
    meeting_id: int,
    payload: MeetingModuleCreate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")

    module = MeetingModule(
        meeting_id=meeting_id,
        module_name=payload.module_name,
        icon=payload.icon,
        is_active=payload.is_active,
        sort_order=payload.sort_order,
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.put("/{meeting_id}/modules/{module_id}", response_model=MeetingModuleResponse)
def update_module(
    meeting_id: int,
    module_id: int,
    payload: MeetingModuleUpdate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    module = (
        db.query(MeetingModule)
        .filter(MeetingModule.meeting_id == meeting_id, MeetingModule.id == module_id)
        .first()
    )
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="模块不存在")

    if payload.module_name is not None:
        module.module_name = payload.module_name
    if payload.icon is not None:
        module.icon = payload.icon
    if payload.is_active is not None:
        module.is_active = payload.is_active
    if payload.sort_order is not None:
        module.sort_order = payload.sort_order

    db.commit()
    db.refresh(module)
    return module


@router.put("/{meeting_id}/modules/batch", response_model=list[MeetingModuleResponse])
def batch_update_modules(
    meeting_id: int,
    payload: MeetingModuleBatchUpdate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")

    modules = db.query(MeetingModule).filter(MeetingModule.meeting_id == meeting_id).all()
    module_map = {m.id: m for m in modules}

    for idx, update_data in enumerate(payload.modules):
        module_id = update_data.get("id") if isinstance(update_data, dict) else None
        if module_id and module_id in module_map:
            module = module_map[module_id]
        elif idx < len(modules):
            module = modules[idx]
        else:
            continue

        if hasattr(update_data, "module_name") and update_data.module_name is not None:
            module.module_name = update_data.module_name
        if hasattr(update_data, "icon") and update_data.icon is not None:
            module.icon = update_data.icon
        if hasattr(update_data, "is_active") and update_data.is_active is not None:
            module.is_active = update_data.is_active
        if hasattr(update_data, "sort_order") and update_data.sort_order is not None:
            module.sort_order = update_data.sort_order

    db.commit()
    return db.query(MeetingModule).filter(MeetingModule.meeting_id == meeting_id).order_by(MeetingModule.sort_order).all()


@router.delete("/{meeting_id}/modules/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(
    meeting_id: int,
    module_id: int,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    module = (
        db.query(MeetingModule)
        .filter(MeetingModule.meeting_id == meeting_id, MeetingModule.id == module_id)
        .first()
    )
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="模块不存在")
    db.delete(module)
    db.commit()