"""ChromaDB wrapper: collection lifecycle, storing chunks, similarity search.

Kept independent of FastAPI routes and of the embedding model — callers
pass in already-computed embeddings. Persists locally under
backend/data/chroma/ (project-relative, not machine-specific), so it
survives process restarts but is safely git-ignored and rebuildable from
backend/knowledge/ via scripts/ingest_knowledge.py.
"""

import chromadb
from chromadb.errors import NotFoundError

from app.config import CHROMA_COLLECTION_NAME, CHROMA_PERSIST_DIR

CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)

_client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))


def get_collection():
    return _client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def reset_collection():
    """Drop and recreate the collection. Ingestion always starts from here
    for a clean rebuild — see scripts/ingest_knowledge.py for why."""
    try:
        _client.delete_collection(CHROMA_COLLECTION_NAME)
    except NotFoundError:
        pass
    return get_collection()


def is_indexed() -> bool:
    return get_collection().count() > 0


def upsert_chunks(
    ids: list[str],
    documents: list[str],
    metadatas: list[dict],
    embeddings: list[list[float]],
) -> None:
    get_collection().upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas,
        embeddings=embeddings,
    )


def query(query_embedding: list[float], top_k: int):
    collection = get_collection()
    if collection.count() == 0:
        return None
    return collection.query(query_embeddings=[query_embedding], n_results=top_k)
