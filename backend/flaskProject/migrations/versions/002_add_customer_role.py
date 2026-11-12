"""add customer role

Revision ID: 002
Revises: 001
Create Date: 2026-11-11 20:20:00.000000

"""

from alembic import op
import sqlalchemy as sa


revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("customers", sa.Column("role", sa.String(length=20), nullable=False, server_default="customer"))


def downgrade() -> None:
    op.drop_column("customers", "role")
