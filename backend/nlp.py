# backend/nlp.py
from __future__ import annotations
import re, spacy
from typing import TypedDict

nlp = spacy.load("en_core_web_sm")

# quick lookup so we don’t need UMLS in the demo
CONDITION_TO_ICD = {
    "diabetes":  "E11",
    "diabetic":  "E11",          # ← new
    "hypertension":  "I10",
    "hypertensive": "I10",
    "asthma":   "J45",
    "copd":     "J44",
    "obesity":  "E66",
}

class Parsed(TypedDict, total=False):
    condition: str
    icd: str
    age_op: str   # "gt" | "lt" | "eq"
    age_value: int
    date_range: str  # e.g. "2025-01-01/2025-12-31"

_age_regex = re.compile(r"(over|under|>=|<=|>|<)\s*(\d{1,3})")

def parse(question: str) -> Parsed:
    doc = nlp(question.lower())
    out: Parsed = {}

    # --- condition ---
    for token in doc:
        lemma = token.lemma_
        if lemma in CONDITION_TO_ICD:
            out["condition"] = lemma
            out["icd"] = CONDITION_TO_ICD[lemma]
            break

    # --- age comparator ---
    m = _age_regex.search(question)
    if m:
        word, num = m.groups()
        op = {"over": "gt", ">": "gt", ">=": "ge",
              "under": "lt", "<": "lt", "<=": "le"}.get(word, "gt")
        out.update(age_op=op, age_value=int(num))

    # --- simple relative dates ---
    if "last month" in question:
        out["date_range"] = "2025-05-01/2025-05-31"
    elif "this year" in question:
        out["date_range"] = "2025-01-01/2025-12-31"

    return out
