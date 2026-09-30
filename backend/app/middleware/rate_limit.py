"""In-memory, per-process rate limiting for POST /chat.

State is a plain dict living in this process's memory. That is only
correct for a single-instance deployment: it resets on every restart and
is NOT shared across multiple worker processes or multiple machines. If
this app is ever run with multiple Uvicorn/Gunicorn workers or scaled
horizontally, this stops providing a real limit (each process/instance
gets its own independent budget) and should be replaced with a shared
store (e.g. Redis) — deliberately out of scope for this phase.

Used as a FastAPI dependency so it applies only to the route(s) that
declare it (POST /chat), not globally to every endpoint like /health.
"""

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request, status

from app.config import RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_SECONDS

_lock = Lock()
_requests: dict[str, deque[float]] = defaultdict(deque)

RATE_LIMIT_MESSAGE = (
    "You're sending messages a little too quickly. Please try again in a moment."
)


def _client_key(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(request: Request) -> None:
    key = _client_key(request)
    now = time.monotonic()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS

    with _lock:
        timestamps = _requests[key]
        while timestamps and timestamps[0] < cutoff:
            timestamps.popleft()

        if len(timestamps) >= RATE_LIMIT_MAX_REQUESTS:
            retry_after = max(1, int(timestamps[0] + RATE_LIMIT_WINDOW_SECONDS - now))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=RATE_LIMIT_MESSAGE,
                headers={"Retry-After": str(retry_after)},
            )

        timestamps.append(now)
