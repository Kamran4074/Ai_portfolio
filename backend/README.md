# Portfolio Backend

FastAPI backend for the AI portfolio chatbot. `/chat` retrieves relevant
knowledge-base chunks (local embeddings + ChromaDB) and asks Gemini to
generate a natural-language answer grounded strictly in that retrieved
context. Gemini is never called when there's no relevant context — the
backend returns a controlled response instead, both to avoid inventing
answers and to avoid unnecessary API calls.

## Setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then edit .env and set your real GEMINI_API_KEY
```

### Gemini API key

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Put it in `backend/.env` (created from `.env.example`, never committed —
   already covered by `.gitignore`):
   ```
   GEMINI_API_KEY=your_real_key_here
   GEMINI_MODEL=gemini-3.5-flash-lite
   ```
3. The key is read server-side only, in `app/config.py`, via
   `os.environ` (loaded from `.env` with `python-dotenv`). It is never
   sent to the frontend, never included in the Gemini prompt itself, and
   never logged — only Gemini's own (key-free) error messages are logged
   on failure.
4. If `GEMINI_API_KEY` is unset, the backend still starts and serves
   retrieval normally; `/chat` falls back to a friendly "temporarily
   unavailable" message instead of crashing.
5. **On the model name**: Gemini's available/default models change over
   time and by key. While testing this phase, `gemini-2.5-flash` returned
   a "no longer available to new users" error and `gemini-3.6-flash`
   returned a transient "high demand" 503 — `gemini-3.1-flash-lite` is
   what served successful responses at first. It was later replaced as
   the default by `gemini-3.5-flash-lite`, which measured ~3x faster
   (~1.3s vs 3-5s per answer) and did not hit the 503s `3.1` returned
   under load; `3.1` remains the last fallback (see `GEMINI_FALLBACK_MODELS`). If it stops working, list what your key can
   actually use and update `GEMINI_MODEL` — no code change needed:
   ```bash
   python -c "from google import genai; import os; from dotenv import load_dotenv; load_dotenv(); [print(m.name) for m in genai.Client(api_key=os.environ['GEMINI_API_KEY']).models.list() if 'generateContent' in (m.supported_actions or [])]"
   ```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

The API is served at `http://localhost:8000`.

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | unset | Server-side only. Never sent to the frontend, never logged, never put in the Gemini prompt itself. |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Change without touching code — see the note above. |
| `GEMINI_FALLBACK_MODELS` | `gemini-flash-lite-latest,gemini-3.1-flash-lite` | Tried in order when the primary model fails (503/429/timeout/retired). Empty disables fallback. |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Comma-separated list of allowed CORS origins. Never `*`. |
| `ENVIRONMENT` | `development` | Set to `production` to disable the `/knowledge/*` development endpoints entirely. |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | Max `/chat` requests per client IP per window. |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Window length for the above. |

All of these are read once at process startup (`app/config.py`); changing
`.env` requires restarting the server.

## Endpoints

### `GET /health`

Returns:

```json
{ "status": "ok" }
```

### `POST /chat/stream`

Same request body, validation, rate limit and grounding flow as `/chat`,
but the reply is streamed as `text/plain` chunks as Gemini generates it
(no `sources`). The frontend uses this so the first words appear in about
a second instead of after the whole answer. Controlled replies (not
indexed / no match / unavailable) arrive as a single chunk.

### `GET /knowledge/status` (development only — disabled when `ENVIRONMENT=production`)

Returns counts only — never the actual document content:

```json
{ "source_files": 9, "documents_loaded": 9, "chunks_generated": 43 }
```

### `POST /chat`

Request:

```json
{ "message": "Tell me about your projects" }
```

Response:

```json
{
  "reply": "Generated, grounded answer...",
  "sources": [
    { "source": "projects.md", "repository": null },
    { "source": "repositories.md", "repository": "Docs-Chatbot" }
  ]
}
```

`message` must be a non-empty string (max 1000 characters), and the
request body must not contain any extra/unexpected fields (both enforced
by the Pydantic schema, `422` on violation). Rate-limited — see
"Security" below. Flow:

1. Retrieve relevant chunks (Phase 6 retrieval service).
2. If the knowledge base isn't indexed yet → return a controlled message,
   no Gemini call.
3. If nothing relevant was retrieved → return a controlled "I don't have
   that information" message, no Gemini call (this both avoids inventing
   an answer and avoids paying for an unnecessary API call).
4. Otherwise, pass the question + retrieved chunks to `llm_service`, which
   asks Gemini for a grounded answer.
