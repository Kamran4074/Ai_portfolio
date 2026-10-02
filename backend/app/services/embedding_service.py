"""Local all-MiniLM-L6-v2 embeddings on onnxruntime. No external API, no API key.

Same model as sentence-transformers, run through chromadb's bundled ONNX
build instead of PyTorch, which keeps the install ~1 GB smaller and the
process light enough for a 512 MB host. Vectors are normalized and inputs
truncated to 256 tokens, matching sentence-transformers output.

The model is loaded once per process (via lru_cache) and reused for every
embedding call, instead of being reloaded on each request.
"""

from functools import lru_cache

from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2


@lru_cache(maxsize=1)
def get_embedder() -> ONNXMiniLM_L6_V2:
    # Downloads the model to ~/.cache/chroma on first use only (done at
    # image build time by the ingest script); later loads read from disk.
    return ONNXMiniLM_L6_V2()


def embed_texts(texts: list[str]) -> list[list[float]]:
    return [[float(x) for x in vector] for vector in get_embedder()(texts)]


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
