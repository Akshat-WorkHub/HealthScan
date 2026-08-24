from __future__ import annotations
from datetime import date, datetime

from sqlalchemy import BigInteger, CheckConstraint, Date, DateTime, ForeignKey, String, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DoctorLeave(Base):
    __tablename__ = "doctor_leave"

    __table_args__ = (
        CheckConstraint(
            "start_date <= end_date",
            name="ck_doctor_leave_date_range",
        ),
        Index(
            "ix_doctor_leave_doctor_dates",
            "doctor_id",
            "start_date",
            "end_date",
        ),
    )

    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )

    doctor_id: Mapped[int] = mapped_column(
        BigInteger,
        ForeignKey("doctors.id"),
        nullable=False,
    )

    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    reason: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="PENDING",
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

    doctor: Mapped["Doctor"] = relationship(
        "Doctor",
        back_populates="leaves",
    )