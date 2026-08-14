from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from .base import BaseSchema, TimestampSchema

class SessionBase(BaseModel):
    assessment_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: Optional[str] = 'SCHEDULED'
    is_live: Optional[bool] = False
    delivery_mode: Optional[str] = 'ONLINE'
    meeting_provider: Optional[str] = None
    meeting_link: Optional[str] = None
    host_meeting_link: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseSchema):
    assessment_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    is_live: Optional[bool] = None

from typing import Optional

class AssessmentBasic(BaseSchema):
    id: int
    title: str
    organization_id: int

class SessionResponse(SessionBase, TimestampSchema):
    id: int
    assessment: Optional[AssessmentBasic] = None
