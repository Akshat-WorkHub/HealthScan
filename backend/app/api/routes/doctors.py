from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.core.database import get_db
from app.core.security import hash_password

from app.models.doctor import Doctor
from app.models.user import User
from app.models.doctor_leave import DoctorLeave
from app.models.doctor_working_hours import DoctorWorkingHours

from app.schemas.auth import UserRole
from app.schemas.doctor import (
    DoctorCreateRequest,
    DoctorResponse,
    DoctorUpdateRequest,
    AdminDoctorCreateRequest,
    AdminDoctorUpdateRequest,
)
from app.schemas.doctor_working_hours import (
    DoctorWorkingHoursCreateRequest,
    DoctorWorkingHoursResponse,
    DoctorWorkingHoursUpdateRequest,
)
from app.schemas.doctor_leave import (
    DoctorLeaveCreateRequest,
    DoctorLeaveResponse,
    DoctorLeaveUpdateRequest,
    AdminDoctorLeaveCreateRequest,
)


router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"],
)

@router.get(
    "/me",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK,
)
def get_my_doctor_profile(
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    return DoctorResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        specialization=doctor.specialization,
        qualification=doctor.qualification,
        experience_years=doctor.experience_years,
        slot_duration_minutes=doctor.slot_duration_minutes,
        created_at=doctor.created_at,
        updated_at=doctor.updated_at,
        is_active=doctor.user.is_active,
    )

