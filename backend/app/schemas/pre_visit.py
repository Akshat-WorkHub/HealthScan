from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.pre_visit_summary import UrgencyLevel


class PreVisitInformationRequest(BaseModel):
    symptoms: str = Field(max_length=10_000)
    additional_notes: str | None = Field(default=None, max_length=10_000)

    @field_validator("symptoms", mode="before")
    @classmethod
    def validate_symptoms(cls, value: object) -> str:
        if not isinstance(value, str):
            raise ValueError("Symptoms are required")
        cleaned = value.strip()
        if len(cleaned) < 5:
            raise ValueError("Please provide more detail about your symptoms")
        return cleaned

    @field_validator("additional_notes", mode="before")
    @classmethod
    def clean_notes(cls, value: object) -> str | None:
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("Additional notes must be text")
        return value.strip() or None


class PreVisitSummaryResponse(BaseModel):
    id: int
    urgency_level: UrgencyLevel
    chief_complaint: str
    suggested_questions: list[str] = Field(min_length=3, max_length=3)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PreVisitInformationResponse(BaseModel):
    id: int
    appointment_id: int
    symptoms: str
    additional_notes: str | None
    summary: PreVisitSummaryResponse | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
