# tests/test_backend.py
import datetime as dt
from backend.main import age_matches
from backend.fhir import to_fhir

def test_age_matches_gt():
    row = {"age": 70}
    assert age_matches(row, "gt", 60)
    assert not age_matches(row, "gt", 80)

def test_age_matches_lt():
    row = {"age": 15}
    assert age_matches(row, "lt", 18)
    assert not age_matches(row, "lt", 10)

def test_to_fhir_condition_only():
    parsed = {"icd": "I10"}
    assert "/Patient?condition=I10" in to_fhir(parsed)

def test_to_fhir_condition_and_age():
    parsed = {"icd": "E11", "age_op": "gt", "age_value": 60}
    this_year = dt.date.today().year
    birth_cut = this_year - 60
    assert f"birthdate=gt{birth_cut}" in to_fhir(parsed)

