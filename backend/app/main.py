from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.admin import router as admins_router
from app.api.routes.doctors import router as doctors_router
from app.api.routes.patients import router as patients_router
from app.api.routes.appointments import router as appointments_router
from app.api.routes.auth import router as auth_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description="AI-powered Health Appointment Manager",
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(doctors_router)
app.include_router(admins_router)
app.include_router(appointments_router)

@app.get("/")
def root():
    return {
        "message": "HealthScan API is running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }