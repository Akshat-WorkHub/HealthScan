from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.patient import Patient
from app.models.user import User
from app.schemas.auth import UserRole
from app.schemas.patient import PatientCreateRequest, PatientUpdateRequest, PatientResponse


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