import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import FRONTEND_ORIGINS, IS_PRODUCTION
from app.middleware.body_size_limit import BodySizeLimitMiddleware
from app.routes.chat import router as chat_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the embedding model and touch the vector store before serving,
    # so the first visitor doesn't pay the multi-second model load.
    from app.services.embedding_service import embed_query
    from app.services.vector_store import is_indexed

    embed_query("warm-up")
    logger.info("Embedding model loaded; knowledge base indexed=%s", is_indexed())
    yield


app = FastAPI(title="Portfolio AI Backend", lifespan=lifespan)

app.add_middleware(BodySizeLimitMiddleware)

# Never "*" — a configurable, explicit allow-list only. Defaults to the
# local Vite dev server; a real production frontend origin is added later
# via the FRONTEND_ORIGIN env var, not hardcoded here.
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Frame-Options"] = "DENY"
    # This backend only ever returns JSON, never HTML/JS — a locked-down
    # CSP is safe here and cannot break the frontend, which is a separate
    # origin (the Vite dev server / its own future static host) and never
    # renders anything served by this API.
    response.headers["Content-Security-Policy"] = "default-src 'none'"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        {"detail": "Sorry, the assistant is temporarily unavailable. Please try again."},
        status_code=500,
    )


app.include_router(chat_router)

if not IS_PRODUCTION:
    from app.routes.knowledge import router as knowledge_router

    app.include_router(knowledge_router)
    logger.info("Development-only /knowledge endpoints are enabled (ENVIRONMENT != production).")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
