from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Certificate(Base, TimestampMixin):
    __tablename__ = 'certificates'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    participant_id: Mapped[int] = mapped_column(ForeignKey('participants.id'))
    result_id: Mapped[int] = mapped_column(ForeignKey('results.id'))
    certificate_url: Mapped[str] = mapped_column(String(255))
    
    participant: Mapped["Participant"] = relationship("Participant")
    result: Mapped["Result"] = relationship("Result")
