# ai-on-fhir-
# AI on FHIR — NLP ⇢ FHIR Query Demo

Tiny full-stack prototype for natural-language patient search  
(React / Next 14, FastAPI, spaCy).  
Type a clinical question, optionally filter by age, and see matching mock
patients + quick charts.


## 1 · Quick-start (local)

```bash
# clone & install
git clone https://github.com/<you>/ai-on-fhir.git
cd ai-on-fhir

# ── backend ───────────────────────────────────────────────
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000     # http://localhost:8000/docs

# ── frontend ──────────────────────────────────────────────
# (in a new terminal window)
cd frontend
npm ci
npm run dev                                        # http://localhost:3001


Note: React dev server expects the backend at
http://localhost:8000 (see page.tsx). If you change the port, adjust that
URL.

What I focused on
* End-to-end “happy path” – working demo in ~300 LoC.
* Visual polish – loading spinner, empty-state, tooltip charts.
* Age filter & mock-data generator to exercise the UI.
With more time …
* Real FHIR server integration (HAPI or Azure FHIR API).
* Production‐grade i18n + RTL testing.
* Auth (SMART-on-FHIR / PKCE), audit logging & HIPAA controls.
* CI (GitHub Actions) + automatic Preview deploy (Vercel / Render).
