# Known limitations — read before submission

1. **No real money:** All wallet values are synthetic ledger units. There is no bank connection or payment settlement.
2. **Payment provider:** The default adapter creates local test intents. Assessment 08 asks for a provider in test mode; configure an actual provider sandbox only if you have authorized test credentials. Do not use live keys.
3. **Notifications:** SMS/email delivery is not configured. Add a sandbox provider or local capture adapter and document its behavior; no messages are sent by this starter.
4. **MFA:** JWT login and role checks are present; a full MFA challenge/verification lifecycle and sensitive-action reauthentication remain to be implemented.
5. **Refunds/reversals/settlements:** Database concepts are present, but full balanced reversal and settlement workflows need implementation and regression tests.
6. **Ledger immutability:** Entries have no update/delete API and are append-only by application convention. Production-grade DB permissions/triggers should enforce immutability.
7. **FastAPI:** Risk scoring is implemented. Fee, interest and reconciliation calculation endpoints need to be added for full Assessment 05 coverage.
8. **Jobs/cache:** Redis is provisioned but BullMQ/worker processing is not wired yet.
9. **Testing:** Starter unit tests are included. Full PostgreSQL integration, Playwright E2E, webhook signature/replay, concurrency, security and failure-path suites remain necessary.
10. **OpenAPI:** FastAPI docs are live. Express OpenAPI specification and complete Postman collection need expansion.
11. **CI/CD:** GitHub Actions runs basic tests/type checks. Branch protections, scanners, staging approvals, image signing and rollback require repository configuration.
12. **Deployment/monitoring:** Compose is local only. No cloud deployment, DNS, HTTPS, backup encryption, restore drill or external production monitoring is claimed.

Do not describe the project as production-ready or as satisfying all 15 assessments until these gaps are implemented, tested and evidenced.
