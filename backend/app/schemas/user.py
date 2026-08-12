from typing import Optional, List
from .base import BaseSchema, TimestampSchema

class UserBase(BaseSchema):
    email: str
    first_name: str
    last_name: str
    is_active: bool = True
    role_id: Optional[int] = None
    organization_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseSchema):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None
    organization_id: Optional[int] = None
    password: Optional[str] = None

class UserResponse(UserBase, TimestampSchema):
    id: int
