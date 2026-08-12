from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CertificateBase(BaseModel):
    result_id: int
    certificate_number: str
    verification_url: str

class CertificateCreate(CertificateBase):
    pass

class CertificateResponse(CertificateBase):
    id: int
    issued_at: datetime

    class Config:
        from_attributes = True
