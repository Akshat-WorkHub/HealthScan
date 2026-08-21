from datetime import datetime

from pydantic import BaseModel, Field


class DoctorCreateRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    specialization: str = Field(min_length=1, max_length=150)
    qualification: str = Field(min_length=1, max_length=255)
    experience_years: int = Field(ge=0)
    slot_duration_minutes: int = Field(gt=0)


class DoctorUpdateRequest(BaseModel):
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
    specialization: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    qualification: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    experience_years: int | None = Field(
        default=None,
        ge=0,
    )
    slot_duration_minutes: int | None = Field(
        default=None,
        gt=0,
    )


class DoctorResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    specialization: str
    qualification: str
    experience_years: int
    slot_duration_minutes: int
    created_at: datetime
    updated_at: datetime