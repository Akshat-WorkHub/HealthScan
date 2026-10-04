import json
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.pre_visit_information import PreVisitInformation
from app.models.pre_visit_summary import PreVisitSummary, UrgencyLevel
from app.models.user import User
from app.schemas.auth import UserRole
from app.schemas.appointment import (
    AppointmentCreateRequest,
    AppointmentResponse,
    AdminAppointmentResponse,
    AdminAppointmentUpdateRequest,
    PatientAppointmentResponse,
    DoctorAppointmentResponse,
)
from app.schemas.pre_visit import (
    PreVisitInformationRequest,
    PreVisitInformationResponse,
    PreVisitSummaryResponse,
)
from app.services.ai_service import AIService, AIServiceError


router = APIRouter(
    prefix="/appointments",
    tags=["Appointments"],
)

logger = logging.getLogger(__name__)


def _get_patient_appointment(db: Session, current_user: User, appointment_id: int):
    patient = db.scalar(select(Patient).where(Patient.user_id == current_user.id))
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    appointment = db.scalar(select(Appointment).where(
        Appointment.id == appointment_id,
        Appointment.patient_id == patient.id,
    ))
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


def _serialize_pre_visit_summary(summary: PreVisitSummary) -> dict:
    try:
        questions = json.loads(summary.suggested_questions)
    except (TypeError, json.JSONDecodeError):
        logger.error("Stored pre-visit summary %s has invalid question data", summary.id)
        raise HTTPException(status_code=500, detail="Stored pre-visit summary is invalid") from None

    return {
        "id": summary.id,
        "urgency_level": summary.urgency_level,
        "chief_complaint": summary.chief_complaint,
        "suggested_questions": questions,
        "created_at": summary.created_at,
        "updated_at": summary.updated_at,
    }


def _serialize_pre_visit_information(info: PreVisitInformation) -> dict:
    return {
        "id": info.id,
        "appointment_id": info.appointment_id,
        "symptoms": info.symptoms,
        "additional_notes": info.additional_notes,
        "summary": _serialize_pre_visit_summary(info.summary) if info.summary else None,
        "created_at": info.created_at,
        "updated_at": info.updated_at,
    }


