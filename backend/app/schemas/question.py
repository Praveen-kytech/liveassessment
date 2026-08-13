from typing import Optional
from .base import BaseSchema, TimestampSchema

class QuestionBase(BaseSchema):
    text: str
    type: str
    assessment_id: int
    correct_answer: Optional[str] = None
    options: Optional[list] = None
    order: int = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseSchema):
    text: Optional[str] = None
    type: Optional[str] = None
    assessment_id: Optional[int] = None
    correct_answer: Optional[str] = None
    order: Optional[int] = None

class QuestionResponse(QuestionBase, TimestampSchema):
    id: int
