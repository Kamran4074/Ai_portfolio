"""Builds the ChromaDB vector store from backend/knowledge/.

Safe to run repeatedly: every run DROPS and REBUILDS the collection from
the current knowledge files, so the vector store always exactly matches
what's on disk right now — no stale chunks from removed content, no
duplicate chunks from re-running. This is a deliberate design choice for
simplicity: the knowledge base is small (a handful of Markdown files), so a
full rebuild is fast and there's no need for incremental/diffed ingestion.

Run:
    python scripts/ingest_knowledge.py
or:
    python backend/scripts/ingest_knowledge.py
"""

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.services.embedding_service import embed_texts  # noqa: E402
from app.services.knowledge_loader import load_knowledge_documents  # noqa: E402
from app.services.text_splitter import split_into_chunks  # noqa: E402
from app.services.vector_store import reset_collection, upsert_chunks  # noqa: E402


def build_metadata(document, chunk) -> dict:
    metadata = {
        "source": chunk.source,
        "source_type": chunk.source_type,
        "document_type": document.document_type,
        "chunk_id": chunk.chunk_id,
    }
    if chunk.repository:
        metadata["repository"] = chunk.repository
    return metadata


def main() -> None:
    documents = load_knowledge_documents()
    if not documents:
        print("No knowledge documents found in backend/knowledge/ — nothing to ingest.")
        return

    ids: list[str] = []
    texts: list[str] = []
    metadatas: list[dict] = []

    for document in documents:
        for chunk in split_into_chunks(document):
            # Deterministic ID: same chunk always gets the same ID, so
            # upsert overwrites in place instead of duplicating.
            ids.append(f"{chunk.source}::{chunk.chunk_id}")
            texts.append(chunk.content)
            metadatas.append(build_metadata(document, chunk))

    print(f"Loaded {len(documents)} knowledge files, {len(texts)} chunks total.")
    print("Generating embeddings locally (first run downloads the model)...")
    embeddings = embed_texts(texts)

    print("Rebuilding the ChromaDB collection...")
    reset_collection()
    upsert_chunks(ids=ids, documents=texts, metadatas=metadatas, embeddings=embeddings)

    print(f"Indexed {len(ids)} chunks from {len(documents)} knowledge files.")


if __name__ == "__main__":
    main()
