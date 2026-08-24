from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.patient import Patient
from app.models.user import User
from app.schemas.auth import UserRole
from app.schemas.patient import (
    PatientCreateRequest,
    PatientUpdateRequest,
    PatientResponse,
    AdminPatientResponse,
    AdminPatientUpdateRequest,
)


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


@router.post(
    "/me",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_patient_profile(
    patient_data: PatientCreateRequest,
    current_user: User = Depends(
        require_role(UserRole.PATIENT)
    ),
    db: Session = Depends(get_db),
):
    existing_patient = db.scalar(
        select(Patient).where(
            Patient.user_id == current_user.id
        )
    )

    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Patient profile already exists",
        )

    patient = Patient(
        user_id=current_user.id,
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        date_of_birth=patient_data.date_of_birth,
        phone=patient_data.phone,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient

@router.get(
    "/me",
    response_model=PatientResponse,
    status_code=status.HTTP_200_OK,
)
def get_my_patient_profile(current_user: User = Depends(require_role(UserRole.PATIENT)), db: Session = Depends(get_db)):

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

    return patient

@router.put(
    "/me",
    response_model=PatientResponse,
    status_code=status.HTTP_200_OK,
)
def update_my_patient_profile(
    patient_data: PatientUpdateRequest,
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

    update_data = patient_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)

    return patient

@router.get(
    "/admin",
    response_model=list[AdminPatientResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_patients(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    patients = db.scalars(
        select(Patient).order_by(
            Patient.id
        )
    ).all()

    return [
        {
            "id": patient.id,
            "user_id": patient.user_id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "date_of_birth": patient.date_of_birth,
            "phone": patient.phone,
            "created_at": patient.created_at,
            "updated_at": patient.updated_at,
            "is_active": patient.user.is_active,
        }
        for patient in patients
    ]

@router.get(
    "/admin/{patient_id}",
    response_model=AdminPatientResponse,
    status_code=status.HTTP_200_OK,
)
def get_patient_as_admin(
    patient_id: int,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    patient = db.scalar(
        select(Patient).where(
            Patient.id == patient_id
        )
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return {
        "id": patient.id,
        "user_id": patient.user_id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "phone": patient.phone,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "is_active": patient.user.is_active,
    }

@router.put(
    "/admin/{patient_id}",
    response_model=AdminPatientResponse,
    status_code=status.HTTP_200_OK,
)
def update_patient_as_admin(
    patient_id: int,
    patient_data: AdminPatientUpdateRequest,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    patient = db.scalar(
        select(Patient).where(
            Patient.id == patient_id
        )
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    update_data = patient_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    db.refresh(patient.user)

    return {
        "id": patient.id,
        "user_id": patient.user_id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "phone": patient.phone,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "is_active": patient.user.is_active,
    }

@router.patch(
    "/admin/{patient_id}/status",
    response_model=AdminPatientResponse,
    status_code=status.HTTP_200_OK,
)
def update_patient_status_as_admin(
    patient_id: int,
    is_active: bool,
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    patient = db.scalar(
        select(Patient).where(
            Patient.id == patient_id
        )
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    patient.user.is_active = is_active

    db.commit()
    db.refresh(patient)
    db.refresh(patient.user)

    return {
        "id": patient.id,
        "user_id": patient.user_id,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "date_of_birth": patient.date_of_birth,
        "phone": patient.phone,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "is_active": patient.user.is_active,
    }