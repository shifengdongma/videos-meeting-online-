from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import VoteStatus


class VoteOptionCreate(BaseModel):
    content: str = Field(min_length=1, max_length=120)


class VoteCreate(BaseModel):
    meeting_id: int
    topic: str = Field(min_length=1, max_length=255)
    options: list[VoteOptionCreate] = Field(min_length=2)


class VoteSubmit(BaseModel):
    option_id: int


class VoteResultOptionResponse(BaseModel):
    id: int
    content: str
    count: int
    ratio: float


class VoteOptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str


class VoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    meeting_id: int
    topic: str
    created_at: datetime
    status: VoteStatus
    options: list[VoteOptionResponse]
    submitted: bool = False
    results: list[VoteResultOptionResponse] = []
