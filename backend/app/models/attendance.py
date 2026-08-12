from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .base import Base, TimestampMixin

class Attendance(Base, TimestampMixin):
    __tablename__ = 'attendance'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    participant_id: Mapped[int] = mapped_column(ForeignKey('participants.id'))
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    left_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    participant: Mapped["Participant"] = relationship("Participant")