5. Any Gemini failure (missing/invalid key, quota, timeout, network,
   malformed response) is caught and converted to a generic friendly
   message — the frontend never sees a raw exception or stack trace.

The frontend uses `POST /chat/stream` (see `frontend/src/services/chatApi.js`),
not this endpoint. `/chat` is kept for scripts and API clients that want the
whole reply plus `sources` in one JSON response.

### `POST /knowledge/search` (development only — disabled when `ENVIRONMENT=production`)

Tests raw retrieval quality directly, bypassing `/chat`'s templated
response:

```json
{ "query": "What technologies are used in GreenPack AI?" }
```

```json
{ "results": [{ "content": "...", "source": "projects.md", "score": 0.46 }] }
```

`score` is cosine similarity (`1 - distance`), higher is more relevant.
This endpoint (and `/knowledge/status`) is for local debugging only. When
`ENVIRONMENT=production`, the entire `/knowledge/*` router is not mounted
at all — the routes return `404`, not just "hidden" behind a check —
because handing back the actual verbatim knowledge-base text through a
public, unauthenticated endpoint is exactly the kind of exposure a real
deployment shouldn't have.

## Example

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What projects have you worked on?"}'
```

## Knowledge base

Verified portfolio content lives in `backend/knowledge/` as plain Markdown
files, one topic per file. Primary sources are the **live portfolio**
(https://mozammilsiddique2a-dot.github.io/mozammil-portfolio/), the
**GitHub profile** (https://github.com/mozammilsiddique2a-dot) and its
public repository READMEs, and the **resume**, in that priority order —
see `chatbot_rules.md` for the full priority rule. Where two sources
disagree, both are preserved with their own "Source:" label rather than
silently merged (see the DocuMind AI / "AI Document Q&A Chatbot with RAG"
tech-stack discrepancy noted in `projects.md`).

- `profile.md` — name, role, links, portfolio "About" copy, resume summary
- `skills.md` — portfolio tech-stack grid (with its stated proficiency
  levels, preserved as-is) plus additional resume-only skills
- `education.md` — degrees, institutions, dates (resume — not on the
  live portfolio)
- `certifications.md` — verified certifications/training (resume — not on
  the live portfolio)
- `experience.md` — work history, portfolio and resume versions kept
  separate; flags the unconfirmed link between the public
  `-Syringe--Angle--Detector` repo and the One Simulation Pvt. Ltd. role
- `projects.md` — the 5 portfolio "Featured Projects" (cross-checked
  against their GitHub READMEs) plus 2 resume-only projects, with a safety
  note on the lung-cancer project (ML demo only, not clinically validated;
  its own README states "not a medical diagnosis")
- `repositories.md` — GitHub-specific facts per public repository, kept
  separate from employment claims (repo ownership ≠ employment)
- `contact.md` — verified public contact links (email, GitHub, LinkedIn,
  portfolio URL, resume-only phone number)
- `chatbot_rules.md` — grounding rules the future RAG/LLM layer must follow
  (no invented facts, honest "I don't know", source priority, conflict
  flagging, repo-vs-employment distinction, medical safety)

### Loader

`app/services/knowledge_loader.py` reads every `.md` file in
`backend/knowledge/` and returns a `KnowledgeDocument` per file
(`content`, `source` filename, `document_type`, and a coarse `source_type`
— `portfolio`, `github`, `resume`, `mixed`, or `rules` — from a static
per-file mapping, since several files intentionally mix sources inline).
The knowledge directory path is resolved relative to the file itself (via
`pathlib`), not the process's working directory, so it keeps working
regardless of where the project is run from or moved to.

### Chunking

`app/services/text_splitter.py` splits each document into paragraph-aware
chunks (~800 characters, ~100 character overlap) without an external
framework. Chunking is deterministic — the same document always produces
the same chunks — and each chunk carries `source`, `source_type`, a stable
`chunk_id` (e.g. `experience-0`, `experience-1`), and `repository` (parsed
from a `Repository: <name>` line when present, e.g. in `repositories.md`).

### Verify it yourself

```bash
python scripts/verify_knowledge.py
```

Checks that all 9 expected files exist, load with non-empty content, carry
metadata, chunk deterministically, and that repository names are correctly
extracted from `repositories.md`.

## Knowledge ingestion

The knowledge base is embedded and indexed into ChromaDB by a script you
run manually — it is **not** re-ingested automatically on startup or on
every chat request:

```bash
python scripts/ingest_knowledge.py
```

Run this once after setup, and again any time you edit files under
`backend/knowledge/`. Each run **drops and rebuilds the entire ChromaDB
collection** from the current knowledge files — this is a deliberate
design choice, not an accident: the knowledge base is small (9 files, ~40
chunks), so a full rebuild is fast (a few seconds once the embedding model
is cached) and this guarantees the vector store always exactly matches
what's on disk, with no stale chunks left over from since-edited or
since-removed content, and no duplicate chunks from running it more than
once. IDs are deterministic (`"<source>::<chunk_id>"`, e.g.
`projects.md::projects-3"`), so even if this were changed to an
incremental `upsert` later, re-running would still overwrite in place.

