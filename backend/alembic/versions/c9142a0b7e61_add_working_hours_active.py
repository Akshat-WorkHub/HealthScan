"""add active flag to recurring doctor working hours

Revision ID: c9142a0b7e61
Revises: b2d6955b98a0
Create Date: 2026-10-04
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "c9142a0b7e61"
down_revision: Union[str, Sequence[str], None] = "b2d6955b98a0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "doctor_working_hours",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )


def downgrade() -> None:
    op.drop_column("doctor_working_hours", "is_active")
