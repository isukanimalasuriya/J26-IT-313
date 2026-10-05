import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api import api_router
from app.db.session import check_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Application startup: verify database connection
    logger.info("Initializing API application...")
    db_status = check_db_connection()
    logger.info(f"Database initial health: {db_status}")
    yield
    # Application shutdown cleanup (if any)
    logger.info("Shutting down API application...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API with MySQL database connection and S3 media storage support.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"{settings.APP_NAME} is running",
        "env": settings.APP_ENV,
        "docs_url": "/docs",
    }

# Mount API Routers
app.include_router(api_router, prefix="/api")
