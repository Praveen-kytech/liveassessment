from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CertificateBase(BaseModel):
    participant_id: int
    result_id: int
    certificate_url: str

class CertificateCreate(CertificateBase):
    pass

class CertificateResponse(CertificateBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
