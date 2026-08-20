from __future__ import annotations
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PreVisitInformation(Base):
    __tablename__ = "pre_visit_information"

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

    symptoms: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    additional_notes: Mapped[str | None] = mapped_column(
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
        back_populates="pre_visit_information",
    )

    summary: Mapped["PreVisitSummary | None"] = relationship(
        "PreVisitSummary",
        back_populates="pre_visit_information",
        uselist=False,
    )