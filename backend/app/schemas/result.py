from typing import Optional
from .base import BaseSchema, TimestampSchema

class ResultBase(BaseSchema):
    session_id: int
    participant_id: int
    score: float

class ResultCreate(ResultBase):
    pass

class ResultResponse(ResultBase, TimestampSchema):
    id: int
