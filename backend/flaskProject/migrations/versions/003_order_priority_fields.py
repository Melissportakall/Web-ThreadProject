"""order priority and failure tracking

Revision ID: 003
Revises: 002
Create Date: 2026-11-11 20:20:00.000000

"""

from alembic import op
import sqlalchemy as sa


revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("priority_score", sa.Float(), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("customer_type_snapshot", sa.String(length=20), nullable=True))
    op.add_column("orders", sa.Column("failure_reason", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "failure_reason")
    op.drop_column("orders", "customer_type_snapshot")
    op.drop_column("orders", "priority_score")
