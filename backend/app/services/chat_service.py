"""Chat flow: retrieve relevant knowledge, then ask Gemini for a grounded
answer. Gemini is only ever called when there is retrieved context — an
unindexed knowledge base or a query with no relevant match never reaches
the LLM, both to control cost and because there'd be nothing to ground on.
"""

import logging
from collections.abc import Iterator

from app.services.llm_service import LLMServiceError, generate_answer, generate_answer_stream
from app.services.retrieval_service import RetrievedChunk, is_indexed, retrieve

logger = logging.getLogger(__name__)

NOT_INDEXED_REPLY = (
    "The knowledge base is not indexed yet. Please try again once it has "
    "been built."
)

NO_MATCH_REPLY = (
    "I don't have that information in my portfolio knowledge base."
)

UNAVAILABLE_REPLY = (
    "Sorry, the assistant is temporarily unavailable. Please try again."
)


def _sources_from_chunks(chunks: list[RetrievedChunk]) -> list[dict]:
    seen: set[tuple[str, str | None]] = set()
    sources: list[dict] = []
    for chunk in chunks:
        repository = chunk.metadata.get("repository")
        key = (chunk.source, repository)
        if key in seen:
            continue
        seen.add(key)
        sources.append({"source": chunk.source, "repository": repository})
    return sources


def _retrieve_or_reply(message: str) -> tuple[list[RetrievedChunk], str | None]:
    """Returns (chunks, None) when Gemini should be called, or ([], reply)
    with a controlled reply when it shouldn't."""
    if not is_indexed():
        logger.warning("Chat request received but the knowledge base is not indexed yet")
        return [], NOT_INDEXED_REPLY

    chunks = retrieve(message)
    if not chunks:
        logger.info("Retrieval found no sufficiently relevant chunks; Gemini not called")
        return [], NO_MATCH_REPLY

    return chunks, None


def get_reply(message: str) -> tuple[str, list[dict]]:
    chunks, controlled_reply = _retrieve_or_reply(message)
    if controlled_reply is not None:
        return controlled_reply, []

    try:
        answer = generate_answer(message, chunks)
    except LLMServiceError as exc:
        logger.warning("Gemini generation failed: %s", exc)
        return UNAVAILABLE_REPLY, []

    return answer, _sources_from_chunks(chunks)


def get_reply_stream(message: str) -> Iterator[str]:
    """Same flow as get_reply, but yields answer text as it's generated so
    the visitor sees the first words in ~1s instead of waiting for all of it."""
    chunks, controlled_reply = _retrieve_or_reply(message)
    if controlled_reply is not None:
        yield controlled_reply
        return

    try:
        yield from generate_answer_stream(message, chunks)
    except LLMServiceError as exc:
        logger.warning("Gemini generation failed: %s", exc)
        yield UNAVAILABLE_REPLY
