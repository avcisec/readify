# ADR-0002: Initial technology baseline

- Status: Accepted
- Date: 2026-08-31

## Context

The product needs an interactive web reader/player, typed shared contracts, durable workers, relational transactions, binary artifacts, and access to Python-centric ML tools. The repository should be approachable to a small team and coding agents.

## Choice

Use a pnpm-managed TypeScript workspace for a React/Next.js web/API application, shared domain/application packages, and a separately runnable Node worker. Use PostgreSQL as source of truth and initial durable queue backend, and S3-compatible object storage. Keep queue access behind an application port. Add a Python ML worker only when a chosen OCR/ASR/TTS/alignment implementation requires it, behind versioned job/provider contracts. Use containers for reproducible services and deployment, not as the only local development interface.

Exact framework/runtime/database versions are intentionally not named in foundation docs; the first executable plan selects maintained releases, pins them in manifests/lockfiles/images, and documents upgrade policy.

## Reasons

TypeScript supports the rich browser interaction and shared validation/contracts with one main language. PostgreSQL fits transactional ownership, append-only learning events, queryable job/artifact metadata, and the expected early queue volume without another stateful service. S3 is a mature artifact boundary. Conditional Python avoids forcing ML dependencies into the web runtime.

## Alternatives

- Django/Python monolith: strong backend/admin/ML fit, but still requires a substantial typed browser application and risks mixing model runtime with request handling.
- Separate SPA plus independent API framework: clean separation but adds build/deployment/auth contract overhead before needed.
- Redis/dedicated queue: mature and independently scalable, but adds stateful infrastructure before queue contention is measured.
- Managed proprietary backend: faster initial setup but higher provider coupling and weaker local/self-hosted reproducibility.

## Tradeoffs and migration difficulty

Next.js requires discipline to keep domain logic out of framework routes. Queue traffic can contend with product transactions, so queue age and database load must be observed; moving to a dedicated backend is moderate difficulty because the port and job contracts remain stable. Python adds a second toolchain only if enabled. Changing the UI framework is high difficulty; swapping object/provider adapters is moderate; PostgreSQL migration is high. Validate this ADR during the first vertical-slice plan before code makes the choice expensive.
