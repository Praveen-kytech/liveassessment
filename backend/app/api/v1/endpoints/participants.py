from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api.deps import get_db
from app.models.participant import Participant
from app.schemas.participant import ParticipantCreate, ParticipantResponse
from app.core.security import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[ParticipantResponse])
async def read_participants(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user)
):
    result = await db.execute(select(Participant).offset(skip).limit(limit))
    return result.scalars().all()

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
    result = await db.execute(select(Participant).where(Participant.id == participant_id))
    participant = result.scalars().first()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return participant
