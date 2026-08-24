from pydantic import BaseModel


class AdminDashboardStatsResponse(BaseModel):
    total_doctors: int
    total_patients: int
    total_appointments: int