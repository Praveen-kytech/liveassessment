from typing import List, Optional
from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Participant(Base, TimestampMixin):
    __tablename__ = 'participants'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    session_id: Mapped[int] = mapped_column(ForeignKey('sessions.id'))
    check_in_status: Mapped[str] = mapped_column(String(50), default='REGISTERED') # REGISTERED, CHECKED_IN, COMPLETED
    qr_code_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    user: Mapped["User"] = relationship("User")
    session: Mapped["Session"] = relationship("Session", back_populates="participants")
    answers: Mapped[List["Answer"]] = relationship("Answer", back_populates="participant")
