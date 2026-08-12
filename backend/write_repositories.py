import os

repositories_dir = r"d:\poc\backend\app\repositories"
os.makedirs(repositories_dir, exist_ok=True)

base_repo_code = """from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    async def get(self, db: AsyncSession, id: int) -> Optional[ModelType]:
        result = await db.execute(select(self.model).filter(self.model.id == id))
        return result.scalars().first()
    
    async def get_multi(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return list(result.scalars().all())
    
    async def create(self, db: AsyncSession, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def update(self, db: AsyncSession, db_obj: ModelType, obj_in: dict) -> ModelType:
        for field in obj_in:
            if hasattr(db_obj, field):
                setattr(db_obj, field, obj_in[field])
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def delete(self, db: AsyncSession, id: int) -> ModelType:
        obj = await self.get(db=db, id=id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj
"""

user_repo_code = """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from .base import BaseRepository
from typing import Optional

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)
        
    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).filter(User.email == email))
        return result.scalars().first()

user_repository = UserRepository()
"""

role_repo_code = """from app.models.role import Role
from .base import BaseRepository

class RoleRepository(BaseRepository[Role]):
    def __init__(self):
        super().__init__(Role)

role_repository = RoleRepository()
"""

organization_repo_code = """from app.models.organization import Organization
from .base import BaseRepository

class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self):
        super().__init__(Organization)

organization_repository = OrganizationRepository()
"""

assessment_repo_code = """from app.models.assessment import Assessment
from .base import BaseRepository

class AssessmentRepository(BaseRepository[Assessment]):
    def __init__(self):
        super().__init__(Assessment)

assessment_repository = AssessmentRepository()
"""

question_repo_code = """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.question import Question
from .base import BaseRepository
from typing import List

class QuestionRepository(BaseRepository[Question]):
    def __init__(self):
        super().__init__(Question)
        
    async def get_by_assessment(self, db: AsyncSession, assessment_id: int) -> List[Question]:
        result = await db.execute(select(Question).filter(Question.assessment_id == assessment_id).order_by(Question.order))
        return list(result.scalars().all())

question_repository = QuestionRepository()
"""

session_repo_code = """from app.models.session import Session
from .base import BaseRepository

class SessionRepository(BaseRepository[Session]):
    def __init__(self):
        super().__init__(Session)

session_repository = SessionRepository()
"""

participant_repo_code = """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.participant import Participant
from .base import BaseRepository
from typing import Optional

class ParticipantRepository(BaseRepository[Participant]):
    def __init__(self):
        super().__init__(Participant)
        
    async def get_by_user_and_session(self, db: AsyncSession, user_id: int, session_id: int) -> Optional[Participant]:
        result = await db.execute(select(Participant).filter(Participant.user_id == user_id, Participant.session_id == session_id))
        return result.scalars().first()

participant_repository = ParticipantRepository()
"""

answer_repo_code = """from app.models.answer import Answer
from .base import BaseRepository

class AnswerRepository(BaseRepository[Answer]):
    def __init__(self):
        super().__init__(Answer)

answer_repository = AnswerRepository()
"""

result_repo_code = """from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.result import Result
from .base import BaseRepository
from typing import Optional

class ResultRepository(BaseRepository[Result]):
    def __init__(self):
        super().__init__(Result)
        
    async def get_by_participant(self, db: AsyncSession, participant_id: int) -> Optional[Result]:
        result = await db.execute(select(Result).filter(Result.participant_id == participant_id))
        return result.scalars().first()

result_repository = ResultRepository()
"""

init_code = """from .base import BaseRepository
from .user import user_repository, UserRepository
from .role import role_repository, RoleRepository
from .organization import organization_repository, OrganizationRepository
from .assessment import assessment_repository, AssessmentRepository
from .question import question_repository, QuestionRepository
from .session import session_repository, SessionRepository
from .participant import participant_repository, ParticipantRepository
from .answer import answer_repository, AnswerRepository
from .result import result_repository, ResultRepository

__all__ = [
    "BaseRepository",
    "user_repository", "UserRepository",
    "role_repository", "RoleRepository",
    "organization_repository", "OrganizationRepository",
    "assessment_repository", "AssessmentRepository",
    "question_repository", "QuestionRepository",
    "session_repository", "SessionRepository",
    "participant_repository", "ParticipantRepository",
    "answer_repository", "AnswerRepository",
    "result_repository", "ResultRepository"
]
"""

files = {
    "base.py": base_repo_code,
    "user.py": user_repo_code,
    "role.py": role_repo_code,
    "organization.py": organization_repo_code,
    "assessment.py": assessment_repo_code,
    "question.py": question_repo_code,
    "session.py": session_repo_code,
    "participant.py": participant_repo_code,
    "answer.py": answer_repo_code,
    "result.py": result_repo_code,
    "__init__.py": init_code,
}

for name, content in files.items():
    with open(os.path.join(repositories_dir, name), "w") as f:
        f.write(content)
