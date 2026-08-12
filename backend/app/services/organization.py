from app.models.organization import Organization
from app.schemas.organization import OrganizationCreate, OrganizationUpdate
from app.repositories.organization import organization_repository
from .base import BaseService

class OrganizationService(BaseService[Organization, OrganizationCreate, OrganizationUpdate]):
    def __init__(self):
        super().__init__(organization_repository)

organization_service = OrganizationService()
