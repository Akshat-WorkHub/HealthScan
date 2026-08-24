from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator


class DoctorLeaveCreateRequest(BaseModel):
    start_date: date
    end_date: date
    reason: str | None = Field(
        default=None,
        max_length=255,
    )

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.start_date > self.end_date:
            raise ValueError("start_date must be before or equal to end_date")

        return self


class DoctorLeaveUpdateRequest(BaseModel):
    start_date: date
    end_date: date
    reason: str | None = Field(
        default=None,
        max_length=255,
    )

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.start_date > self.end_date:
            raise ValueError("start_date must be before or equal to end_date")

        return self


class DoctorLeaveResponse(BaseModel):
    id: int
    doctor_id: int
    start_date: date
    end_date: date
    reason: str | None
    status : str
    created_at: datetime
    updated_at: datetime


class AdminDoctorLeaveCreateRequest(BaseModel):
    doctor_id: int
    start_date: date
    end_date: date
    reason: str | None = None