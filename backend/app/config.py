"""Single source of truth for embedding/vector-store/retrieval/LLM settings.

The GEMINI_API_KEY value itself is read from the environment (via a local
.env file, never committed) — this module only reads it, it never
hardcodes a secret. Paths are resolved relative to this file so the
project keeps working after being moved or copied to another machine.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

CHROMA_PERSIST_DIR = BACKEND_DIR / "data" / "chroma"
CHROMA_COLLECTION_NAME = "portfolio_knowledge"

# Retrieval defaults. Change these here, not in the services that use them.
# (Raised from an initial 4 to 6 after testing showed some correct chunks
# ranking 5th-7th nearest for certain queries — see backend/README.md.)
TOP_K = 6

# Chroma collection is configured for cosine distance (0 = identical text,
# 2 = maximally dissimilar). Chunks farther than this are treated as not
# relevant enough to surface. See backend/README.md for how this value was
# picked from actual test-query results.
RETRIEVAL_DISTANCE_THRESHOLD = 0.75

# Gemini. The key is read from the environment only — never hardcoded,
# never logged. GEMINI_API_KEY is unset by default so the app can still
# start and serve retrieval-only responses without it configured.
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")
# Tried in order when the primary model fails (503 "high demand", 429,
# timeout, retired model, ...). Comma-separated; empty disables fallback.
GEMINI_FALLBACK_MODELS = [
    model.strip()
    for model in os.environ.get(
        "GEMINI_FALLBACK_MODELS", "gemini-flash-lite-latest,gemini-3.1-flash-lite"
    ).split(",")
    if model.strip() and model.strip() != GEMINI_MODEL
]
# Per attempt, not per request — kept short so a stalled model fails over
# to the next one instead of leaving the visitor waiting.
GEMINI_TIMEOUT_MS = 10_000

# CORS. Comma-separated in the env var so production can list a real
# frontend domain later without a code change. Defaults to the local Vite
# dev server only — never "*".
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
    if origin.strip()
]

# "production" disables development-only endpoints (POST /knowledge/search,
# GET /knowledge/status) and is where future deploy configs would tighten
# things further. Defaults to development so local `uvicorn ... --reload`
# keeps working without extra setup.
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
IS_PRODUCTION = ENVIRONMENT == "production"

# Rate limiting for POST /chat. In-memory, per-process — see
# app/middleware/rate_limit.py docstring for why that's the right scope
# for a single-instance deployment and what changes if that stops being
# true later.
RATE_LIMIT_MAX_REQUESTS = int(os.environ.get("RATE_LIMIT_MAX_REQUESTS", "10"))
RATE_LIMIT_WINDOW_SECONDS = int(os.environ.get("RATE_LIMIT_WINDOW_SECONDS", "60"))

# Hard cap on raw request body size (bytes), enforced before JSON parsing,
# independent of the message-length validation in the Pydantic schema.
MAX_REQUEST_BODY_BYTES = 10_000
