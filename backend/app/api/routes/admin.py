from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import require_role
from app.core.database import get_db
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.user import User
from app.schemas.admin import AdminDashboardStatsResponse
from app.schemas.auth import UserRole


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/dashboard/stats",
    response_model=AdminDashboardStatsResponse,
)
def get_dashboard_stats(
    current_user: User = Depends(
        require_role(UserRole.ADMIN)
    ),
    db: Session = Depends(get_db),
):
    total_doctors = db.scalar(
        select(func.count(Doctor.id))
    ) or 0

    total_patients = db.scalar(
        select(func.count(Patient.id))
    ) or 0

    total_appointments = db.scalar(
        select(func.count(Appointment.id))
    ) or 0

    return AdminDashboardStatsResponse(
        total_doctors=total_doctors,
        total_patients=total_patients,
        total_appointments=total_appointments,
    )