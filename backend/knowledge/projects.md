# Projects

The current live portfolio's "Featured Projects" section (source priority 1)
lists five projects. The resume separately lists two projects, one of which
overlaps in subject with a portfolio project but describes different
technology — that conflict is flagged explicitly below rather than merged.

## DocuMind AI — Production Multi-Document RAG Chatbot

Source: portfolio (verbatim) + GitHub repository `Docs-Chatbot` README.

Portfolio description: "Production-style multi-document RAG chatbot that
lets users upload PDF, DOCX, and TXT documents and ask grounded questions.
Implements document ingestion, chunking, local embeddings, vector
retrieval, source citations, conversation history, feedback, follow-up-aware
retrieval, and offline evaluation."

Portfolio tags: FastAPI, Streamlit, LangChain, ChromaDB, SQLite, Gemini,
Sentence Transformers.

GitHub repository details (Source: GitHub repository `Docs-Chatbot`,
README): backend is FastAPI (routes → services → repositories, with RAG
orchestration in `app/rag/`); frontend is Streamlit talking to the backend
only over HTTP; SQLite (via SQLAlchemy) is the authoritative store for
documents/conversations/messages/feedback; ChromaDB is a derived vector
index kept consistent with SQLite; embeddings use a local
`sentence-transformers` model (`all-MiniLM-L6-v2` by default, CPU by
default); the LLM is Google Gemini, used only for grounded-answer
generation and query rewriting, behind a provider interface. Answers cite
source documents, page numbers, and a relevance percentage, and explicitly
say when evidence is insufficient. Includes a deterministic, no-API-key
offline evaluation harness that reports retrieval hit rate, Precision@K,
and citation validity.

**Source conflict — flagged, not resolved:** the README does not mention
LangChain anywhere; the portfolio's tag list includes LangChain. Also, the
resume's separate "AI Document Q&A Chatbot with RAG" project entry (below)
describes the same general subject (a RAG document Q&A system) but states
OpenAI API instead of Gemini as the LLM. It is unclear whether the resume
entry and this portfolio/GitHub project are the same underlying project
described at different times/levels of detail, or genuinely different
projects. Both are preserved separately rather than silently merged.

## GreenPack AI — EPR Compliance AI Service

Source: portfolio (verbatim) + GitHub repository `greenpack-ai-service-`
README.

Portfolio description: "AI-powered EPR compliance backend that processes
monthly plastic declarations, reconciles them against ERP procurement data,
and provides compliance Q&A through a local RAG pipeline."

Portfolio tags: FastAPI, Python, Ollama, Llama 3, FAISS, Sentence
Transformers, SQLite, SQLAlchemy.

GitHub repository details (Source: GitHub repository
`greenpack-ai-service-`, README): three endpoints — `POST /submit`
(declaration, no LLM), `GET /summary/{producer_id}/{month}` (ERP
reconciliation + LLM-written narrative), `POST /ask` (RAG compliance Q&A).
Validation, reconciliation math, and flagging run in Python; the LLM
(Ollama, local `llama3`) only writes human-readable text from structured
facts. Reconciliation flags a submission when declared vs. procured
quantities differ by more than 5%. RAG pipeline: local `.txt` policy
documents → section-aware chunking → `sentence-transformers` embeddings →
FAISS `IndexFlatIP` similarity search (top 5, score ≥ 0.35) → Ollama llama3
answer with citations; explicitly returns "I do not know based on the
provided documents" for unknown topics rather than guessing. Built for a
described screening/take-home scenario ("GreenPack Industries"); the RAG
corpus is explicitly mock policy text for demonstration, not legal advice.

No conflicts found between the portfolio description and the README for
this project.

## AI-First CRM HCP — Healthcare CRM with AI-assisted logging

Source: portfolio (verbatim) + GitHub repository `AI-First-CRM-HCP` README.

Portfolio description: "Full-stack AI-powered healthcare CRM module for
managing Healthcare Professional interactions, with AI-assisted logging,
automatic form autofill, interaction search, summaries, and follow-up
suggestions."

Portfolio tags: React, TypeScript, FastAPI, PostgreSQL, LangGraph, Groq,
SQLAlchemy.

GitHub repository details (Source: GitHub repository `AI-First-CRM-HCP`,
README): frontend is React + Redux Toolkit + TypeScript + Material UI +
Vite; backend is FastAPI + SQLAlchemy + Alembic migrations; database is
PostgreSQL (Neon-compatible); AI layer is LangGraph with Groq LLM inference
(`gemma2-9b-it` primary model, `llama-3.1-8b-instant` fallback). The AI
assistant classifies intent, extracts structured fields from a natural
language note about an HCP interaction, persists it, and returns JSON that
autofills the React form. REST endpoints exist for health check, the
LangGraph assistant chat, and full CRUD on HCP interactions.

