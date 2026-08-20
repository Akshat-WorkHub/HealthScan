from __future__ import annotations
from datetime import datetime
from enum import Enum

from sqlalchemy import BigInteger, DateTime, Enum as SQLEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UrgencyLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class PreVisitSummary(Base):
    __tablename__ = "pre_visit_summaries"

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    pre_visit_information_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("pre_visit_information.id"),
        unique=True,
        nullable=False,
    )

    urgency_level: Mapped[UrgencyLevel] = mapped_column(
        SQLEnum(UrgencyLevel),
        nullable=False,
    )

    chief_complaint: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    suggested_questions: Mapped[str] = mapped_column(
        Text,
        nullable=False,
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

    pre_visit_information: Mapped["PreVisitInformation"] = relationship(
        "PreVisitInformation",
        back_populates="summary",
    )