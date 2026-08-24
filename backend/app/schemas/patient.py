from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PatientCreateRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    phone: str = Field(min_length=7, max_length=20)


class PatientUpdateRequest(BaseModel):
    first_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    date_of_birth: date | None = None
    phone: str | None = Field(
        default=None,
        min_length=7,
        max_length=20,
    )


class PatientResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    date_of_birth: date
    phone: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AdminPatientUpdateRequest(BaseModel):

    first_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    date_of_birth: date | None = None

    phone: str | None = Field(
        default=None,
        min_length=7,
        max_length=20,
    )

class AdminPatientResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    date_of_birth: date
    phone: str
    created_at: datetime
    updated_at: datetime
    is_active: bool