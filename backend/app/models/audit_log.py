from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class AuditLog(Base, TimestampMixin):
    __tablename__ = 'audit_logs'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=True)
    action: Mapped[str] = mapped_column(String(100))
    details: Mapped[str] = mapped_column(Text)
    
    user: Mapped["User"] = relationship("User")
