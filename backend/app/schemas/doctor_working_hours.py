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
    start_time: time | None = None
    end_time: time | None = None
    is_active: bool | None = None

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time is not None and self.end_time is not None and self.start_time >= self.end_time:
            raise ValueError("start_time must be before end_time")

        return self


class DoctorWorkingHoursResponse(BaseModel):
    id: int
    doctor_id: int
    day_of_week: int
    start_time: time
    end_time: time
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class WorkingInterval(BaseModel):
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_interval(self):
        if self.start_time >= self.end_time:
            raise ValueError("start_time must be before end_time")
        return self


class WeeklyScheduleDay(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    intervals: list[WorkingInterval] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_intervals_do_not_overlap(self):
        ordered = sorted(self.intervals, key=lambda interval: interval.start_time)
        for previous, current in zip(ordered, ordered[1:]):
            if previous.end_time > current.start_time:
                raise ValueError("Working intervals must not overlap")
        return self


class WeeklyScheduleRequest(BaseModel):
    days: list[WeeklyScheduleDay] = Field(min_length=7, max_length=7)

    @model_validator(mode="after")
    def validate_each_day_once(self):
        if {day.day_of_week for day in self.days} != set(range(7)):
            raise ValueError("Schedule must contain each weekday exactly once")
        return self
