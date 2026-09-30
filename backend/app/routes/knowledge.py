"""Development-only endpoints for inspecting the knowledge base and
retrieval quality directly. Return counts/content useful for debugging
only — never filesystem paths, environment variables, or secrets.
"""

from fastapi import APIRouter

from app.schemas.knowledge import SearchRequest, SearchResponse, SearchResult
from app.services.knowledge_loader import load_knowledge_documents
from app.services.retrieval_service import retrieve
from app.services.text_splitter import split_into_chunks

router = APIRouter()


@router.get("/knowledge/status")
def knowledge_status() -> dict[str, int]:
    documents = load_knowledge_documents()
    chunk_count = sum(len(split_into_chunks(document)) for document in documents)
    return {
        "source_files": len(documents),
        "documents_loaded": len(documents),
        "chunks_generated": chunk_count,
    }


@router.post("/knowledge/search", response_model=SearchResponse)
def knowledge_search(request: SearchRequest) -> SearchResponse:
    """Development-only: tests raw retrieval quality directly, bypassing
    the chat endpoint's templated response."""
    chunks = retrieve(request.query)
    results = [
        SearchResult(content=chunk.content, source=chunk.source, score=round(1 - chunk.distance, 4))
        for chunk in chunks
    ]
    return SearchResponse(results=results)
