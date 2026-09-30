"""Standalone verification for the knowledge loader + chunker.

Run from anywhere:
    python backend/scripts/verify_knowledge.py
or from inside backend/:
    python scripts/verify_knowledge.py
"""

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.services.knowledge_loader import KNOWLEDGE_DIR, load_knowledge_documents  # noqa: E402
from app.services.text_splitter import split_into_chunks  # noqa: E402

EXPECTED_FILES = {
    "profile.md",
    "skills.md",
    "education.md",
    "certifications.md",
    "experience.md",
    "projects.md",
    "repositories.md",
    "contact.md",
    "chatbot_rules.md",
}


def main() -> None:
    found_files = {p.name for p in KNOWLEDGE_DIR.glob("*.md")}
    missing = EXPECTED_FILES - found_files
    assert not missing, f"Missing expected knowledge files: {missing}"

    documents = load_knowledge_documents()
    assert documents, "No documents were loaded"
    assert len(documents) == len(EXPECTED_FILES), (
        f"Expected {len(EXPECTED_FILES)} documents, loaded {len(documents)}"
    )

    total_chunks = 0
    repositories_found: set[str] = set()
    for document in documents:
        assert document.content, f"{document.source} loaded empty"
        assert document.source, "Document missing source metadata"
        assert document.document_type, "Document missing document_type metadata"
        assert document.source_type, "Document missing source_type metadata"

        chunks = split_into_chunks(document)
        assert chunks, f"{document.source} produced no chunks"

        chunk_ids = [chunk.chunk_id for chunk in chunks]
        expected_ids = [f"{document.document_type}-{i}" for i in range(len(chunks))]
        assert chunk_ids == expected_ids, "Chunk ids are not sequential/deterministic"
        assert len(chunk_ids) == len(set(chunk_ids)), "Duplicate chunk ids found"
        for chunk in chunks:
            assert chunk.source == document.source, "Chunk lost source metadata"
            assert chunk.source_type == document.source_type, "Chunk lost source_type metadata"
            if chunk.repository:
                repositories_found.add(chunk.repository)

        # Determinism: chunking the same document twice must give identical output.
        repeat_chunks = split_into_chunks(document)
        assert [c.content for c in chunks] == [c.content for c in repeat_chunks], (
            f"Chunking of {document.source} is not deterministic"
        )

        total_chunks += len(chunks)

    assert repositories_found, "No repository names were extracted from repositories.md chunks"

    print(f"Knowledge dir: {KNOWLEDGE_DIR}")
    print(f"Source files found: {len(found_files)}")
    print(f"Documents loaded: {len(documents)}")
    print(f"Chunks generated: {total_chunks}")
    for document in documents:
        chunks = split_into_chunks(document)
        print(f"  - {document.source} [{document.source_type}]: {len(chunks)} chunk(s)")
    print(f"Repository names extracted: {sorted(repositories_found)}")
    print("All knowledge ingestion checks passed.")


if __name__ == "__main__":
    main()
