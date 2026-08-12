from typing import Optional
from pydantic import BaseModel
from .base import BaseSchema, TimestampSchema

class ParticipantBase(BaseModel):
    user_id: int
    session_id: int
    check_in_status: Optional[str] = 'REGISTERED'
    qr_code_hash: Optional[str] = None

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase, TimestampSchema):
    id: int
