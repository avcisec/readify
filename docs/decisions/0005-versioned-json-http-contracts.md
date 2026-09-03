# ADR-0005: Versioned JSON HTTP contracts

- Status: Accepted
- Date: 2026-09-01

## Context

The first browser slice needs mechanically testable contracts for authentication, asynchronous imports, composed Reader data, idempotent mutations, safe errors, and provider-neutral boundaries. Next.js delivery details must not become domain APIs, and future coding agents need one stable convention rather than choosing a transport per feature.

## Choice

Expose same-origin, versioned JSON HTTP contracts under `/api/v1` as delivery adapters over application commands and queries. Use opaque IDs, secure cookie sessions, explicit CSRF protection where required, stable `application/problem+json` error codes, ingress-generated request/correlation identity, opaque cursor pagination, and `Idempotency-Key` on commands whose retry could duplicate work or history.

Keep application/domain contracts independent from HTTP and provider SDK types. Evolve a version additively; ignore unknown response fields. A breaking public shape uses a new version with a compatibility/cutover plan. Materialize the contract in the smallest typed repository-native schema when implementation begins; generated OpenAPI may be added only as a checked derivative or single source, not as duplicated hand-maintained truth.

## Reasons

- Plain HTTP/JSON is mature, observable, tool-independent, and easy to exercise in API/integration tests.
- Versioned routes and stable problem codes make browser/backend changes reviewable by agents and allow controlled evolution.
- Application contracts remain callable from workers/tests without pretending HTTP is the domain boundary.
- Idempotency and correlation are explicit where network retries and async work make them correctness concerns.
- Same-origin sessions keep the first topology simple while preserving provider-neutral identity adapters.

## Alternatives

- Framework server actions as the only contract: rejected because they couple acceptance tests and non-browser callers to framework serialization/routing and obscure stable API/error behavior.
- tRPC or another TypeScript RPC framework: deferred because it adds a transport dependency before runtime scaffolding and makes non-TypeScript/provider boundaries less transparent.
- GraphQL: rejected for the first slice because its schema/runtime/cache/authorization complexity does not solve a demonstrated query-shape problem.
- Unversioned ad hoc JSON routes: rejected because drift and incompatible agent changes would be difficult to detect and migrate.
- OpenAPI-first tooling during documentation: deferred because no runtime/schema library exists and two manually maintained sources would be unreliable.

## Tradeoffs and migration difficulty

HTTP mappings require explicit schemas and some duplication between application types and serialized forms unless one checked source is selected during implementation. Route versioning does not replace database/event migration discipline. Secure cookie sessions constrain browser/API topology unless cross-origin auth is deliberately added later.

Adding generated OpenAPI from typed schemas is low-to-moderate difficulty. Moving to a separate API deployment is moderate if same-origin/session and CSRF topology changes. Replacing the browser transport entirely is moderate-to-high, but application/domain contracts and provider ports remain reusable.
