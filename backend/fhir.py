# backend/fhir.py
from urllib.parse import urlencode
from datetime import date
from .nlp import Parsed

def to_fhir(parsed: Parsed) -> str:
    params = {}
    if "icd" in parsed:
        params["condition"] = parsed["icd"]
    if "age_op" in parsed:
        today = date.today().year
        # crude age → birthDate filter
        birth_cut = today - parsed["age_value"]
        params["birthdate"] = f"{parsed['age_op']}{birth_cut}"
    if "date_range" in parsed:
        start, end = parsed["date_range"].split("/")
        params["_lastUpdated"] = f"gt{start}&_lastUpdated=lt{end}"
    return "/Patient?" + urlencode(params, safe="><=")
