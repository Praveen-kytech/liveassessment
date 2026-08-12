from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Role(Base, TimestampMixin):
    __tablename__ = 'roles'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    
    users: Mapped[List["User"]] = relationship("User", back_populates="role")
