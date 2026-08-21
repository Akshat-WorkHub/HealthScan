from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_role
from app.core.database import get_db
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.auth import UserRole
from app.schemas.doctor import (
    DoctorCreateRequest,
    DoctorResponse,
    DoctorUpdateRequest,
)

from app.models.doctor_working_hours import DoctorWorkingHours
from app.schemas.doctor_working_hours import (
    DoctorWorkingHoursCreateRequest,
    DoctorWorkingHoursResponse,
    DoctorWorkingHoursUpdateRequest,
)

from app.models.doctor_leave import DoctorLeave

from app.schemas.doctor_leave import (
    DoctorLeaveCreateRequest,
    DoctorLeaveResponse,
    DoctorLeaveUpdateRequest,
)


router = APIRouter(
    prefix="/doctors",
    tags=["Doctors"],
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

    return doctor

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

@router.delete(
    "/me/leaves/{leave_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_doctor_leave(
    leave_id: int,
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

    db.delete(leave)
    db.commit()

    return None

