from app.models.answer import Answer
from .base import BaseRepository

class AnswerRepository(BaseRepository[Answer]):
    def __init__(self):
        super().__init__(Answer)

answer_repository = AnswerRepository()
