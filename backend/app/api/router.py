from fastapi import APIRouter
from app.db.session import check_db_connection

api_router = APIRouter()


@api_router.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint returning system status and MySQL database connectivity.
    """
    db_status = check_db_connection()
    return {
        "status": "online",
        "database": db_status,
    }

# Future API route modules (e.g. users, media, ml) will be registered here.
