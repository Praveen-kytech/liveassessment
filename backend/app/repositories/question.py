from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.question import Question
from .base import BaseRepository
from typing import List

class QuestionRepository(BaseRepository[Question]):
    def __init__(self):
        super().__init__(Question)
        
    async def get_by_assessment(self, db: AsyncSession, assessment_id: int) -> List[Question]:
        result = await db.execute(select(Question).filter(Question.assessment_id == assessment_id).order_by(Question.order))
        return list(result.scalars().all())

question_repository = QuestionRepository()
