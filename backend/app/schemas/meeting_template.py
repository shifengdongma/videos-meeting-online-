from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.meeting import MeetingResponse

_TAG_SEPARATOR = ","


def normalize_tags(tags: list[str] | str | None) -> list[str]:
    if tags is None:
        return []
    if isinstance(tags, str):
        items = tags.split(_TAG_SEPARATOR)
    else:
        items = tags
    return [item.strip() for item in items if item and item.strip()]


def dump_tags(tags: list[str] | None) -> str | None:
    normalized = normalize_tags(tags)
    return _TAG_SEPARATOR.join(normalized) if normalized else None


class MeetingTemplateBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=255)
    default_title: str | None = Field(default=None, max_length=120)
    default_duration_minutes: int | None = Field(default=None, gt=0)
    capacity_label: str | None = Field(default=None, max_length=50)
    record_url: str | None = Field(default=None, max_length=255)
    tags: list[str] = Field(default_factory=list)
    is_active: bool = True

    @field_validator("tags", mode="before")
    @classmethod
    def validate_tags(cls, value: list[str] | str | None):
        return normalize_tags(value)


class MeetingTemplateCreate(MeetingTemplateBase):
    pass


class MeetingTemplateUpdate(MeetingTemplateBase):
    pass


class MeetingTemplateResponse(MeetingTemplateBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime


class MeetingTemplateUseRequest(BaseModel):
    title: str | None = Field(default=None, max_length=120)
    start_time: datetime
    end_time: datetime | None = None
    record_url: str | None = Field(default=None, max_length=255)

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.end_time is not None and self.end_time <= self.start_time:
            raise ValueError("结束时间必须晚于开始时间")
        return self


class MeetingTemplateUseResponse(BaseModel):
    meeting: MeetingResponse
