from typing import Optional
from .base import BaseSchema, TimestampSchema

class AssessmentBase(BaseSchema):
    title: str
    description: Optional[str] = None
    organization_id: int

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    organization_id: Optional[int] = None

class AssessmentResponse(AssessmentBase, TimestampSchema):
    id: int
