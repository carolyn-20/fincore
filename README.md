# FinCore — simulated digital wallet and payment platform

Educational fintech engineering project for the Orion Project 02 brief. It uses **synthetic funds only**. It is not a bank, does not connect to banking rails, and must never be used for real customer funds.

## Stack
- Next.js App Router + React + TypeScript + Tailwind CSS frontend
- Node.js + Express REST API (primary business service)
- PostgreSQL (authoritative system of record; double-entry ledger)
- Python + FastAPI risk analytics service
- Redis (available for cache/job expansion)
- Docker Compose, GitHub Actions, Jest-compatible Node test runner / pytest

## Quick start (Docker)
1. Install Docker Desktop and Docker Compose.
2. Copy `.env.example` to `.env` and replace the development secrets.
3. Run `docker compose up --build`.
4. Open frontend at http://localhost:3000, API docs at http://localhost:8000/docs, API health at http://localhost:4000/health.
5. Seed the database: `docker compose exec api npm run db:seed`.

Demo credentials after seeding: `customer@fincore.test` / `DemoPass123!` and `ops@fincore.test` / `DemoPass123!`.

## Local development
- Database/Redis: `docker compose up -d postgres redis`
- API: `cd apps/api && npm install && npm run db:migrate && npm run db:seed && npm run dev`
- Risk service: `cd apps/risk-service && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`
- Web: `cd apps/web && npm install && npm run dev`

## Core behavior
- Register/login with hashed passwords and JWT access tokens.
- Customer and operations roles; API authorization is enforced server-side.
- Wallet balances are derived from posted ledger entries, not trusted from the browser.
- Transfers use a single PostgreSQL transaction, row locks, balanced debit/credit entries, and an idempotency key.
- Payment intents use a local test adapter. Signed webhook events are verified and deduplicated.
- Refund/reversal, dispute, beneficiary, statement, audit and risk-alert endpoints are included as educational workflows.
- Email/SMS adapters log sandbox messages; no real messages are sent.
- Risk service uses synthetic transaction data and produces decision-support flags, not proof of fraud.

## API overview
`/api/v1/auth`, `/api/v1/wallets`, `/api/v1/beneficiaries`, `/api/v1/transfers`, `/api/v1/payment-intents`, `/api/v1/webhooks/provider`, `/api/v1/disputes`, `/api/v1/statements`, `/api/v1/operations`, `/api/v1/health`.

OpenAPI/Swagger UI: http://localhost:4000/docs (when API is running). Import `docs/postman_collection.json` into Postman.

## Assessment map
See `docs/ASSESSMENT_MAP.md` for a traceability matrix mapping all 15 mandatory assessments to implementation, tests and evidence still to capture. See `docs/KNOWN_LIMITATIONS.md` before claiming completion. A local/test implementation is not a production banking deployment.

## Security and safe-use notes
- Use only synthetic identities and balances.
- `.env` is ignored; `.env.example` contains placeholders only.
- Change all secrets before sharing or deploying.
- Test-mode provider adapter is local by default. A real provider sandbox requires your own account, keys, webhook secret and explicit configuration.
- Do not expose Postgres or Redis publicly. Production deployment requires HTTPS, private networking, backups, restore drills, secret management and security review.
