from sqlalchemy import String, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class SessionEvent(Base, TimestampMixin):
    __tablename__ = 'session_events'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey('sessions.id'))
    event_type: Mapped[str] = mapped_column(String(100)) # e.g. QUESTION_RELEASED, SESSION_STARTED
    reference_id: Mapped[int] = mapped_column(Integer, nullable=True) # e.g. Question ID
    metadata_json: Mapped[str] = mapped_column(Text, nullable=True)
    
    session: Mapped["Session"] = relationship("Session")
