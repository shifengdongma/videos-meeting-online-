from datetime import datetime

from pydantic import BaseModel, ConfigDict


class LiveStreamCreate(BaseModel):
    title: str
    record_url: str | None = None
    parent_id: int | None = None


class LiveStreamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    host_id: int
    start_time: datetime
    room_code: str
    record_url: str | None = None
    parent_id: int | None = None
