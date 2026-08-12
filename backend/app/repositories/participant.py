from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.participant import Participant
from .base import BaseRepository
from typing import Optional

class ParticipantRepository(BaseRepository[Participant]):
    def __init__(self):
        super().__init__(Participant)
        
    async def get_by_user_and_session(self, db: AsyncSession, user_id: int, session_id: int) -> Optional[Participant]:
        result = await db.execute(select(Participant).filter(Participant.user_id == user_id, Participant.session_id == session_id))
        return result.scalars().first()

participant_repository = ParticipantRepository()
