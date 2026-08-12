from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.repositories.question import question_repository
from .base import BaseService
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

class QuestionService(BaseService[Question, QuestionCreate, QuestionUpdate]):
    def __init__(self):
        super().__init__(question_repository)
        
    async def get_by_assessment(self, db: AsyncSession, assessment_id: int) -> List[Question]:
        return await self.repository.get_by_assessment(db, assessment_id)

question_service = QuestionService()
