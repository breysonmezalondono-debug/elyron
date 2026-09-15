import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router as api_router
from app.config import settings
from app.services.openai_service import AIService

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    ai_service = AIService()
    app.state.ai_service = ai_service
    logger.info("Servicio de IA inicializado | model=%s", settings.openai_model)
    yield
    await ai_service.close()
    logger.info("Servicio de IA cerrado")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend de IA compatible con proveedores OpenAI-compatible (Groq, OpenAI, xAI).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "model": settings.openai_model}


@app.get("/", include_in_schema=False)
async def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(api_router, prefix=settings.api_v1_prefix)
