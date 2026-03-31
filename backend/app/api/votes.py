from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.models.enums import RoleEnum, VoteStatus
from app.models.meeting import Meeting
from app.models.user import User
from app.models.vote import Vote, VoteOption, VoteRecord
from app.schemas.vote import VoteCreate, VoteResponse, VoteSubmit
from app.services.deps import get_current_user, require_roles
from app.services.ws_manager import manager

router = APIRouter(prefix="/votes", tags=["votes"])


def build_vote_result(vote: Vote) -> dict:
    counts = defaultdict(int)
    total = len(vote.records)
    for record in vote.records:
        counts[record.option_id] += 1

    options = []
    for option in vote.options:
        count = counts[option.id]
        ratio = count / total if total else 0
        options.append({"id": option.id, "content": option.content, "count": count, "ratio": ratio})

    return {
        "type": "vote-result",
        "voteId": vote.id,
        "topic": vote.topic,
        "total": total,
        "options": options,
    }


def build_vote_response(vote: Vote, user_id: int | None = None) -> dict:
    result = build_vote_result(vote)
    submitted = any(record.user_id == user_id for record in vote.records) if user_id is not None else False
    return {
        "id": vote.id,
        "meeting_id": vote.meeting_id,
        "topic": vote.topic,
        "created_at": vote.created_at.isoformat() if vote.created_at else None,
        "status": vote.status.value if vote.status else "voting",
        "options": [{"id": option.id, "content": option.content} for option in vote.options],
        "submitted": submitted,
        "results": result["options"],
    }


@router.get("/meeting/{meeting_id}", response_model=list[VoteResponse])
def list_votes(
    meeting_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    votes = (
        db.query(Vote)
        .options(joinedload(Vote.options), joinedload(Vote.records))
        .filter(Vote.meeting_id == meeting_id)
        .order_by(Vote.id.desc())
        .all()
    )
    return [build_vote_response(vote, current_user.id) for vote in votes]


@router.post("", response_model=VoteResponse, status_code=status.HTTP_201_CREATED)
async def create_vote(
    payload: VoteCreate,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == payload.meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="会议不存在")

    vote = Vote(meeting_id=payload.meeting_id, topic=payload.topic)
    db.add(vote)
    db.flush()

    for item in payload.options:
        db.add(VoteOption(vote_id=vote.id, content=item.content))

    db.commit()
    db.refresh(vote)
    vote = db.query(Vote).options(joinedload(Vote.options), joinedload(Vote.records)).filter(Vote.id == vote.id).first()
    await manager.broadcast_meeting(payload.meeting_id, {
        "type": "vote-started",
        "vote": build_vote_response(vote, current_user.id),
    })
    return build_vote_response(vote, current_user.id)


@router.post("/{vote_id}/submit")
async def submit_vote(
    vote_id: int,
    payload: VoteSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    vote = (
        db.query(Vote)
        .options(joinedload(Vote.options), joinedload(Vote.records))
        .filter(Vote.id == vote_id)
        .first()
    )
    if not vote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="投票不存在")

    option = db.query(VoteOption).filter(VoteOption.id == payload.option_id, VoteOption.vote_id == vote_id).first()
    if not option:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="选项不存在")

    exists = db.query(VoteRecord).filter(VoteRecord.vote_id == vote_id, VoteRecord.user_id == current_user.id).first()
    if not exists:
        record = VoteRecord(vote_id=vote_id, user_id=current_user.id, option_id=payload.option_id)
        db.add(record)
        db.commit()

    vote = (
        db.query(Vote)
        .options(joinedload(Vote.options), joinedload(Vote.records))
        .filter(Vote.id == vote_id)
        .first()
    )
    result = build_vote_result(vote)
    await manager.broadcast_meeting(vote.meeting_id, result)
    return result


@router.put("/{vote_id}/end")
async def end_vote(
    vote_id: int,
    current_user: User = Depends(require_roles(RoleEnum.admin, RoleEnum.host)),
    db: Session = Depends(get_db),
):
    vote = (
        db.query(Vote)
        .options(joinedload(Vote.options), joinedload(Vote.records))
        .filter(Vote.id == vote_id)
        .first()
    )
    if not vote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="投票不存在")

    if vote.status == VoteStatus.ended:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="表决已结束")

    vote.status = VoteStatus.ended
    db.commit()
    db.refresh(vote)

    result = build_vote_result(vote)
    await manager.broadcast_meeting(vote.meeting_id, {
        "type": "vote-ended",
        "voteId": vote.id,
        "status": "ended",
        "results": result["options"],
    })
    return build_vote_response(vote, current_user.id)
