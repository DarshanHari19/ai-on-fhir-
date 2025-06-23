from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import json, pathlib

# ── local helpers ───────────────────────────────────────────────────────────
from backend.nlp import parse as nlp_parse           # spaCy extractor
from backend.fhir import to_fhir                    # builds FHIR search URL
# ---------------------------------------------------------------------------

app = FastAPI()

# CORS so the React dev server (localhost:3001) can call us on :8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── mock data --------------------------------------------------------------
DATA_FILE = pathlib.Path(__file__).with_name("mock_patients.json")
MOCK_PATIENTS: List[Dict[str, Any]] = json.loads(DATA_FILE.read_text())
# ---------------------------------------------------------------------------


class Query(BaseModel):
    question: str
    ageOp:  str | None = None   # ≥ / ≤ / …
    ageVal: int | None = None


# -------- helper ------------------------------------------------------------
def age_matches(row: Dict[str, Any], op: str | None, val: int | None) -> bool:
    if op is None or val is None:
        return True
    if op in ("gt", ">"):
        return row["age"] > val
    if op in ("ge", ">="):
        return row["age"] >= val
    if op in ("lt", "<"):
        return row["age"] < val
    if op in ("le", "<="):
        return row["age"] <= val
    return True
# ---------------------------------------------------------------------------


@app.post("/nlp")
async def parse(request: Request):
    """
    Turn an English question into a simulated FHIR search + preview data.
    The payload can be either:
      { "question": "… free text …" }
      { "question": "…", "ageOp": "gt", "ageVal": 60 }
    """
    body: dict = await request.json()
    q = Query(**body)                     # validate & coerce types

    # 1) NLP parse the free-text question
    parsed = nlp_parse(q.question)        # → {'icd': 'E11', ...}

    # 2) UI override: if the user chose an explicit age filter, honour it
    if q.ageOp and q.ageVal is not None:
        parsed["age_op"]    = q.ageOp
        parsed["age_value"] = q.ageVal

    # 3) Build (mock) FHIR query string
    fhir_url = to_fhir(parsed)

    # 4) Filter mock dataset
    icd = parsed.get("icd")
    if not icd:                           # condition not recognised
        return {"fhirQuery": fhir_url, "preview": []}

    rows = [
        p for p in MOCK_PATIENTS
        if p["icd"] == icd
        and age_matches(p, parsed.get("age_op"), parsed.get("age_value"))
    ]

    return {"fhirQuery": fhir_url, "preview": rows}
