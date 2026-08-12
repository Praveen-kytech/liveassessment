from typing import Optional
from .base import BaseSchema, TimestampSchema

class ParticipantBase(BaseSchema):
    user_id: int
    session_id: int

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase, TimestampSchema):
    id: int
