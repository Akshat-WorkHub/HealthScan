from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.doctors import router as doctors_router
from app.api.routes.patients import router as patients_router
from app.api.routes.auth import router as auth_router
from app.core.config import settings

app = FastAPI(
    title="HealthScan API",
    description="AI-powered Health Appointment Manager",
    version="0.1.0",
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