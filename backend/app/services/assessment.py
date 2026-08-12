from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate
from app.repositories.assessment import assessment_repository
from .base import BaseService

class AssessmentService(BaseService[Assessment, AssessmentCreate, AssessmentUpdate]):
    def __init__(self):
        super().__init__(assessment_repository)

assessment_service = AssessmentService()
