from typing import Optional
from .base import BaseSchema, TimestampSchema

class OrganizationBase(BaseSchema):
    name: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseSchema):
    name: Optional[str] = None

class OrganizationResponse(OrganizationBase, TimestampSchema):
    id: int
