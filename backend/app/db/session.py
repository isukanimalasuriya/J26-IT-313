import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure MySQL SQLAlchemy Engine with connection pooling
engine = create_engine(
    settings.get_database_url,
    pool_pre_ping=True,      # Automatically reconnects if connection was dropped
    pool_recycle=3600,       # Recycles connections every hour to avoid MySQL timeout
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session.
    Automatically closes session after request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """
    Verifies that the MySQL database is reachable.
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            row = result.fetchone()
            if row and row[0] == 1:
                return {"status": "connected", "database": settings.DB_NAME}
            return {"status": "unexpected_result"}
    except Exception as exc:
        logger.error(f"Database connection error: {exc}")
        return {"status": "error", "detail": str(exc)}
