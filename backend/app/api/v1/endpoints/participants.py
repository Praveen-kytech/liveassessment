from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api.deps import get_db
from app.models.participant import Participant
from app.models.session import Session
from app.models.assessment import Assessment
from app.models.user import User
from app.schemas.participant import ParticipantCreate, ParticipantResponse, ParticipantDetail
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[ParticipantDetail])
async def read_participants(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Participant, User, Assessment)
        .join(Session, Participant.session_id == Session.id)
        .join(Assessment, Session.assessment_id == Assessment.id)
        .join(User, Participant.user_id == User.id)
        .where(Assessment.organization_id == current_user.get("organization_id"))
        .where(User.role_id == 2)
        .offset(skip).limit(limit)
    )
    
    participants = []
    for p, u, a in result.all():
        p_dict = {
            "id": p.id,
            "user_id": p.user_id,
            "session_id": p.session_id,
            "check_in_status": p.check_in_status,
            "qr_code_hash": p.qr_code_hash,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "name": f"{u.first_name} {u.last_name}".strip() or "Unknown User",
            "email": u.email,
            "session": a.title
        }
        participants.append(p_dict)
    
    return participants

@router.post("/", response_model=ParticipantResponse)
async def create_participant(
    participant_in: ParticipantCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    participant = Participant(**participant_in.model_dump())
    db.add(participant)
    await db.commit()
    await db.refresh(participant)
    return participant

@router.get("/{participant_id}", response_model=ParticipantResponse)
async def read_participant(
    participant_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Participant)
        .join(Session, Participant.session_id == Session.id)
        .join(Assessment, Session.assessment_id == Assessment.id)
        .where(Participant.id == participant_id)
        .where(Assessment.organization_id == current_user.get("organization_id"))
    )
    participant = result.scalars().first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant
