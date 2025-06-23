# backend/Dockerfile
FROM python:3.12-slim
WORKDIR /app

# ── copy requirements.txt that sits at the repo root ─────────────
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ── copy the whole backend source tree ───────────────────────────
COPY backend /app

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
