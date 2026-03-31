from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LiveStream(Base):
    __tablename__ = "live_streams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    room_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    record_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("live_streams.id"), nullable=True, default=None)

    host = relationship("User", back_populates="live_streams")
    # Self-referential relationship for main/sub venues
    sub_venues = relationship(
        "LiveStream",
        backref="parent_venue",
        foreign_keys=[parent_id],
        remote_side=[id]
    )
