"""Local sentence-transformers embeddings. No external API, no API key.

The model is loaded once per process (via lru_cache) and reused for every
embedding call, instead of being reloaded on each request.
"""

from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.config import EMBEDDING_MODEL_NAME


@lru_cache(maxsize=1)
def get_embedder() -> SentenceTransformer:
    # Load from the local HF cache first: without local_files_only the
    # library checks the Hub over the network on every load, which added
    # seconds to startup. Only a fresh machine falls through to a download.
    try:
        return SentenceTransformer(EMBEDDING_MODEL_NAME, local_files_only=True)
    except OSError:
        return SentenceTransformer(EMBEDDING_MODEL_NAME)


def embed_texts(texts: list[str]) -> list[list[float]]:
    return get_embedder().encode(texts, show_progress_bar=False).tolist()


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
