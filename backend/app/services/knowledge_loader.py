"""Loads the Markdown knowledge base from backend/knowledge/.

Path is resolved relative to this file, not the process's working
directory, so it keeps working after the project is moved or run from a
different directory/machine.
"""

from dataclasses import dataclass
from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent.parent / "knowledge"

# Coarse, file-level provenance. Several files mix portfolio- and
# resume-sourced content inline (each block is labeled "Source: ..." in the
# Markdown text itself) — "mixed" flags that rather than picking one.
SOURCE_TYPES = {
    "profile": "mixed",
    "skills": "mixed",
    "education": "resume",
    "certifications": "resume",
    "experience": "mixed",
    "projects": "mixed",
    "repositories": "github",
    "contact": "portfolio",
    "chatbot_rules": "rules",
}


@dataclass(frozen=True)
class KnowledgeDocument:
    content: str
    source: str
    document_type: str
    source_type: str


def load_knowledge_documents(knowledge_dir: Path = KNOWLEDGE_DIR) -> list[KnowledgeDocument]:
    documents = []
    for path in sorted(knowledge_dir.glob("*.md")):
        content = path.read_text(encoding="utf-8").strip()
        if not content:
            continue
        documents.append(
            KnowledgeDocument(
                content=content,
                source=path.name,
                document_type=path.stem,
                source_type=SOURCE_TYPES.get(path.stem, "unspecified"),
            )
        )
    return documents
