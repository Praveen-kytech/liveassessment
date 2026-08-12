from app.models.organization import Organization
from .base import BaseRepository

class OrganizationRepository(BaseRepository[Organization]):
    def __init__(self):
        super().__init__(Organization)

organization_repository = OrganizationRepository()
