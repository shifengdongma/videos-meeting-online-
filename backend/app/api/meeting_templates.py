from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.meeting import Meeting
from app.models.meeting_template import MeetingTemplate
from app.models.user import User
from app.schemas.meeting import MeetingResponse
from app.schemas.meeting_template import (
    MeetingTemplateCreate,
    MeetingTemplateResponse,
    MeetingTemplateUpdate,
    MeetingTemplateUseRequest,
    dump_tags,
)
from app.services.deps import get_current_user, require_roles

router = APIRouter(prefix="/meeting-templates", tags=["meeting-templates"])


@router.get("", response_model=list[MeetingTemplateResponse])
def list_meeting_templates(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(MeetingTemplate).order_by(MeetingTemplate.updated_at.desc()).all()


@router.post("", response_model=MeetingTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_meeting_template(
    payload: MeetingTemplateCreate,
    current_user: User = Depends(require_roles(RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    meeting_template = MeetingTemplate(
        name=payload.name,
        description=payload.description,
        default_title=payload.default_title,
        default_duration_minutes=payload.default_duration_minutes,
        capacity_label=payload.capacity_label,
        record_url=payload.record_url,
        tags=dump_tags(payload.tags),
        is_active=payload.is_active,
        created_by=current_user.id,
    )
    db.add(meeting_template)
    db.commit()
    db.refresh(meeting_template)
    return meeting_template


@router.get("/{template_id}", response_model=MeetingTemplateResponse)
def get_meeting_template(
    template_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting_template = db.query(MeetingTemplate).filter(MeetingTemplate.id == template_id).first()
    if not meeting_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="模板不存在")
    return meeting_template


@router.put("/{template_id}", response_model=MeetingTemplateResponse)
def update_meeting_template(
    template_id: int,
    payload: MeetingTemplateUpdate,
    _: User = Depends(require_roles(RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    meeting_template = db.query(MeetingTemplate).filter(MeetingTemplate.id == template_id).first()
    if not meeting_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="模板不存在")

    meeting_template.name = payload.name
    meeting_template.description = payload.description
    meeting_template.default_title = payload.default_title
    meeting_template.default_duration_minutes = payload.default_duration_minutes
    meeting_template.capacity_label = payload.capacity_label
    meeting_template.record_url = payload.record_url
    meeting_template.tags = dump_tags(payload.tags)
    meeting_template.is_active = payload.is_active
    db.commit()
    db.refresh(meeting_template)
    return meeting_template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting_template(
    template_id: int,
    _: User = Depends(require_roles(RoleEnum.admin)),
    db: Session = Depends(get_db),
):
    meeting_template = db.query(MeetingTemplate).filter(MeetingTemplate.id == template_id).first()
    if not meeting_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="模板不存在")
    db.delete(meeting_template)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{template_id}/use", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def use_meeting_template(
    template_id: int,
    payload: MeetingTemplateUseRequest,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting_template = db.query(MeetingTemplate).filter(MeetingTemplate.id == template_id).first()
    if not meeting_template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="模板不存在")
    if not meeting_template.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="模板已停用")

    end_time = payload.end_time
    if end_time is None:
        if meeting_template.default_duration_minutes is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="模板缺少默认会议时长")
        end_time = payload.start_time + timedelta(minutes=meeting_template.default_duration_minutes)

    title = payload.title or meeting_template.default_title or meeting_template.name
    meeting = Meeting(
        title=title,
        start_time=payload.start_time,
        end_time=end_time,
        record_url=payload.record_url if payload.record_url is not None else meeting_template.record_url,
        host_id=current_user.id,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting
