from typing import Optional
from .base import BaseSchema, TimestampSchema

class AnswerBase(BaseSchema):
    participant_id: int
    question_id: int
    submitted_answer: str
    is_correct: Optional[bool] = None

class AnswerCreate(AnswerBase):
    pass

class AnswerUpdate(BaseSchema):
    submitted_answer: Optional[str] = None
    is_correct: Optional[bool] = None

class AnswerResponse(AnswerBase, TimestampSchema):
    id: int
