from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Organization(Base, TimestampMixin):
    __tablename__ = 'organizations'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    
    users: Mapped[List["User"]] = relationship("User", back_populates="organization")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="organization")