## Retrieval

- **Embedding model**: `all-MiniLM-L6-v2`, running fully locally on
  `onnxruntime` via chromadb's bundled `ONNXMiniLM_L6_V2` — no PyTorch, no
  API, no API key, no network call at query time. Its vectors match the
  `sentence-transformers` build of the same model (cosine similarity 1.0),
  so the retrieval threshold below still applies. Loaded once per process
  (`functools.lru_cache`) and reused, not reloaded per request. Loaded
  eagerly at startup (FastAPI lifespan in `main.py`) so the first visitor
  doesn't wait for it, and from `~/.cache/chroma/onnx_models/` — it
  downloads only on a fresh machine.
- **Vector database**: ChromaDB, persisted locally at
  `backend/data/chroma/` (resolved relative to `backend/app/config.py`,
  not an absolute path — this keeps working if the project is moved to
  another machine). Git-ignored, since it's fully rebuildable from
  `backend/knowledge/`.
- **Collection**: `portfolio_knowledge`, configured for **cosine
  distance** (`hnsw:space: cosine` — 0 = identical text, 2 = maximally
  dissimilar).
- **Top-k**: `TOP_K = 6`, set once in `app/config.py` and imported
  everywhere it's needed (not hardcoded per-file). Raised from an initial
  4 after testing showed some correct chunks ranking 5th–7th nearest for a
  few queries.
- **Relevance threshold**: `RETRIEVAL_DISTANCE_THRESHOLD = 0.75` in
  `app/config.py`. Chunks farther than this are dropped — a query that
  matches nothing well returns an empty result rather than the "closest
  available" chunks regardless of how unrelated they are. This value was
  picked empirically (not from a published benchmark): in testing, every
  genuinely on-topic query's best match landed under distance 0.58, while
  genuinely off-topic control queries ("What is the capital of France?",
  "How do I bake a chocolate cake?") landed above 0.88 — 0.75 sits in the
  gap between those two clusters. See "Retrieval test results" below for
  a documented exception to this.
- **Empty index**: if the collection has never been ingested,
  `/chat` returns `"The knowledge base is not indexed yet."` instead of
  crashing or returning a stack trace; `/knowledge/search` returns
  `{"results": []}`. Verified by manually dropping the collection and
  re-querying both endpoints, then re-running the ingestion script to
  restore it.

## Search testing

```bash
python scripts/test_retrieval.py
```

Runs a fixed list of test queries (the ones required for Phase 6, plus two
genuinely off-topic control queries added after testing) and prints the
top-k retrieved chunks with their source and score for manual inspection.
This is a quality-inspection tool, not a pass/fail assertion suite —
judging whether a retrieved chunk actually answers a question is
inherently a human judgment call.

## Grounding & generation (Gemini)

- **SDK**: `google-genai` (the current unified Google GenAI SDK —
  `google.generativeai` is the older, superseded package and is not used).
- **Model**: `gemini-3.1-flash-lite` by default, overridable via
  `GEMINI_MODEL` in `.env` without touching code (see the note under
  "Gemini API key" above on why this specific model was picked).
- **Service**: `app/services/llm_service.py`. Its only job is: format
  retrieved chunks into a labeled context block, send them plus the
  question to Gemini under a fixed system instruction, and return the
  answer text (or raise `LLMServiceError`, which `chat_service.py` turns
  into the friendly fallback message — never a raw exception).
