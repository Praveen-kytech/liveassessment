from app.models.answer import Answer
from app.schemas.answer import AnswerCreate, AnswerUpdate
from app.repositories.answer import answer_repository
from .base import BaseService

class AnswerService(BaseService[Answer, AnswerCreate, AnswerUpdate]):
    def __init__(self):
        super().__init__(answer_repository)

answer_service = AnswerService()
