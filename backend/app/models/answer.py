from typing import Optional
from sqlalchemy import String, Text, ForeignKey, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Answer(Base, TimestampMixin):
    __tablename__ = 'answers'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    participant_id: Mapped[int] = mapped_column(ForeignKey('participants.id'))
    question_id: Mapped[int] = mapped_column(ForeignKey('questions.id'))
    submitted_answer: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    
    participant: Mapped["Participant"] = relationship("Participant", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", back_populates="answers")
