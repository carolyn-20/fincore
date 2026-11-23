# Architecture

```text
Browser (Next.js / TypeScript)
        | HTTPS in deployed environments
        v
Express REST API (auth, RBAC, wallets, transfers, ledger, disputes)
        |                         |
        v                         v
PostgreSQL (system of record)   FastAPI (risk analytics)
        |
        +-- Redis (future cache / background jobs)

Payment provider test adapter -> signed webhook inbox -> deduplication
Email/SMS sandbox adapter -> captured test notifications (not live delivery)
```

PostgreSQL is authoritative for customers, wallets, transfers, ledger entries, disputes, provider events and audit records. The FastAPI service receives bounded analytics requests and does not own financial balances. Transfer posting locks both wallets in deterministic order, checks the source balance, inserts a transfer and two equal ledger entries in one database transaction. The unique idempotency key prevents repeat posting for the same request.
