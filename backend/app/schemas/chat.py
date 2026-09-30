from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(..., min_length=1, max_length=1000)


class SourceInfo(BaseModel):
    source: str
    repository: str | None = None


class ChatResponse(BaseModel):
    reply: str
    sources: list[SourceInfo] = []
