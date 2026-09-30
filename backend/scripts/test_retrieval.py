"""Manual retrieval quality check against the Phase 6 test-query list.

Prints top-k results (source, score, content snippet) for each query so a
human can judge whether retrieval actually answers the question. Not an
automated pass/fail suite — retrieval quality is a judgment call, not a
simple assertion.

Run:
    python scripts/test_retrieval.py
"""

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.services.retrieval_service import retrieve  # noqa: E402

QUERIES = [
    "What projects has Mozammil worked on?",
    "Tell me about the DocuMind AI project.",
    "What technologies are used in GreenPack AI?",
    "What was Mozammil's experience at Nexifywebsolutions?",
    "What computer vision projects has he worked on?",
    "What is his educational background?",
    "What certifications does he have?",
    "What technologies does he use?",
    "Tell me something unrelated to Mozammil.",
    # Extra genuinely off-topic controls, added after testing showed the
    # line above (which literally contains "Mozammil") is a weaker test of
    # the relevance threshold than truly unrelated input — see README.
    "What is the capital of France?",
    "How do I bake a chocolate cake?",
]


def main() -> None:
    for query in QUERIES:
        print("=" * 80)
        print(f"QUERY: {query}")
        chunks = retrieve(query)
        if not chunks:
            print("  (no chunks cleared the relevance threshold)")
            continue
        for chunk in chunks:
            snippet = chunk.content.replace("\n", " ")[:160]
            score = round(1 - chunk.distance, 4)
            print(f"  source={chunk.source:<20} score={score:.4f}  {snippet}...")


if __name__ == "__main__":
    main()
