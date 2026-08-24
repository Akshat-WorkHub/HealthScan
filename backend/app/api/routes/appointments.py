from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.schemas.auth import UserRole
from app.schemas.appointment import (
    AppointmentCreateRequest,
    AppointmentResponse,
    AdminAppointmentResponse,
    AdminAppointmentUpdateRequest,
    PatientAppointmentResponse,
)


router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"],
)


# ============================================================
# ADMIN — GET ALL APPOINTMENTS
# ============================================================

@router.get(
    "/admin",
    response_model=list[AdminAppointmentResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_appointments_as_admin(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    appointments = db.scalars(
        select(Appointment)
        .order_by(
            Appointment.appointment_date,
            Appointment.start_time,
            Appointment.id,
        )
    ).all()

    return [
        {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "appointment_date": appointment.appointment_date,
            "start_time": appointment.start_time,
            "end_time": appointment.end_time,
            "status": appointment.status,
            "cancellation_reason": appointment.cancellation_reason,
            "created_at": appointment.created_at,
            "updated_at": appointment.updated_at,
            "patient_name": (
                f"{appointment.patient.first_name} "
                f"{appointment.patient.last_name}"
            ),
            "doctor_name": (
                f"Dr. {appointment.doctor.first_name} "
                f"{appointment.doctor.last_name}"
            ),
            "doctor_specialization": (
                appointment.doctor.specialization
            ),
        }
        for appointment in appointments
    ]


# ============================================================
# ADMIN — GET SINGLE APPOINTMENT
# ============================================================

@router.get(
    "/admin/{appointment_id}",
    response_model=AdminAppointmentResponse,
    status_code=status.HTTP_200_OK,
)
def get_appointment_as_admin(
    appointment_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    appointment = db.scalar(
        select(Appointment).where(
            Appointment.id == appointment_id
        )
    )

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    return {
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "appointment_date": appointment.appointment_date,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "status": appointment.status,
        "cancellation_reason": appointment.cancellation_reason,
        "created_at": appointment.created_at,
        "updated_at": appointment.updated_at,
        "patient_name": (
            f"{appointment.patient.first_name} "
            f"{appointment.patient.last_name}"
        ),
        "doctor_name": (
            f"Dr. {appointment.doctor.first_name} "
            f"{appointment.doctor.last_name}"
        ),
        "doctor_specialization": (
            appointment.doctor.specialization
        ),
    }


# ============================================================
# ADMIN — UPDATE APPOINTMENT
# ============================================================

@router.put(
    "/admin/{appointment_id}",
    response_model=AdminAppointmentResponse,
    status_code=status.HTTP_200_OK,
)
def update_appointment_as_admin(
    appointment_id: int,
    appointment_data: AdminAppointmentUpdateRequest,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    appointment = db.scalar(
        select(Appointment).where(
            Appointment.id == appointment_id
        )
    )

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    update_data = appointment_data.model_dump(
        exclude_unset=True
    )

    new_start_time = update_data.get(
        "start_time",
        appointment.start_time,
    )

    new_end_time = update_data.get(
        "end_time",
        appointment.end_time,
    )

    if new_start_time >= new_end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time",
        )

    for field, value in update_data.items():
        setattr(appointment, field, value)

    db.commit()
    db.refresh(appointment)

    return {
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "appointment_date": appointment.appointment_date,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "status": appointment.status,
        "cancellation_reason": appointment.cancellation_reason,
        "created_at": appointment.created_at,
        "updated_at": appointment.updated_at,
        "patient_name": (
            f"{appointment.patient.first_name} "
            f"{appointment.patient.last_name}"
        ),
        "doctor_name": (
            f"Dr. {appointment.doctor.first_name} "
            f"{appointment.doctor.last_name}"
        ),
        "doctor_specialization": (
            appointment.doctor.specialization
        ),
    }


# ============================================================
# ADMIN — UPDATE APPOINTMENT STATUS
# ============================================================

@router.patch(
    "/admin/{appointment_id}/status",
    response_model=AdminAppointmentResponse,
    status_code=status.HTTP_200_OK,
)
def update_appointment_status_as_admin(
    appointment_id: int,
    appointment_status: AppointmentStatus,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    appointment = db.scalar(
        select(Appointment).where(
            Appointment.id == appointment_id
        )
    )

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    appointment.status = appointment_status

    if appointment_status != AppointmentStatus.CANCELLED:
        appointment.cancellation_reason = None

    db.commit()
    db.refresh(appointment)

    return {
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "appointment_date": appointment.appointment_date,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "status": appointment.status,
        "cancellation_reason": appointment.cancellation_reason,
        "created_at": appointment.created_at,
        "updated_at": appointment.updated_at,
        "patient_name": (
            f"{appointment.patient.first_name} "
            f"{appointment.patient.last_name}"
        ),
        "doctor_name": (
            f"Dr. {appointment.doctor.first_name} "
            f"{appointment.doctor.last_name}"
        ),
        "doctor_specialization": (
            appointment.doctor.specialization
        ),
    }


# ============================================================
# PATIENT — GET MY APPOINTMENTS
# ============================================================

@router.get(
    "/me",
    response_model=list[PatientAppointmentResponse],
    status_code=status.HTTP_200_OK,
)
def get_my_patient_appointments(
    current_user: User = Depends(
        require_role(UserRole.PATIENT)
    ),
    db: Session = Depends(get_db),
):
    patient = db.scalar(
        select(Patient).where(
            Patient.user_id == current_user.id
        )
    )

    if not patient:
        return []

    appointments = db.scalars(
        select(Appointment)
        .where(
            Appointment.patient_id == patient.id
        )
        .order_by(
            Appointment.appointment_date.desc(),
            Appointment.start_time.desc(),
            Appointment.id.desc(),
        )
    ).all()

    return [
        {
            "id": appointment.id,
            "doctor_id": appointment.doctor_id,
            "doctor_name": (
                f"Dr. {appointment.doctor.first_name} "
                f"{appointment.doctor.last_name}"
            ),
            "doctor_specialization": (
                appointment.doctor.specialization
            ),
            "appointment_date": appointment.appointment_date,
            "start_time": appointment.start_time,
            "end_time": appointment.end_time,
            "status": appointment.status,
            "cancellation_reason": appointment.cancellation_reason,
            "created_at": appointment.created_at,
            "updated_at": appointment.updated_at,
        }
        for appointment in appointments
    ]


# ============================================================
# PATIENT — BOOK APPOINTMENT
# ============================================================

@router.post(
    "/me",
    response_model=PatientAppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_appointment(
    appointment_data: AppointmentCreateRequest,
    current_user: User = Depends(
        require_role(UserRole.PATIENT)
    ),
    db: Session = Depends(get_db),
):
    # Ensure patient profile exists
    patient = db.scalar(
        select(Patient).where(
            Patient.user_id == current_user.id
        )
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient profile not found. Please complete your profile first.",
        )

    # Ensure doctor exists and is active
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.id == appointment_data.doctor_id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    if not doctor.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor is not currently accepting appointments",
        )

    # Validate time range
    if appointment_data.start_time >= appointment_data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time",
        )

    # Check for conflicting appointment (same doctor, date, start_time, SCHEDULED)
    conflict = db.scalar(
        select(Appointment).where(
            Appointment.doctor_id == appointment_data.doctor_id,
            Appointment.appointment_date == appointment_data.appointment_date,
            Appointment.status == AppointmentStatus.SCHEDULED,
            Appointment.start_time == appointment_data.start_time,
        )
    )

    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This time slot is already booked. Please choose a different slot.",
        )

    appointment = Appointment(
        patient_id=patient.id,
        doctor_id=appointment_data.doctor_id,
        appointment_date=appointment_data.appointment_date,
        start_time=appointment_data.start_time,
        end_time=appointment_data.end_time,
        status=AppointmentStatus.SCHEDULED,
    )

    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    return {
        "id": appointment.id,
        "doctor_id": appointment.doctor_id,
        "doctor_name": (
            f"Dr. {appointment.doctor.first_name} "
            f"{appointment.doctor.last_name}"
        ),
        "doctor_specialization": appointment.doctor.specialization,
        "appointment_date": appointment.appointment_date,
        "start_time": appointment.start_time,
        "end_time": appointment.end_time,
        "status": appointment.status,
        "cancellation_reason": appointment.cancellation_reason,
        "created_at": appointment.created_at,
        "updated_at": appointment.updated_at,
    }


# ============================================================
# PATIENT — CANCEL APPOINTMENT
# ============================================================

@router.delete(
    "/me/{appointment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def cancel_appointment(
    appointment_id: int,
    current_user: User = Depends(
        require_role(UserRole.PATIENT)
    ),
    db: Session = Depends(get_db),
):
    patient = db.scalar(
        select(Patient).where(
            Patient.user_id == current_user.id
        )
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    appointment = db.scalar(
        select(Appointment).where(
            Appointment.id == appointment_id,
            Appointment.patient_id == patient.id,
        )
    )

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    if appointment.status != AppointmentStatus.SCHEDULED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only scheduled appointments can be cancelled",
        )

    appointment.status = AppointmentStatus.CANCELLED
    appointment.cancellation_reason = "Cancelled by patient"

    db.commit()

    return None