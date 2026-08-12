from app.models.participant import Participant
from app.schemas.participant import ParticipantCreate
from app.repositories.participant import participant_repository
from .base import BaseService
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

class ParticipantService(BaseService[Participant, ParticipantCreate, ParticipantCreate]):
    def __init__(self):
        super().__init__(participant_repository)
        
    async def get_by_user_and_session(self, db: AsyncSession, user_id: int, session_id: int) -> Optional[Participant]:
        return await self.repository.get_by_user_and_session(db, user_id, session_id)

participant_service = ParticipantService()
