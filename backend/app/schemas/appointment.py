from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field

from app.models.appointment import AppointmentStatus


class AppointmentCreateRequest(BaseModel):
    doctor_id: int
    appointment_date: date
    start_time: time
    end_time: time


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: date
    start_time: time
    end_time: time
    status: AppointmentStatus
    cancellation_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminAppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: date
    start_time: time
    end_time: time
    status: AppointmentStatus
    cancellation_reason: str | None
    created_at: datetime
    updated_at: datetime

    patient_name: str
    doctor_name: str
    doctor_specialization: str

    model_config = ConfigDict(from_attributes=True)


class AdminAppointmentUpdateRequest(BaseModel):
    appointment_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    status: AppointmentStatus | None = None
    cancellation_reason: str | None = Field(
        default=None,
        max_length=255,
    )


class PatientAppointmentResponse(BaseModel):
    id: int
    doctor_id: int
    doctor_name: str
    doctor_specialization: str
    appointment_date: date
    start_time: time
    end_time: time
    status: AppointmentStatus
    cancellation_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)