from typing import List, Optional
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role_id: Mapped[Optional[int]] = mapped_column(ForeignKey('roles.id'))
    organization_id: Mapped[Optional[int]] = mapped_column(ForeignKey('organizations.id'))
    
    role: Mapped[Optional["Role"]] = relationship("Role", back_populates="users")
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="users")
