from typing import Optional
from sqlalchemy import Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Result(Base, TimestampMixin):
    __tablename__ = 'results'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey('sessions.id'))
    participant_id: Mapped[int] = mapped_column(ForeignKey('participants.id'))
    score: Mapped[float] = mapped_column(Float)
    
    session: Mapped["Session"] = relationship("Session", back_populates="results")
    participant: Mapped["Participant"] = relationship("Participant")
