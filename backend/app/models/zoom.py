from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Zoom(Base, TimestampMixin):
    __tablename__ = 'zoom_meetings'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey('sessions.id'))
    meeting_id: Mapped[str] = mapped_column(String(100))
    join_url: Mapped[str] = mapped_column(String(255))
    
    session: Mapped["Session"] = relationship("Session")