@router.get(
    "/me/{appointment_id}/pre-visit",
    response_model=PreVisitInformationResponse | None,
    status_code=status.HTTP_200_OK,
)
def get_my_pre_visit_information(
    appointment_id: int,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    appointment = _get_patient_appointment(db, current_user, appointment_id)
    info = db.scalar(select(PreVisitInformation)
        .options(selectinload(PreVisitInformation.summary))
        .where(PreVisitInformation.appointment_id == appointment.id))
    return _serialize_pre_visit_information(info) if info else None


@router.put(
    "/me/{appointment_id}/pre-visit",
    response_model=PreVisitInformationResponse,
    status_code=status.HTTP_200_OK,
)
def save_my_pre_visit_information(
    appointment_id: int,
    data: PreVisitInformationRequest,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    appointment = _get_patient_appointment(db, current_user, appointment_id)
    info = db.scalar(select(PreVisitInformation)
        .options(selectinload(PreVisitInformation.summary))
        .where(PreVisitInformation.appointment_id == appointment.id))

    if info:
        changed = (
            info.symptoms != data.symptoms
            or info.additional_notes != data.additional_notes
        )
        if changed and info.summary:
            db.delete(info.summary)
        info.symptoms = data.symptoms
        info.additional_notes = data.additional_notes
    else:
        info = PreVisitInformation(
            appointment_id=appointment.id,
            symptoms=data.symptoms,
            additional_notes=data.additional_notes,
        )
        db.add(info)

    db.commit()
    info = db.scalar(select(PreVisitInformation)
        .options(selectinload(PreVisitInformation.summary))
        .where(PreVisitInformation.appointment_id == appointment.id))
    return _serialize_pre_visit_information(info)


@router.post(
    "/me/{appointment_id}/pre-visit/summary",
    response_model=PreVisitSummaryResponse,
    status_code=status.HTTP_200_OK,
)
def generate_my_pre_visit_summary(
    appointment_id: int,
    current_user: User = Depends(require_role(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    appointment = _get_patient_appointment(db, current_user, appointment_id)
    info = db.scalar(select(PreVisitInformation)
        .options(selectinload(PreVisitInformation.summary))
        .where(PreVisitInformation.appointment_id == appointment.id))
    if not info:
        raise HTTPException(status_code=404, detail="Save your pre-visit information before generating a summary")
    if len(info.symptoms.strip()) < 5:
        raise HTTPException(status_code=422, detail="Please provide more detail about your symptoms")

    try:
        generated = AIService().generate_pre_visit_summary(
            symptoms=info.symptoms,
            additional_notes=info.additional_notes,
        )
    except AIServiceError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="We couldn't generate your AI summary right now. Your information was saved. Please try again later.",
        ) from None

    saved_info = db.scalar(
        select(PreVisitInformation)
        .options(selectinload(PreVisitInformation.summary))
        .where(PreVisitInformation.id == info.id)
        .with_for_update()
    )
    if not saved_info:
        db.rollback()
        raise HTTPException(status_code=404, detail="Pre-visit information was removed")
    if (
        saved_info.symptoms != info.symptoms
        or saved_info.additional_notes != info.additional_notes
    ):
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pre-visit information changed. Please retry summary generation.",
        )

    summary = saved_info.summary
    if summary is None:
        summary = PreVisitSummary(pre_visit_information_id=saved_info.id)
        db.add(summary)
    summary.urgency_level = UrgencyLevel(generated.urgency_level)
    summary.chief_complaint = generated.chief_complaint
    summary.suggested_questions = json.dumps(generated.suggested_questions, ensure_ascii=False)
    db.commit()
    db.refresh(summary)
    return _serialize_pre_visit_summary(summary)


@router.get(
    "/doctor/me",
    response_model=list[DoctorAppointmentResponse],
    status_code=status.HTTP_200_OK,
)
def get_my_doctor_appointments(
    current_user: User = Depends(require_role(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(select(Doctor).where(Doctor.user_id == current_user.id))
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    appointments = db.scalars(
        select(Appointment)
        .options(
            selectinload(Appointment.patient),
            selectinload(Appointment.pre_visit_information)
            .selectinload(PreVisitInformation.summary),
        )
        .where(Appointment.doctor_id == doctor.id)
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
            "patient_name": f"{appointment.patient.first_name} {appointment.patient.last_name}".strip(),
            "pre_visit_information": (
                _serialize_pre_visit_information(appointment.pre_visit_information)
                if appointment.pre_visit_information
                else None
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
    # Serialize bookings for a doctor by locking its row. This works on MySQL
    # and TiDB and closes the check/insert race for overlapping bookings.
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.id == appointment_data.doctor_id
        ).with_for_update()
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

    from datetime import date, datetime, timedelta, time
    from app.models.doctor_working_hours import DoctorWorkingHours
    from app.models.doctor_leave import DoctorLeave

    if appointment_data.appointment_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot book appointments in the past")

    if appointment_data.appointment_date == date.today() and datetime.combine(
        appointment_data.appointment_date, appointment_data.start_time
    ) <= datetime.now():
        raise HTTPException(status_code=400, detail="Cannot book a slot in the past")

    working_hours = db.scalars(select(DoctorWorkingHours).where(
        DoctorWorkingHours.doctor_id == doctor.id,
        DoctorWorkingHours.day_of_week == appointment_data.appointment_date.weekday(),
        DoctorWorkingHours.is_active.is_(True),
    )).all()
    duration = timedelta(minutes=doctor.slot_duration_minutes)
    start_at = datetime.combine(appointment_data.appointment_date, appointment_data.start_time)
    end_at = datetime.combine(appointment_data.appointment_date, appointment_data.end_time)
    if end_at - start_at != duration:
        raise HTTPException(status_code=400, detail="Requested time is outside the doctor's working hours")

    lunch_start = time(12, 30)
    lunch_end = time(14, 0)
    if appointment_data.start_time < lunch_end and appointment_data.end_time > lunch_start:
        raise HTTPException(status_code=400, detail="Appointments cannot overlap the 12:30–14:00 lunch break")

    matching_interval = next((interval for interval in working_hours
        if appointment_data.start_time >= interval.start_time
        and appointment_data.end_time <= interval.end_time), None)
    if not matching_interval:
        raise HTTPException(status_code=400, detail="Requested time is outside the doctor's working hours")
    anchor = max(matching_interval.start_time, lunch_end) if appointment_data.start_time >= lunch_end else matching_interval.start_time
    if (start_at - datetime.combine(appointment_data.appointment_date, anchor)).total_seconds() % duration.total_seconds() != 0:
        raise HTTPException(status_code=400, detail="Requested time is not a generated appointment slot")

    leave = db.scalar(select(DoctorLeave).where(
        DoctorLeave.doctor_id == doctor.id,
        DoctorLeave.start_date <= appointment_data.appointment_date,
        DoctorLeave.end_date >= appointment_data.appointment_date,
        DoctorLeave.status == "APPROVED",
    ))
    if leave:
        raise HTTPException(status_code=400, detail="Doctor is on leave for this date")

    # Validate time range
    if appointment_data.start_time >= appointment_data.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time must be before end time",
        )

    # Check all interval overlaps, including legacy/non-grid appointments.
    conflict = db.scalar(
        select(Appointment).where(
            Appointment.doctor_id == appointment_data.doctor_id,
            Appointment.appointment_date == appointment_data.appointment_date,
            Appointment.status == AppointmentStatus.SCHEDULED,
            Appointment.start_time < appointment_data.end_time,
            Appointment.end_time > appointment_data.start_time,
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
