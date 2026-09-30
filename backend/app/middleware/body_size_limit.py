"""Rejects requests whose declared body size exceeds MAX_REQUEST_BODY_BYTES
before they reach route handlers or Pydantic validation. Defense in depth
alongside the per-field length limit on ChatRequest.message — this catches
oversized payloads in general (e.g. junk in unexpected fields), not just
an overlong message string.

Checks the Content-Length header, which normal browser/fetch clients
always send for a JSON body. A client that omits Content-Length and
streams a large chunked body without it would not be caught here — a
fully streaming-safe cap would need to wrap the ASGI receive channel,
which isn't worth the added complexity for this project's scope. The
per-field validation in the request schemas remains the primary guard.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.config import MAX_REQUEST_BODY_BYTES


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                declared_size = int(content_length)
            except ValueError:
                declared_size = None
            if declared_size is not None and declared_size > MAX_REQUEST_BODY_BYTES:
                return JSONResponse({"detail": "Request body too large."}, status_code=413)
        return await call_next(request)
