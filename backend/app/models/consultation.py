from __future__ import annotations
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Consultation(Base):
    __tablename__ = "consultations"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    appointment_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("appointments.id"),
        unique=True,
        nullable=False,
    )

    diagnosis: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
        onupdate=datetime.now,
    )

    appointment: Mapped["Appointment"] = relationship(
        "Appointment",
        back_populates="consultation",
    )

    post_visit_summary: Mapped["PostVisitSummary | None"] = relationship(
        "PostVisitSummary",
        back_populates="consultation",
        uselist=False,
    )

    prescription: Mapped["Prescription | None"] = relationship(
        "Prescription",
        back_populates="consultation",
        uselist=False,
    )