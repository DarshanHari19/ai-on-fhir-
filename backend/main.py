from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware      # ← NEW
from pydantic import BaseModel
import spacy

nlp = spacy.load("en_core_web_sm")
app = FastAPI()

# ── CORS so React (http://localhost:3000) can reach us on :8000 ──────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # dev UI origin
    allow_methods=["POST"],
    allow_headers=["*"],
)
# ─────────────────────────────────────────────────────────────────────────────

class Query(BaseModel):
    question: str

@app.post("/nlp")
def parse(query: Query):
    # TODO: replace with real NLP logic
    return {
        "fhirQuery": "/Patient?condition=E11&age=gt50",
        "preview": [{"name": "John Doe", "age": 55, "condition": "Diabetes"}],
    }
