from app.models.assessment import Assessment
from .base import BaseRepository

class AssessmentRepository(BaseRepository[Assessment]):
    def __init__(self):
        super().__init__(Assessment)

assessment_repository = AssessmentRepository()
