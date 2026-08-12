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
    passing_percentage: Mapped[float] = mapped_column(default=70.0)
    question_timer_seconds: Mapped[int] = mapped_column(default=60)
    max_attempts: Mapped[int] = mapped_column(default=1)
    is_certificate_eligible: Mapped[bool] = mapped_column(default=True)
    
    organization: Mapped["Organization"] = relationship("Organization", back_populates="assessments")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="assessment")
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="assessment")
