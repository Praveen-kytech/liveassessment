from app.models.result import Result
from app.schemas.result import ResultCreate, ResultCreate
from app.repositories.result import result_repository
from .base import BaseService

class ResultService(BaseService[Result, ResultCreate, ResultCreate]):
    def __init__(self):
        super().__init__(result_repository)

result_service = ResultService()
