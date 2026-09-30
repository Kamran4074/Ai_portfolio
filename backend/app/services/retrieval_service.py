"""Turns a user query into ranked knowledge-base chunks via ChromaDB.

No LLM here — this only returns retrieved chunks. Phase 7 will feed these
into an LLM to generate the final grounded answer.
"""

from dataclasses import dataclass

from app.config import RETRIEVAL_DISTANCE_THRESHOLD, TOP_K
from app.services.embedding_service import embed_query
from app.services.vector_store import is_indexed
from app.services.vector_store import query as vector_query


@dataclass(frozen=True)
class RetrievedChunk:
    content: str
    source: str
    metadata: dict
    distance: float


def retrieve(user_query: str, top_k: int = TOP_K) -> list[RetrievedChunk]:
    """Returns relevant chunks, closest first. Empty list if the vector
    store isn't indexed yet, or if nothing cleared the relevance threshold."""
    query_embedding = embed_query(user_query)
    result = vector_query(query_embedding, top_k)
    if result is None:
        return []

    documents = result["documents"][0]
    metadatas = result["metadatas"][0]
    distances = result["distances"][0]

    chunks = []
    for content, metadata, distance in zip(documents, metadatas, distances):
        if distance > RETRIEVAL_DISTANCE_THRESHOLD:
            continue
        chunks.append(
            RetrievedChunk(
                content=content,
                source=metadata.get("source", "unknown"),
                metadata=metadata,
                distance=distance,
            )
        )
    return chunks


__all__ = ["RetrievedChunk", "retrieve", "is_indexed"]
