import os

services_dir = r"d:\poc\backend\app\services"
os.makedirs(services_dir, exist_ok=True)

base_service_code = """from typing import Generic, TypeVar, Optional, List, Type
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, repository: BaseRepository[ModelType]):
        self.repository = repository
        
    async def get(self, db: AsyncSession, id: int) -> Optional[ModelType]:
        return await self.repository.get(db, id)
        
    async def get_multi(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return await self.repository.get_multi(db, skip, limit)
        
    async def create(self, db: AsyncSession, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = obj_in.model_dump()
        return await self.repository.create(db, obj_in=obj_in_data)
        
    async def update(self, db: AsyncSession, db_obj: ModelType, obj_in: UpdateSchemaType) -> ModelType:
        obj_in_data = obj_in.model_dump(exclude_unset=True)
        return await self.repository.update(db, db_obj=db_obj, obj_in=obj_in_data)
        
    async def delete(self, db: AsyncSession, id: int) -> ModelType:
        return await self.repository.delete(db, id)
"""

user_service_code = """from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.user import user_repository
from .base import BaseService
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService(BaseService[User, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(user_repository)
        
    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        return await self.repository.get_by_email(db, email)
        
    async def create(self, db: AsyncSession, obj_in: UserCreate) -> User:
        obj_in_data = obj_in.model_dump()
        password = obj_in_data.pop("password")
        obj_in_data["hashed_password"] = pwd_context.hash(password)
        return await self.repository.create(db, obj_in=obj_in_data)
        
    async def update(self, db: AsyncSession, db_obj: User, obj_in: UserUpdate) -> User:
        obj_in_data = obj_in.model_dump(exclude_unset=True)
        if "password" in obj_in_data:
            password = obj_in_data.pop("password")
            obj_in_data["hashed_password"] = pwd_context.hash(password)
        return await self.repository.update(db, db_obj=db_obj, obj_in=obj_in_data)

user_service = UserService()
"""

organization_service_code = """from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from app.repositories.organization import organization_repository
from .base import BaseService

class OrganizationService(BaseService[Organization, OrganizationCreate, OrganizationUpdate]):
    def __init__(self):
        super().__init__(organization_repository)

organization_service = OrganizationService()
"""

assessment_service_code = """from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate
from app.repositories.assessment import assessment_repository
from .base import BaseService

class AssessmentService(BaseService[Assessment, AssessmentCreate, AssessmentUpdate]):
    def __init__(self):
        super().__init__(assessment_repository)

assessment_service = AssessmentService()
"""

question_service_code = """from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.repositories.question import question_repository
from .base import BaseService
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

class QuestionService(BaseService[Question, QuestionCreate, QuestionUpdate]):
    def __init__(self):
        super().__init__(question_repository)
        
    async def get_by_assessment(self, db: AsyncSession, assessment_id: int) -> List[Question]:
        return await self.repository.get_by_assessment(db, assessment_id)

question_service = QuestionService()
"""

session_service_code = """from app.models.session import Session
from app.schemas.session import SessionCreate, SessionUpdate
from app.repositories.session import session_repository
from .base import BaseService

class SessionService(BaseService[Session, SessionCreate, SessionUpdate]):
    def __init__(self):
        super().__init__(session_repository)

session_service = SessionService()
"""

participant_service_code = """from app.models.participant import Participant
from app.schemas.participant import ParticipantCreate
from app.repositories.participant import participant_repository
from .base import BaseService
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

class ParticipantService(BaseService[Participant, ParticipantCreate, ParticipantCreate]):
    def __init__(self):
        super().__init__(participant_repository)
        
    async def get_by_user_and_session(self, db: AsyncSession, user_id: int, session_id: int) -> Optional[Participant]:
        return await self.repository.get_by_user_and_session(db, user_id, session_id)

participant_service = ParticipantService()
"""

answer_service_code = """from app.models.answer import Answer
from app.schemas.answer import AnswerCreate, AnswerUpdate
from app.repositories.answer import answer_repository
from .base import BaseService

class AnswerService(BaseService[Answer, AnswerCreate, AnswerUpdate]):
    def __init__(self):
        super().__init__(answer_repository)

answer_service = AnswerService()
"""

result_service_code = """from app.models.result import Result
from app.schemas.result import ResultCreate, ResultCreate
from app.repositories.result import result_repository
from .base import BaseService

class ResultService(BaseService[Result, ResultCreate, ResultCreate]):
    def __init__(self):
        super().__init__(result_repository)

result_service = ResultService()
"""

init_code = """from .base import BaseService
from .user import user_service, UserService
from .organization import organization_service, OrganizationService
from .assessment import assessment_service, AssessmentService
from .question import question_service, QuestionService
from .session import session_service, SessionService
from .participant import participant_service, ParticipantService
from .answer import answer_service, AnswerService
from .result import result_service, ResultService

__all__ = [
    "BaseService",
    "user_service", "UserService",
    "organization_service", "OrganizationService",
    "assessment_service", "AssessmentService",
    "question_service", "QuestionService",
    "session_service", "SessionService",
    "participant_service", "ParticipantService",
    "answer_service", "AnswerService",
    "result_service", "ResultService"
]
"""

files = {
    "base.py": base_service_code,
    "user.py": user_service_code,
    "organization.py": organization_service_code,
    "assessment.py": assessment_service_code,
    "question.py": question_service_code,
    "session.py": session_service_code,
    "participant.py": participant_service_code,
    "answer.py": answer_service_code,
    "result.py": result_service_code,
    "__init__.py": init_code,
}

for name, content in files.items():
    with open(os.path.join(services_dir, name), "w") as f:
        f.write(content)
