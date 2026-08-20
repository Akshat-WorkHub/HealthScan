from __future__ import annotations
from datetime import datetime, time

from sqlalchemy import BigInteger, DateTime, ForeignKey, SmallInteger, Time, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DoctorWorkingHours(Base):
    __tablename__ = "doctor_working_hours"

    __table_args__ = (
        Index(
            "ix_doctor_working_hours_doctor_day",
            "doctor_id",
            "day_of_week",
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

    day_of_week: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
    )

    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    end_time: Mapped[time] = mapped_column(
        Time,
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

    doctor: Mapped["Doctor"] = relationship(
        "Doctor",
        back_populates="working_hours",
    )