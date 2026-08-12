from typing import Optional
from pydantic import BaseModel, Field
from .base import BaseSchema, TimestampSchema

class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    organization_id: int
    passing_percentage: Optional[float] = Field(default=70.0, ge=0.0, le=100.0)
    question_timer_seconds: Optional[int] = Field(default=60, ge=0)
    max_attempts: Optional[int] = Field(default=1, ge=1)
    is_certificate_eligible: Optional[bool] = True

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    organization_id: Optional[int] = None

class AssessmentResponse(AssessmentBase, TimestampSchema):
    id: int
