from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import json, pathlib

# ── local helpers ───────────────────────────────────────────────────────────
from .nlp import parse as nlp_parse          # spaCy extractor
from .fhir import to_fhir                    # builds FHIR search URL
# ---------------------------------------------------------------------------

app = FastAPI()

# CORS so the React dev server (localhost:3000) can call us on :8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

# ─── mock data --------------------------------------------------------------
DATA_FILE = pathlib.Path(__file__).with_name("mock_patients.json")
MOCK_PATIENTS: List[Dict[str, Any]] = json.loads(DATA_FILE.read_text())
# ---------------------------------------------------------------------------


class Query(BaseModel):
    question: str


# -------- helper ------------------------------------------------------------
def age_matches(row: Dict[str, Any], op: str | None, val: int | None) -> bool:
    """Return True if the patient row satisfies the age comparator."""
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
def parse(query: Query):
    """
    Turn an English question into a simulated FHIR search + preview data.
    """
    parsed = nlp_parse(query.question)          # e.g. {'icd':'E11', ...}
    fhir_url = to_fhir(parsed)

    # ── filter mock rows ───────────────────────────────────────────────────
    # 1) Require a recognised ICD; otherwise return empty list immediately
    icd = parsed.get("icd")
    if not icd:
        return {"fhirQuery": fhir_url, "preview": []}

    rows = [p for p in MOCK_PATIENTS if p["icd"] == icd]

    # 2) Apply age comparator if present
    rows = [
        p for p in rows
        if age_matches(p, parsed.get("age_op"), parsed.get("age_value"))
    ]

    # 3) (optional) date_range filter could be added here later
    # rows = [p for p in rows if date_matches(p, parsed.get("date_range"))]

    return {"fhirQuery": fhir_url, "preview": rows}
