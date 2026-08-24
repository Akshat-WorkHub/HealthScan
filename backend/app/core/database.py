from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# backend/
BASE_DIR = Path(__file__).resolve().parents[2]

CA_CERT_PATH = BASE_DIR / "certs" / "isrgrootx1.pem"


engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args={
        "ssl": {
            "ca": str(CA_CERT_PATH),
            "check_hostname": True,
        }
    },
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()