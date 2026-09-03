# Testing strategy

Tests protect behavior and contracts, not private implementation details. The test pyramid is weighted toward fast domain/application tests, with focused real-infrastructure and browser coverage.

| Layer | Purpose | Typical boundary |
| --- | --- | --- |
| Unit | pure rules, parsers, policies, state transitions | no network/database |
| Domain | vocabulary/recall/progress/import invariants | domain module with controlled clock/IDs |
| Integration | repositories, durable queue/publication, object adapters, provider mapping | real disposable dependency or faithful emulator |
| Database | constraints, transactions, migrations, query semantics | fresh and upgrade-path PostgreSQL |
| API | authn/authz, validation, idempotency, error contracts | application API with real DB, fake external providers |
| E2E | a few critical user journeys and accessibility checks | built app in preview-like environment |
| Architecture | forbidden imports and provider SDK leakage | package dependency graph |
| Migration | clean apply, drift, representative upgrade, destructive review | disposable database |

Browser and assistive-technology acceptance is bounded by the [accessibility matrix](accessibility.md); automated engine coverage does not replace its keyboard/screen-reader release evidence.

## Critical acceptance coverage

As features arrive, acceptance tests must cover importing content, observing processing/retry, opening the reader, marking/undoing vocabulary, switching views without position loss, resuming reading, processing audio, falling back from word to sentence sync, reviewing/restoring learning state, and rebuilding honest progress.

High-risk examples from [FEATURES.md](../../FEATURES.md) should become executable tests: dedup prevents duplicate expensive work; native PDF avoids OCR; align-only avoids ASR when text is sound; Known propagates by lemma and is reversible; completion never marks Known; idle time stops; 2× playback separates wall time from coverage.

## Test design rules

- Freeze clock, IDs, randomness, locale, and provider responses at test boundaries.
- Test state transitions and externally visible contracts; avoid asserting internal call order unless it is the behavior.
- Provider contract tests validate mapping against sanitized fixtures; normal CI never requires paid credentials.
- Every fixed bug should receive the smallest useful regression test.
- Tests must isolate tenant/user data and prove authorization failures, not only happy paths.
- Flaky tests are defects: quarantine requires an owner, issue, expiry, and maintained coverage elsewhere.

## Verification tiers

`make verify` is the merge baseline: verification-harness regression tests, format, lint, typecheck, unit/domain, integration/API, architecture, migrations, and baseline security. Expensive E2E/media-quality suites remain separate but are required by CI for this implemented surface. No executable check in `make verify` is a foundation skip.

For the pasted-text slice, `packages/modules` holds Unicode/language/state policy tests, `packages/platform/src/service.integration.test.ts` exercises real PostgreSQL transactions, leases, tenant isolation, duplicate races, resume, Undo, and projection behavior, and `tests/e2e/first-slice.spec.ts` owns the browser/API critical path.
