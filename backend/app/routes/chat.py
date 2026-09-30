import logging

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.middleware.rate_limit import enforce_rate_limit
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import get_reply, get_reply_stream

logger = logging.getLogger(__name__)

router = APIRouter() 

@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(enforce_rate_limit)])
def chat(request: ChatRequest) -> ChatResponse:
    logger.info("Chat request received (message length=%d)", len(request.message))
    reply, sources = get_reply(request.message)
    return ChatResponse(reply=reply, sources=sources)


@router.post("/chat/stream", dependencies=[Depends(enforce_rate_limit)])
def chat_stream(request: ChatRequest) -> StreamingResponse:
    """Same answer as POST /chat, streamed as plain-text chunks."""
    logger.info("Streaming chat request received (message length=%d)", len(request.message))
    return StreamingResponse(
        get_reply_stream(request.message),
        media_type="text/plain; charset=utf-8",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
