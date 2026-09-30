"""Deterministic, paragraph-aware chunking for knowledge documents.

Kept intentionally simple (no external chunking framework) — the knowledge
base is a handful of short Markdown files, so this only needs to split on
blank-line paragraph boundaries and stitch in a small overlap for context.
"""

import re
from dataclasses import dataclass

from app.services.knowledge_loader import KnowledgeDocument

DEFAULT_CHUNK_SIZE = 800
DEFAULT_OVERLAP = 100

_REPOSITORY_LINE = re.compile(
    r"^#{0,3}\s*(?:Repository|GitHub repository)\s*:\s*`?([A-Za-z0-9._-]+)`?\s*$",
    re.MULTILINE | re.IGNORECASE,
)


@dataclass(frozen=True)
class Chunk:
    content: str
    source: str
    chunk_id: str
    source_type: str
    repository: str | None = None


def _overlap_prefix(text: str, overlap: int) -> str:
    if overlap <= 0 or not text:
        return ""
    tail = text[-overlap:]
    space_index = tail.find(" ")
    return tail[space_index + 1 :] if space_index != -1 else tail


def _extract_repository(text: str) -> str | None:
    match = _REPOSITORY_LINE.search(text)
    return match.group(1) if match else None


def split_into_chunks(
    document: KnowledgeDocument,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_OVERLAP,
) -> list[Chunk]:
    paragraphs = [p.strip() for p in document.content.split("\n\n") if p.strip()]

    raw_chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}" if current else paragraph
        if not current or len(candidate) <= chunk_size:
            current = candidate
        else:
            raw_chunks.append(current)
            current = paragraph
    if current:
        raw_chunks.append(current)

    chunks: list[Chunk] = []
    previous_tail = ""
    for index, text in enumerate(raw_chunks):
        # Joined with a paragraph break, not a bare space, so the carried-over
        # overlap reads as its own paragraph instead of fusing onto the next
        # chunk's first line (which would break line-anchored content).
        content = f"{previous_tail}\n\n{text}" if previous_tail else text
        chunks.append(
            Chunk(
                content=content.strip(),
                source=document.source,
                chunk_id=f"{document.document_type}-{index}",
                source_type=document.source_type,
                repository=_extract_repository(content),
            )
        )
        previous_tail = _overlap_prefix(text, overlap)

    return chunks
