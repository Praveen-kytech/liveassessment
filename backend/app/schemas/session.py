from typing import Optional
from datetime import datetime
from .base import BaseSchema, TimestampSchema

class SessionBase(BaseSchema):
    assessment_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str = 'SCHEDULED'
    is_live: bool = False

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseSchema):
    assessment_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    is_live: Optional[bool] = None

class SessionResponse(SessionBase, TimestampSchema):
    id: int
