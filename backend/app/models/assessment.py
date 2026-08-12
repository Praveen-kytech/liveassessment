from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Assessment(Base, TimestampMixin):
    __tablename__ = 'assessments'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, nullable=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey('organizations.id'))
    
    organization: Mapped["Organization"] = relationship("Organization", back_populates="assessments")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="assessment")
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="assessment")
