from pydantic import BaseModel, ConfigDict, Field


class SearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    query: str = Field(..., min_length=1, max_length=500)


class SearchResult(BaseModel):
    content: str
    source: str
    score: float  # cosine similarity, higher = more relevant (1 - distance)


class SearchResponse(BaseModel):
    results: list[SearchResult]
