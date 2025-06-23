# Security & HIPAA Notes (AI-on-FHIR demo)

> A one-page sketch of how I’d keep this little project safe if it ever handled real patient data.

---

## 1.  Sign-in & Permissions

| Layer | What I’d use | Why |
|-------|--------------|-----|
| Front end (React) | **SMART on FHIR with OAuth 2.0 + PKCE** | This is the standard most EHRs (Epic, Cerner, etc.) already speak.  PKCE means I don’t have to store a client secret in the browser. |
| API / Gateway | **Validates the JWT** it gets from the EHR’s auth server | Checks the signature (JWK set), scopes, expiry, and that we’re on TLS. |
| Back end (FastAPI) | **Scopes = read-only** (`patient/*.read`, etc.) | The demo only needs to *read* data.  No write scopes, less to worry about. |

---

## 2.  Privacy & Logging

* **HTTPS everywhere** – the demo already runs on `https://` in prod; TLS 1.2+.
* **No PHI at rest** – the NLP part works in memory and only stores the final FHIR search string plus row counts, never the raw note text.
* **Audit log** – every request: user ID, patient ID (if any), scopes, IP, result count.  
  I’d dump this into an append-only bucket (e.g. S3 with “Object Lock”) and keep it 6 years like HIPAA suggests.
* **Encryption at rest** – turn on the default AES-256/KMS checkboxes in RDS / S3.

---

## 3.  Basic RBAC

| Role | Scopes | What they can do |
|------|--------|------------------|
| **Clinician** | `patient/*.read` | Run a query on their own patients. |
| **Researcher** | `user/*.read`  | Run de-identified cohort searches. |
| **Admin** | `system/*.read` + audit log access | Rotate keys, check audit logs. |

I’d map roles → scopes in the Identity Provider (Auth0, Cognito, etc.) so the API code only needs to look at the scopes list.

---

## 4.  A few ops things

* Build images with a non-root user and `--no-cache`, sign them in CI (GitHub Actions).
* Run `pytest`, `ruff`, and a quick OWASP ZAP scan on each PR.
* Daily encrypted DB snapshots and copy them to another AWS region.
* Use AWS services that come with the HIPAA BAA so the paperwork side is covered.

---

### TL;DR

* Use SMART on FHIR + OAuth for login.  
* Only read scopes, no PHI written to disk.  
* Log everything to WORM storage.  
* Stick to AWS services that are already HIPAA-eligible.

That keeps the demo safe enough for a first pass, and I can tighten things (e.g. full RBAC UI, breach alerts) as it grows.
