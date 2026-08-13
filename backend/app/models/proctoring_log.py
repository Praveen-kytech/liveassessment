from sqlalchemy import String, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class ProctoringLog(Base, TimestampMixin):
    __tablename__ = 'proctoring_logs'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey('sessions.id'))
    participant_id: Mapped[int] = mapped_column(ForeignKey('participants.id'))
    event_type: Mapped[str] = mapped_column(String(100)) # e.g. TAB_SWITCH, BLUR, FULLSCREEN_EXIT
    description: Mapped[str] = mapped_column(Text)
    
    session: Mapped["Session"] = relationship("Session")
    participant: Mapped["Participant"] = relationship("Participant")