No conflicts found between the portfolio description and the README for
this project.

## Syringe Angle Detector — Real-time Computer Vision system

Source: portfolio (verbatim) + GitHub repository `-Syringe--Angle--Detector`
README.

Portfolio description: "Real-time Computer Vision system for syringe
detection and angle measurement using YOLOv8. Detects syringes from camera
input, calculates angle, smooths readings, and provides real-time
confidence and safety indicators."

Portfolio tags: Python, YOLOv8, OpenCV, Computer Vision.

GitHub repository details (Source: GitHub repository
`-Syringe--Angle--Detector`, README): real-time YOLOv8-based detection with
angle measurement (0–90°), moving-average angle smoothing, a 0–30° "optimal"
target range with color-coded zones (green/yellow/red), a confidence score
and live confidence bar, screenshot capture, a headless mode for server
deployment, and YAML-based configuration (model path, camera settings,
detection thresholds). Includes a training notebook
(`notebooks/Syringe_Training.ipynb`) and a pytest test suite. The README
itself states: "This application is designed for educational and research
purposes. Always follow proper medical guidelines and regulations for
actual medical procedures."

See the note in experience.md about the unconfirmed relationship between
this public repository and the One Simulation Pvt. Ltd. employment
project of the same subject — they are not asserted to be the same project.

## SHL Assessment Recommender — Conversational recommendation API

Source: portfolio (verbatim) + GitHub repository
`shl-conversational-recommender` README.

Portfolio description: "Conversational assessment recommendation API that
recommends relevant SHL Individual Test Solutions based on user
requirements and conversational context."

Portfolio tags: Python, FastAPI, REST API, Docker.

GitHub repository details (Source: GitHub repository
`shl-conversational-recommender`, README): built for the "SHL AI Intern
take-home assignment." Stateless `POST /chat` API — the full conversation
history is sent with each request; recommendations are pulled only from a
local catalog (`app/data/catalog.json`), never invented; vague requests get
one clarification question instead of recommendations; off-topic, legal,
general hiring-advice, and prompt-injection requests are refused. Does not
require a paid LLM API. Deployed publicly at
`https://shl-conversational-recommender-jnu1.onrender.com`.

No conflicts found between the portfolio description and the README for
this project.

---

## Resume-only projects

These two projects appear on the resume but are not in the current
portfolio's "Featured Projects" section.

### AI Document Q&A Chatbot with RAG (Source: resume, verbatim)

Technologies: Python, LangChain, OpenAI API, LLM, RAG, Vector Database.

- Built a RAG pipeline with LangChain and the OpenAI API for intelligent
  Q&A over PDF/text documents.
- Implemented document chunking, embeddings, and vector search.
- Used prompt engineering to improve response accuracy.

See the flagged conflict under "DocuMind AI" above — this resume entry may
or may not refer to the same underlying project; the technology stack
described here (OpenAI API, no ChromaDB/Gemini mentioned) does not match
the `Docs-Chatbot` GitHub repository's actual README.

### Lung Cancer Detection Using Machine Learning

Resume description (Source: resume, verbatim). Technologies: Python,
Scikit-learn, Pandas, NumPy, Matplotlib, Jupyter Notebook.

- Built a classification model to detect lung cancer from imaging/clinical
  data, evaluated using accuracy, precision, recall, and F1-score.
- Performed data preprocessing and feature engineering; created
  visualizations.

GitHub repository details (Source: GitHub repository
`lung_cancer_predection`, README — this adds implementation detail beyond
the resume, it does not contradict it): the deployed system is a full demo
web app — a React + Vite frontend form collects patient risk factors, a
FastAPI backend runs a saved Scikit-learn pipeline, and a predicted
likelihood is returned. Offline training scripts
(`preprocess.py` → `train_models.py` → `package_model.py`) fit the
preprocessor, train and rank several candidate classifiers, and package the
serving pipeline. The README explicitly documents a known limitation: the
dataset's features give the classifier weak real-world discriminative power
(ROC-AUC ≈ 0.51–0.55 across all candidate models — only slightly better
than chance), and states this is correct-but-unreliable engineering, not a
bug.

**Mandatory safety framing (applies to every answer about this project):**
this is a machine-learning coursework/portfolio project only. It is not
clinically validated, not medically certified, and must never be described
as capable of diagnosing real patients or replacing a doctor. The GitHub
README itself states in its first paragraph: "This is a machine-learning
prediction, not a medical diagnosis."
