# GitHub Repositories

Source: GitHub (https://github.com/mozammilsiddique2a-dot), all public,
non-fork repositories as of the last check. This file records GitHub-level
facts (what the repo/README states) separately from the portfolio-facing
project descriptions in projects.md.

Important: repository ownership on GitHub does not by itself establish
professional employment. Only experience.md (sourced from the portfolio's
Experience Timeline and the resume) should be used to answer questions
about employment history.

## Repository: Docs-Chatbot

- Purpose: local, multi-document RAG question-answering application
  ("DocuMind AI" on the portfolio).
- Technologies: FastAPI, Streamlit, SQLite (SQLAlchemy), ChromaDB, local
  `sentence-transformers` embeddings, Google Gemini.
- Important implementation details: SQLite is authoritative, ChromaDB is a
  derived/verified index; a `/ready` endpoint fails if the two disagree;
  includes a deterministic offline evaluation harness with no external API
  key required.
- GitHub source: https://github.com/mozammilsiddique2a-dot/Docs-Chatbot

## Repository: greenpack-ai-service-

- Purpose: AI-powered EPR (Extended Producer Responsibility) compliance
  backend ("GreenPack AI" on the portfolio).
- Technologies: FastAPI, SQLite + SQLAlchemy, pandas (CSV ERP feed), Ollama
  (local `llama3`), `sentence-transformers` embeddings, FAISS.
- Important implementation details: reconciliation math is deterministic
  Python; the LLM only narrates structured facts; falls back to
  deterministic text if Ollama is unreachable or slow; explicitly refuses
  to hallucinate on unknown RAG topics.
- GitHub source: https://github.com/mozammilsiddique2a-dot/greenpack-ai-service-

## Repository: AI-First-CRM-HCP

- Purpose: full-stack AI-assisted healthcare CRM module for logging HCP
  (Healthcare Professional) interactions.
- Technologies: React, Redux Toolkit, TypeScript, Material UI, Vite,
  FastAPI, SQLAlchemy, Alembic, PostgreSQL, LangGraph, Groq
  (`gemma2-9b-it` primary, `llama-3.1-8b-instant` fallback).
- Important implementation details: natural-language interaction notes are
  parsed by the LangGraph/Groq assistant into structured fields that
  autofill the React form; CRUD API for interactions.
- GitHub source: https://github.com/mozammilsiddique2a-dot/AI-First-CRM-HCP

## Repository: -Syringe--Angle--Detector

- Purpose: real-time computer-vision syringe detection and angle
  measurement.
- Technologies: Python, YOLOv8, OpenCV.
- Important implementation details: angle smoothing via moving average,
  color-coded optimal/caution/too-steep zones, headless mode for servers,
  YAML configuration, includes a training notebook and pytest tests.
  README explicitly states it is for educational/research use, not actual
  medical procedures.
- GitHub source: https://github.com/mozammilsiddique2a-dot/-Syringe--Angle--Detector
- Note: not confirmed to be the same project as the syringe-angle-detection
  work listed under the One Simulation Pvt. Ltd. employment entry — see
  experience.md.

## Repository: shl-conversational-recommender

- Purpose: conversational SHL assessment recommendation API, built for the
  "SHL AI Intern take-home assignment."
- Technologies: Python, FastAPI, Docker.
- Important implementation details: stateless API (full conversation
  history sent per request); recommendations sourced only from a local
  JSON catalog; refuses off-topic/legal/prompt-injection requests; does not
  require a paid LLM API; publicly deployed on Render.
- GitHub source: https://github.com/mozammilsiddique2a-dot/shl-conversational-recommender

## Repository: lung_cancer_predection

- Purpose: demo/educational web app predicting lung cancer likelihood from
  patient risk factors.
- Technologies: React + Vite (frontend), FastAPI (backend), Scikit-learn
  (saved pipeline).
- Important implementation details: offline training pipeline
  (`preprocess.py` → `train_models.py` → `package_model.py`) is separate
  from the running app. README states a known limitation — ROC-AUC ≈
  0.51–0.55 across all candidate models, i.e. only slightly better than
  chance — and explicitly calls this a dataset/feature-signal limitation,
  not a bug.
- GitHub source: https://github.com/mozammilsiddique2a-dot/lung_cancer_predection
- Safety note: this is a machine-learning demo, not a medical diagnostic
  tool. The README's own first line states: "This is a machine-learning
  prediction, not a medical diagnosis."

## Repository: mozammil-portfolio

- Purpose: source code repository for the personal portfolio website.
- Technologies: static HTML, CSS, JavaScript (single `index.html` file,
  no README in the repository).
- GitHub source: https://github.com/mozammilsiddique2a-dot/mozammil-portfolio
- Live site: https://mozammilsiddique2a-dot.github.io/mozammil-portfolio/
- Note: this repository is the website's own source code, not a
  professional/portfolio project to describe to a visitor as one of
  Mozammil's built AI/ML projects.