@router.post(
    "/me",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_doctor_profile(
    doctor_data: DoctorCreateRequest,
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    existing_doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor profile already exists",
        )

    doctor = Doctor(
        user_id=current_user.id,
        first_name=doctor_data.first_name,
        last_name=doctor_data.last_name,
        specialization=doctor_data.specialization,
        qualification=doctor_data.qualification,
        experience_years=doctor_data.experience_years,
        slot_duration_minutes=doctor_data.slot_duration_minutes,
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    return doctor

@router.put(
    "/me",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK,
)
def update_my_doctor_profile(
    doctor_data: DoctorUpdateRequest,
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    update_data = doctor_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)
    db.refresh(doctor.user)

    return DoctorResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        specialization=doctor.specialization,
        qualification=doctor.qualification,
        experience_years=doctor.experience_years,
        slot_duration_minutes=doctor.slot_duration_minutes,
        created_at=doctor.created_at,
        updated_at=doctor.updated_at,
        is_active=doctor.user.is_active,
    )

@router.get(
    "/me/working-hours",
    response_model=list[DoctorWorkingHoursResponse],
    status_code=status.HTTP_200_OK,
)
def get_my_working_hours(
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    working_hours = db.scalars(
        select(DoctorWorkingHours)
        .where(
            DoctorWorkingHours.doctor_id == doctor.id
        )
        .order_by(
            DoctorWorkingHours.day_of_week
        )
    ).all()

    return working_hours

@router.put(
    "/me/working-hours/{day_of_week}",
    response_model=DoctorWorkingHoursResponse,
    status_code=status.HTTP_200_OK,
)
def update_working_hours(
    day_of_week: int,
    working_hours_data: DoctorWorkingHoursUpdateRequest,
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    if day_of_week < 0 or day_of_week > 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="day_of_week must be between 0 and 6",
        )

    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    working_hours = db.scalar(
        select(DoctorWorkingHours).where(
            DoctorWorkingHours.doctor_id == doctor.id,
            DoctorWorkingHours.day_of_week == day_of_week,
        )
    )

    if not working_hours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Working hours not found for this day",
        )

    working_hours.start_time = working_hours_data.start_time
    working_hours.end_time = working_hours_data.end_time

    db.commit()
    db.refresh(working_hours)

    return working_hours

@router.post(
    "/me/working-hours",
    response_model=DoctorWorkingHoursResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_working_hours(
    working_hours_data: DoctorWorkingHoursCreateRequest,
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    existing_hours = db.scalar(
        select(DoctorWorkingHours).where(
            DoctorWorkingHours.doctor_id == doctor.id,
            DoctorWorkingHours.day_of_week
            == working_hours_data.day_of_week,
        )
    )

    if existing_hours:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Working hours already exist for this day",
        )

    working_hours = DoctorWorkingHours(
        doctor_id=doctor.id,
        day_of_week=working_hours_data.day_of_week,
        start_time=working_hours_data.start_time,
        end_time=working_hours_data.end_time,
    )

    db.add(working_hours)
    db.commit()
    db.refresh(working_hours)

    return working_hours

@router.delete(
    "/me/working-hours/{day_of_week}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_working_hours(
    day_of_week: int,
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    if day_of_week < 0 or day_of_week > 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="day_of_week must be between 0 and 6",
        )

    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    working_hours = db.scalar(
        select(DoctorWorkingHours).where(
            DoctorWorkingHours.doctor_id == doctor.id,
            DoctorWorkingHours.day_of_week == day_of_week,
        )
    )

    if not working_hours:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Working hours not found for this day",
        )

    db.delete(working_hours)
    db.commit()

    return None

@router.post(
    "/me/leaves",
    response_model=DoctorLeaveResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_doctor_leave(
    leave_data: DoctorLeaveCreateRequest,
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    leave = DoctorLeave(
        doctor_id=doctor.id,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason,
        status="PENDING",
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave

@router.get(
    "/me/leaves",
    response_model=list[DoctorLeaveResponse],
    status_code=status.HTTP_200_OK,
)
def get_my_leaves(
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    leaves = db.scalars(
        select(DoctorLeave)
        .where(
            DoctorLeave.doctor_id == doctor.id
        )
        .order_by(
            DoctorLeave.start_date
        )
    ).all()

    return leaves

@router.put(
    "/me/leaves/{leave_id}",
    response_model=DoctorLeaveResponse,
    status_code=status.HTTP_200_OK,
)
def update_doctor_leave(
    leave_id: int,
    leave_data: DoctorLeaveUpdateRequest,
    current_user: User = Depends(
        require_role(UserRole.DOCTOR)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.user_id == current_user.id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    leave = db.scalar(
        select(DoctorLeave).where(
            DoctorLeave.id == leave_id,
            DoctorLeave.doctor_id == doctor.id,
        )
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave record not found",
        )

    leave.start_date = leave_data.start_date
    leave.end_date = leave_data.end_date
    leave.reason = leave_data.reason

    db.commit()
    db.refresh(leave)

    return leave


# ============================================================
# ADMIN — DOCTOR LEAVE MANAGEMENT
# ============================================================


@router.get(
    "/admin/leaves",
    response_model=list[DoctorLeaveResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_doctor_leaves(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    leaves = db.scalars(
        select(DoctorLeave)
        .order_by(
            DoctorLeave.start_date
        )
    ).all()

    return leaves


@router.get(
    "/admin/leaves/{leave_id}",
    response_model=DoctorLeaveResponse,
    status_code=status.HTTP_200_OK,
)
def get_doctor_leave_as_admin(
    leave_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    leave = db.scalar(
        select(DoctorLeave).where(
            DoctorLeave.id == leave_id
        )
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave record not found",
        )

    return leave

@router.patch(
    "/admin/leaves/{leave_id}/status",
    response_model=DoctorLeaveResponse,
    status_code=status.HTTP_200_OK,
)
def update_doctor_leave_status_as_admin(
    leave_id: int,
    leave_status: str,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    if leave_status not in {
        "PENDING",
        "APPROVED",
        "REJECTED",
    }:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid leave status",
        )

    leave = db.scalar(
        select(DoctorLeave).where(
            DoctorLeave.id == leave_id
        )
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave record not found",
        )

    leave.status = leave_status

    db.commit()
    db.refresh(leave)

    return leave


@router.post(
    "/admin/leaves",
    response_model=DoctorLeaveResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_doctor_leave_as_admin(
    leave_data: AdminDoctorLeaveCreateRequest,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.id == leave_data.doctor_id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    leave = DoctorLeave(
        doctor_id=leave_data.doctor_id,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        reason=leave_data.reason,
        status="PENDING",
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


@router.put(
    "/admin/leaves/{leave_id}",
    response_model=DoctorLeaveResponse,
    status_code=status.HTTP_200_OK,
)
def update_doctor_leave_as_admin(
    leave_id: int,
    leave_data: DoctorLeaveUpdateRequest,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    leave = db.scalar(
        select(DoctorLeave).where(
            DoctorLeave.id == leave_id
        )
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave record not found",
        )

    update_data = leave_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(leave, field, value)

    db.commit()
    db.refresh(leave)

    return leave


@router.delete(
    "/admin/leaves/{leave_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_doctor_leave_as_admin(
    leave_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    leave = db.scalar(
        select(DoctorLeave).where(
            DoctorLeave.id == leave_id
        )
    )

    if not leave:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leave record not found",
        )

    db.delete(leave)
    db.commit()

    return None

# ============================================================
# ADMIN — DOCTOR MANAGEMENT
# ============================================================


@router.get(
    "/admin",
    response_model=list[DoctorResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_doctors(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    doctors = db.scalars(
        select(Doctor).order_by(
            Doctor.id
        )
    ).all()

    return [
        DoctorResponse(
            id=doctor.id,
            user_id=doctor.user_id,
            first_name=doctor.first_name,
            last_name=doctor.last_name,
            specialization=doctor.specialization,
            qualification=doctor.qualification,
            experience_years=doctor.experience_years,
            slot_duration_minutes=doctor.slot_duration_minutes,
            created_at=doctor.created_at,
            updated_at=doctor.updated_at,
            is_active=doctor.user.is_active,
        )
        for doctor in doctors
    ]


@router.post(
    "/admin",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_doctor_as_admin(
    doctor_data: AdminDoctorCreateRequest,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    # Check whether email is already registered
    existing_user = db.scalar(
        select(User).where(
            User.email == doctor_data.email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    # Create User account
    user = User(
        email=doctor_data.email,
        password_hash=hash_password(
            doctor_data.password
        ),
        role=UserRole.DOCTOR.value,
        is_active=True,
    )

    db.add(user)
    db.flush()

    # Create Doctor profile
    doctor = Doctor(
        user_id=user.id,
        first_name=doctor_data.first_name,
        last_name=doctor_data.last_name,
        specialization=doctor_data.specialization,
        qualification=doctor_data.qualification,
        experience_years=doctor_data.experience_years,
        slot_duration_minutes=doctor_data.slot_duration_minutes,
    )

    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    db.refresh(doctor.user)

    return DoctorResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        specialization=doctor.specialization,
        qualification=doctor.qualification,
        experience_years=doctor.experience_years,
        slot_duration_minutes=doctor.slot_duration_minutes,
        created_at=doctor.created_at,
        updated_at=doctor.updated_at,
        is_active=doctor.user.is_active,
    )


@router.get(
    "/admin/{doctor_id}",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK,
)
def get_doctor_as_admin(
    doctor_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.id == doctor_id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    return DoctorResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        specialization=doctor.specialization,
        qualification=doctor.qualification,
        experience_years=doctor.experience_years,
        slot_duration_minutes=doctor.slot_duration_minutes,
        created_at=doctor.created_at,
        updated_at=doctor.updated_at,
        is_active=doctor.user.is_active,
    )


@router.put(
    "/admin/{doctor_id}",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK,
)
def update_doctor_as_admin(
    doctor_id: int,
    doctor_data: AdminDoctorUpdateRequest,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.id == doctor_id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    update_data = doctor_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)
    db.refresh(doctor.user)
    return DoctorResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        specialization=doctor.specialization,
        qualification=doctor.qualification,
        experience_years=doctor.experience_years,
        slot_duration_minutes=doctor.slot_duration_minutes,
        created_at=doctor.created_at,
        updated_at=doctor.updated_at,
        is_active=doctor.user.is_active,
    )


@router.patch(
    "/admin/{doctor_id}/status",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK,
)
def update_doctor_status_as_admin(
    doctor_id: int,
    is_active: bool,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    doctor = db.scalar(
        select(Doctor).where(
            Doctor.id == doctor_id
        )
    )

    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    doctor.user.is_active = is_active

    db.commit()
    db.refresh(doctor)

    return DoctorResponse(
    id=doctor.id,
    user_id=doctor.user_id,
    first_name=doctor.first_name,
    last_name=doctor.last_name,
    specialization=doctor.specialization,
    qualification=doctor.qualification,
    experience_years=doctor.experience_years,
    slot_duration_minutes=doctor.slot_duration_minutes,
    created_at=doctor.created_at,
    updated_at=doctor.updated_at,
    is_active=doctor.user.is_active,
)