import os

models_dir = r"d:\poc\backend\app\models"

base_code = """from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
"""

user_code = """from typing import List, Optional
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role_id: Mapped[Optional[int]] = mapped_column(ForeignKey('roles.id'))
    organization_id: Mapped[Optional[int]] = mapped_column(ForeignKey('organizations.id'))
    
    role: Mapped[Optional["Role"]] = relationship("Role", back_populates="users")
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="users")
"""

role_code = """from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Role(Base, TimestampMixin):
    __tablename__ = 'roles'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    
    users: Mapped[List["User"]] = relationship("User", back_populates="role")
"""

organization_code = """from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Organization(Base, TimestampMixin):
    __tablename__ = 'organizations'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    
    users: Mapped[List["User"]] = relationship("User", back_populates="organization")
    assessments: Mapped[List["Assessment"]] = relationship("Assessment", back_populates="organization")
"""

assessment_code = """from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Assessment(Base, TimestampMixin):
    __tablename__ = 'assessments'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, nullable=True)
    organization_id: Mapped[int] = mapped_column(ForeignKey('organizations.id'))
    
    organization: Mapped["Organization"] = relationship("Organization", back_populates="assessments")
    questions: Mapped[List["Question"]] = relationship("Question", back_populates="assessment")
    sessions: Mapped[List["Session"]] = relationship("Session", back_populates="assessment")
"""

question_code = """from typing import List, Optional
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
"""

session_code = """from typing import List, Optional
from sqlalchemy import String, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .base import Base, TimestampMixin

class Session(Base, TimestampMixin):
    __tablename__ = 'sessions'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey('assessments.id'))
    start_time: Mapped[datetime] = mapped_column(DateTime)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default='SCHEDULED')
    is_live: Mapped[bool] = mapped_column(Boolean, default=False)
    
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="sessions")
    participants: Mapped[List["Participant"]] = relationship("Participant", back_populates="session")
    results: Mapped[List["Result"]] = relationship("Result", back_populates="session")
"""

participant_code = """from typing import List, Optional
from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Participant(Base, TimestampMixin):
    __tablename__ = 'participants'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    session_id: Mapped[int] = mapped_column(ForeignKey('sessions.id'))
    
    user: Mapped["User"] = relationship("User")
    session: Mapped["Session"] = relationship("Session", back_populates="participants")
    answers: Mapped[List["Answer"]] = relationship("Answer", back_populates="participant")
"""

answer_code = """from typing import Optional
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
"""

result_code = """from typing import Optional
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
"""

attendance_code = """from sqlalchemy import ForeignKey, DateTime
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
"""

certificate_code = """from sqlalchemy import String, ForeignKey
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
"""

zoom_code = """from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class Zoom(Base, TimestampMixin):
    __tablename__ = 'zoom_meetings'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey('sessions.id'))
    meeting_id: Mapped[str] = mapped_column(String(100))
    join_url: Mapped[str] = mapped_column(String(255))
    
    session: Mapped["Session"] = relationship("Session")
"""

audit_log_code = """from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base, TimestampMixin

class AuditLog(Base, TimestampMixin):
    __tablename__ = 'audit_logs'
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=True)
    action: Mapped[str] = mapped_column(String(100))
    details: Mapped[str] = mapped_column(Text)
    
    user: Mapped["User"] = relationship("User")
"""

init_code = """from .base import Base, TimestampMixin
from .user import User
from .role import Role
from .organization import Organization
from .assessment import Assessment
from .question import Question
from .session import Session
from .participant import Participant
from .answer import Answer
from .result import Result
from .attendance import Attendance
from .certificate import Certificate
from .zoom import Zoom
from .audit_log import AuditLog

__all__ = [
    "Base", "TimestampMixin",
    "User", "Role", "Organization", "Assessment",
    "Question", "Session", "Participant", "Answer",
    "Result", "Attendance", "Certificate", "Zoom", "AuditLog"
]
"""

files = {
    "base.py": base_code,
    "user.py": user_code,
    "role.py": role_code,
    "organization.py": organization_code,
    "assessment.py": assessment_code,
    "question.py": question_code,
    "session.py": session_code,
    "participant.py": participant_code,
    "answer.py": answer_code,
    "result.py": result_code,
    "attendance.py": attendance_code,
    "certificate.py": certificate_code,
    "zoom.py": zoom_code,
    "audit_log.py": audit_log_code,
    "__init__.py": init_code,
}

for name, content in files.items():
    with open(os.path.join(models_dir, name), "w") as f:
        f.write(content)
