# Backend image, built and run by Render (or any container host).
# Listens on port 7860; set the service's port to match (PORT=7860 on Render).
FROM python:3.11-slim

# Run as an unprivileged user that owns every file the app writes
# (vector store, model cache).
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1
WORKDIR $HOME/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user . .

# Build the vector index (and download the embedding model) at image build
# time, so a cold start only loads files from disk. Needs no API key.
# The downloaded model archive is deleted in the same layer: chromadb only
# reads the extracted files, so the ~80 MB .tar.gz is dead weight.
RUN python scripts/ingest_knowledge.py \
 && rm -f $HOME/.cache/chroma/onnx_models/all-MiniLM-L6-v2/onnx.tar.gz

EXPOSE 7860

# --proxy-headers: the host sits behind a proxy, and without this every
# visitor would share the proxy's IP — and therefore one rate-limit bucket.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860", \
     "--proxy-headers", "--forwarded-allow-ips", "*"]
