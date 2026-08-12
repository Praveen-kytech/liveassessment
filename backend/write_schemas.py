import os

schemas_dir = r"d:\poc\backend\app\schemas"
os.makedirs(schemas_dir, exist_ok=True)

base_schemas_code = """from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

class TimestampSchema(BaseSchema):
    created_at: datetime
    updated_at: datetime
"""

user_schemas_code = """from typing import Optional, List
from .base import BaseSchema, TimestampSchema

class UserBase(BaseSchema):
    email: str
    first_name: str
    last_name: str
    is_active: bool = True
    role_id: Optional[int] = None
    organization_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseSchema):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None
    organization_id: Optional[int] = None
    password: Optional[str] = None

class UserResponse(UserBase, TimestampSchema):
    id: int
"""

role_schemas_code = """from typing import Optional
from .base import BaseSchema, TimestampSchema

class RoleBase(BaseSchema):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None

class RoleResponse(RoleBase, TimestampSchema):
    id: int
"""

organization_schemas_code = """from typing import Optional
from .base import BaseSchema, TimestampSchema

class OrganizationBase(BaseSchema):
    name: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationUpdate(BaseSchema):
    name: Optional[str] = None

class OrganizationResponse(OrganizationBase, TimestampSchema):
    id: int
"""

assessment_schemas_code = """from typing import Optional
from .base import BaseSchema, TimestampSchema

class AssessmentBase(BaseSchema):
    title: str
    description: Optional[str] = None
    organization_id: int

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    organization_id: Optional[int] = None

class AssessmentResponse(AssessmentBase, TimestampSchema):
    id: int
"""

question_schemas_code = """from typing import Optional
from .base import BaseSchema, TimestampSchema

class QuestionBase(BaseSchema):
    text: str
    type: str
    assessment_id: int
    correct_answer: Optional[str] = None
    order: int = 0

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseSchema):
    text: Optional[str] = None
    type: Optional[str] = None
    assessment_id: Optional[int] = None
    correct_answer: Optional[str] = None
    order: Optional[int] = None

class QuestionResponse(QuestionBase, TimestampSchema):
    id: int
"""

session_schemas_code = """from typing import Optional
from datetime import datetime
from .base import BaseSchema, TimestampSchema

class SessionBase(BaseSchema):
    assessment_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str = 'SCHEDULED'
    is_live: bool = False

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseSchema):
    assessment_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    is_live: Optional[bool] = None

class SessionResponse(SessionBase, TimestampSchema):
    id: int
"""

participant_schemas_code = """from typing import Optional
from .base import BaseSchema, TimestampSchema

class ParticipantBase(BaseSchema):
    user_id: int
    session_id: int

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase, TimestampSchema):
    id: int
"""

answer_schemas_code = """from typing import Optional
from .base import BaseSchema, TimestampSchema

class AnswerBase(BaseSchema):
    participant_id: int
    question_id: int
    submitted_answer: str
    is_correct: Optional[bool] = None

class AnswerCreate(AnswerBase):
    pass

class AnswerUpdate(BaseSchema):
    submitted_answer: Optional[str] = None
    is_correct: Optional[bool] = None

class AnswerResponse(AnswerBase, TimestampSchema):
    id: int
"""

result_schemas_code = """from typing import Optional
from .base import BaseSchema, TimestampSchema

class ResultBase(BaseSchema):
    session_id: int
    participant_id: int
    score: float

class ResultCreate(ResultBase):
    pass

class ResultResponse(ResultBase, TimestampSchema):
    id: int
"""

init_code = """from .base import BaseSchema, TimestampSchema
from .user import UserBase, UserCreate, UserUpdate, UserResponse
from .role import RoleBase, RoleCreate, RoleUpdate, RoleResponse
from .organization import OrganizationBase, OrganizationCreate, OrganizationUpdate, OrganizationResponse
from .assessment import AssessmentBase, AssessmentCreate, AssessmentUpdate, AssessmentResponse
from .question import QuestionBase, QuestionCreate, QuestionUpdate, QuestionResponse
from .session import SessionBase, SessionCreate, SessionUpdate, SessionResponse
from .participant import ParticipantBase, ParticipantCreate, ParticipantResponse
from .answer import AnswerBase, AnswerCreate, AnswerUpdate, AnswerResponse
from .result import ResultBase, ResultCreate, ResultResponse

__all__ = [
    "BaseSchema", "TimestampSchema",
    "UserBase", "UserCreate", "UserUpdate", "UserResponse",
    "RoleBase", "RoleCreate", "RoleUpdate", "RoleResponse",
    "OrganizationBase", "OrganizationCreate", "OrganizationUpdate", "OrganizationResponse",
    "AssessmentBase", "AssessmentCreate", "AssessmentUpdate", "AssessmentResponse",
    "QuestionBase", "QuestionCreate", "QuestionUpdate", "QuestionResponse",
    "SessionBase", "SessionCreate", "SessionUpdate", "SessionResponse",
    "ParticipantBase", "ParticipantCreate", "ParticipantResponse",
    "AnswerBase", "AnswerCreate", "AnswerUpdate", "AnswerResponse",
    "ResultBase", "ResultCreate", "ResultResponse"
]
"""

files = {
    "base.py": base_schemas_code,
    "user.py": user_schemas_code,
    "role.py": role_schemas_code,
    "organization.py": organization_schemas_code,
    "assessment.py": assessment_schemas_code,
    "question.py": question_schemas_code,
    "session.py": session_schemas_code,
    "participant.py": participant_schemas_code,
    "answer.py": answer_schemas_code,
    "result.py": result_schemas_code,
    "__init__.py": init_code,
}

for name, content in files.items():
    with open(os.path.join(schemas_dir, name), "w") as f:
        f.write(content)
