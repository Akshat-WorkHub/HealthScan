from datetime import time, datetime

from pydantic import BaseModel, Field, model_validator


class DoctorWorkingHoursCreateRequest(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be before end_time")

        return self


class DoctorWorkingHoursUpdateRequest(BaseModel):
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be before end_time")

        return self


class DoctorWorkingHoursResponse(BaseModel):
    id: int
    doctor_id: int
    day_of_week: int
    start_time: time
    end_time: time
    created_at: datetime
    updated_at: datetime