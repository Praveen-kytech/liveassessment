from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Question(Base, TimestampMixin):
    __tablename__ = 'questions'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    text: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(50)) # e.g. MULTIPLE_CHOICE, TEXT
    assessment_id: Mapped[int] = mapped_column(ForeignKey('assessments.id'))
    correct_answer: Mapped[str] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, default=0)
    
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="questions")
    answers: Mapped[List["Answer"]] = relationship("Answer", back_populates="question")
