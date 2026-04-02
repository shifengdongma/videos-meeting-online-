from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import MeetingStatus


class MeetingBase(BaseModel):
    title: str
    address: str | None = None
    start_time: datetime
    end_time: datetime
    earliest_entry_time: datetime | None = None
    record_url: str | None = None


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(BaseModel):
    title: str | None = None
    address: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    earliest_entry_time: datetime | None = None
    status: MeetingStatus | None = None
    record_url: str | None = None


class MeetingPublish(BaseModel):
    is_published: bool


class MeetingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    address: str | None = None
    start_time: datetime
    end_time: datetime
    earliest_entry_time: datetime | None = None
    is_published: bool = False
    host_id: int
    status: MeetingStatus
    record_url: str | None = None
    created_at: datetime


class MeetingParticipantBase(BaseModel):
    name: str
    phone: str | None = None
    department: str | None = None
    user_id: int | None = None


class MeetingParticipantCreate(MeetingParticipantBase):
    pass


class MeetingParticipantBatchCreate(BaseModel):
    participants: list[MeetingParticipantCreate]


class MeetingParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    name: str
    phone: str | None = None
    department: str | None = None
    user_id: int | None = None
    created_at: datetime


class MeetingModuleBase(BaseModel):
    module_name: str
    icon: str | None = None
    is_active: bool = True
    sort_order: int = 0


class MeetingModuleCreate(MeetingModuleBase):
    pass


class MeetingModuleUpdate(BaseModel):
    module_name: str | None = None
    icon: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class MeetingModuleBatchUpdate(BaseModel):
    modules: list[MeetingModuleUpdate]


class MeetingModuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    module_name: str
    icon: str | None = None
    is_active: bool
    sort_order: int
    created_at: datetime


class MeetingDetailResponse(MeetingResponse):
    participants: list[MeetingParticipantResponse] = []
    modules: list[MeetingModuleResponse] = []