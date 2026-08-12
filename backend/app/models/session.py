from typing import List, Optional
from sqlalchemy import String, DateTime, ForeignKey, Integer, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .base import Base, TimestampMixin

class Session(Base, TimestampMixin):
    __tablename__ = 'sessions'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey('assessments.id'))
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default='SCHEDULED')
    is_live: Mapped[bool] = mapped_column(Boolean, default=False)
    delivery_mode: Mapped[str] = mapped_column(String(50), default='ONLINE') # IN_PERSON, ONLINE, HYBRID
    meeting_provider: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # ZOOM, MEET, TEAMS, CUSTOM
    meeting_link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    host_meeting_link: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="sessions")
    participants: Mapped[List["Participant"]] = relationship("Participant", back_populates="session")
    results: Mapped[List["Result"]] = relationship("Result", back_populates="session")
