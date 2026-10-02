# Mozammil Siddique — AI Portfolio

A personal portfolio site with a built-in AI assistant that answers visitors'
questions about Mozammil's projects, skills, experience and education.

The assistant uses retrieval-augmented generation (RAG). It finds the relevant
parts of a small Markdown knowledge base and asks Gemini to answer **only**
from them. If the knowledge base doesn't cover a question, it says so instead
of guessing.

## Features

- Portfolio site with a home page and a projects page (React + Vite + Tailwind CSS)
- Chat widget with streamed replies, so the first words appear in about a second
- Answers grounded in `backend/knowledge/`, with no invented facts
- Local embeddings (`all-MiniLM-L6-v2`) and a ChromaDB vector store, so retrieval needs no API key
- Gemini generation with automatic fallback to backup models when one is overloaded
- Rate limiting, request size limits, a strict CORS allow-list, security headers and prompt-injection defense

## Tech stack

| Part | Stack |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Retrieval | all-MiniLM-L6-v2 (ONNX), ChromaDB |
| LLM | Google Gemini (`google-genai` SDK) |

## Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, middleware, startup warm-up
│   │   ├── config.py          # All settings, read from environment variables
│   │   ├── routes/            # /chat, /chat/stream, /knowledge/* (dev only)
│   │   ├── services/          # retrieval, embeddings, vector store, Gemini
│   │   ├── middleware/        # rate limit, body size limit
│   │   └── schemas/           # request/response models
│   ├── knowledge/             # Markdown knowledge base the assistant answers from
│   ├── scripts/               # ingestion and manual test scripts
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/        # NavBar, Hero, ChatWidget, ChatWindow, ...
    │   ├── pages/             # ProjectsPage
    │   ├── services/chatApi.js
    │   └── data/projects.js
    ├── package.json
    └── .env.example
```

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 20+
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
cp .env.example .env            # then put your real GEMINI_API_KEY in .env

python scripts/ingest_knowledge.py   # build the vector index (first run downloads the embedding model)
uvicorn app.main:app --reload --port 8000
```

Check it's running: `http://localhost:8000/health` should return `{"status":"ok"}`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env            # points the site at http://localhost:8000
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

Real values go in `.env` files, which are git-ignored. Only the `.env.example`
templates are committed.

**Backend** (`backend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | **Required.** Server-side only; never sent to the browser or logged. |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` | Primary model. |
| `GEMINI_FALLBACK_MODELS` | `gemini-flash-lite-latest,gemini-3.1-flash-lite` | Tried in order if the primary fails. |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed CORS origins, comma-separated. Set this to your deployed site's URL. |
| `ENVIRONMENT` | `development` | Set to `production` to disable the `/knowledge/*` debug endpoints. |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | Chat requests allowed per IP per window. |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Rate-limit window length. |

**Frontend** (`frontend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | URL of the backend. |

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/chat/stream` | `{"message": "..."}` → reply streamed as plain text (used by the site) |
| `POST` | `/chat` | `{"message": "..."}` → `{"reply": "...", "sources": [...]}` |
| `GET` | `/knowledge/status` | Knowledge-base counts (development only) |
| `POST` | `/knowledge/search` | Raw retrieval results (development only) |

## Updating the knowledge base

Edit or add Markdown files in `backend/knowledge/`, then rebuild the index:

```bash
cd backend
python scripts/ingest_knowledge.py
```

Each run rebuilds the whole index, so it always matches the files on disk.

## Deployment

- **Frontend:** Vercel (or any static host). Root directory `frontend`, build
  command `npm run build`, output directory `dist`. Set `VITE_API_BASE_URL` to
  the deployed backend URL.
- **Backend:** Render (free plan), built from `backend/Dockerfile`. The image
  has no PyTorch (embeddings run on onnxruntime), builds the vector index at
  build time and serves on port 7860, fitting in the free plan's 512 MB RAM.
  In the Render dashboard: *New → Web Service*, connect this GitHub repo, then:
  - root directory `backend`, language *Docker*, instance type *Free*
  - environment variables: `PORT=7860`, `GEMINI_API_KEY`,
    `ENVIRONMENT=production`, `FRONTEND_ORIGIN=<your frontend URL>`

  Every push to `main` then rebuilds and redeploys the backend.
- **Keep-alive (optional):** Render's free plan sleeps a service after 15
  minutes without traffic, so the next request waits while it wakes.
  `.github/workflows/keep-alive.yml` pings `/health` every 10 minutes once the
  `BACKEND_URL` repository variable is set. GitHub can delay scheduled runs;
  an external monitor such as UptimeRobot is more reliable.

## More detail

[backend/README.md](backend/README.md) covers the backend in depth: retrieval
tuning, the grounding rules, security measures and test results.
