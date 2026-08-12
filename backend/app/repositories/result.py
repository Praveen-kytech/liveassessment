from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.result import Result
from .base import BaseRepository
from typing import Optional

class ResultRepository(BaseRepository[Result]):
    def __init__(self):
        super().__init__(Result)
        
    async def get_by_participant(self, db: AsyncSession, participant_id: int) -> Optional[Result]:
        result = await db.execute(select(Result).filter(Result.participant_id == participant_id))
        return result.scalars().first()

result_repository = ResultRepository()