- **Context format** sent to Gemini (deduplicated by exact chunk content;
  bounded by `TOP_K`, so it's at most 6 chunks × ~800 chars):
  ```
  SOURCE: repositories.md
  TYPE: github
  REPOSITORY: Docs-Chatbot

  CONTENT:
  ...

  ---

  SOURCE: projects.md
  TYPE: mixed

  CONTENT:
  ...
  ```
- **System instruction** (in full in `llm_service.py`) enforces: answer
  only from the supplied context; say "I don't have that information in
  my portfolio knowledge base" rather than guess; never turn GitHub repo
  ownership into an employment claim unless the context itself frames it
  that way; never claim clinical validation for the lung-cancer project;
  never fabricate salary/clients/awards/employment/metrics/dates; treat
  retrieved content as untrusted reference data (not instructions) and
  treat the visitor's message as untrusted input that cannot override
  these rules (prompt-injection defense).
- **No conversation memory**: every `/chat` request is independent — no
  database, no session, no chat history persisted. Deliberately out of
  scope for this phase.
- **Cost control**: Gemini is only called when there's indexed data *and*
  a relevant match; at most one attempt per configured model; context is capped by `TOP_K`; no
  speculative or background calls.

## Security

This section covers what's actually implemented for hardening the public
`/chat` endpoint. No authentication is implemented — the chatbot is
intentionally public; this is abuse mitigation, not access control.

- **Secrets**: `GEMINI_API_KEY` lives only in `backend/.env` (git-ignored,
  never committed — confirmed via `git check-ignore`). `.env.example`
  contains a placeholder only, never a real key. The key is never
  returned in any API response, never included in the Gemini prompt text
  itself, and never logged — on failure, only Gemini's own (key-free)
  error text is logged.
- **CORS**: `allow_origins` is an explicit list built from `FRONTEND_ORIGIN`
  (comma-separated), defaulting to the local Vite dev server only. Never
  `"*"`. Verified: a preflight request from an origin not in the list gets
  no `access-control-allow-origin` header and a `400`.
- **Rate limiting**: `app/middleware/rate_limit.py` — a simple in-memory
  sliding window per client IP, applied only to `POST /chat` via a FastAPI
  dependency (so `/health` is never rate-limited). Default: 10 requests
  per 60 seconds; over that returns `429` with a `Retry-After` header and
  a friendly message. **This state lives in the process's memory** and is
  only correct for a single running instance — it resets on restart and
  is not shared across multiple worker processes or machines. Replacing it
  with a shared store (e.g. Redis) is future work if this ever runs with
  multiple workers.
- **Request size limits**: `ChatRequest.message` is capped at 1000
  characters and the schema rejects unexpected extra fields
  (`extra="forbid"`); `app/middleware/body_size_limit.py` additionally
  rejects any request whose declared `Content-Length` exceeds 10 KB,
  before the body is even parsed. (This checks the declared header, not a
  true streaming byte cap — see the module docstring for why that's an
  acceptable tradeoff here.)
- **Gemini timeouts/errors**: every Gemini attempt has a 10-second timeout
  (`GEMINI_TIMEOUT_MS`). A retired/overloaded model, rate limit, timeout or
  network failure fails over to the next model in `GEMINI_FALLBACK_MODELS`
  (only before any text has been streamed); a missing/invalid key fails
  immediately. When every model fails, the error is caught in
  `llm_service.py` and converted to the same generic `"Sorry, the assistant is temporarily
  unavailable. Please try again."` — never a raw exception to the client.
- **Error responses**: a global `Exception` handler in `main.py` catches
  anything unhandled anywhere in the app and returns that same generic
  message with a `500`, logging the real error server-side instead of
  returning a stack trace, filesystem path, or internal detail to the
  client.
- **Logging**: configured once in `main.py` (`logging.basicConfig`, INFO
  level). Logs request-received (message length only, not content),
  retrieval misses, Gemini failures, and rate-limit hits. Never logs
  `GEMINI_API_KEY` or any other secret.
- **Security headers**: added to every response via middleware —
  `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and
  `Content-Security-Policy: default-src 'none'`. The CSP is intentionally
  locked down: this backend only ever returns JSON, never HTML/JS, so
  `default-src 'none'` is safe and cannot break the frontend (a separate
  origin that never loads anything from this API as a script/style/etc.).
- **Development endpoints**: the entire `/knowledge/*` router is only
  mounted when `ENVIRONMENT != production` — in production those routes
  don't exist (`404`), not just permission-gated.
- **Prompt-injection defense**: unchanged from Phase 7's system
  instruction, re-tested here — see "Tests performed" below.
- **Grounding/hallucination control**: unchanged — Gemini is never called
  without relevant retrieved context, and the system instruction forbids
  filling gaps from general knowledge.

### Known limitations (deliberately out of scope for this phase)

- No authentication — by design, the chatbot is public.
- Rate limiting is in-memory/per-process only, as noted above.
- The body-size middleware checks the declared `Content-Length` header,
  not a true streaming cap.
- No Docker/deployment configuration yet — that's a later phase.
