# First vertical slice implementation

- Status: Implementation and automated evidence complete; manual AT, independent review, and restricted preview acceptance pending
- Date: 2026-09-01
- Product spec: [Pasted-text Reader learning loop](../../product-specs/pasted-text-reader-learning-loop.md)
- Architecture contract: [Pasted-text slice contracts](../../architecture/pasted-text-slice-contracts.md)
- Readiness: [First-slice implementation readiness](../../product/first-slice-implementation-readiness.md)
- Architecture baseline: [ADR-0002](../../decisions/0002-technology-baseline.md)

## Goal

Implement and deterministically verify the complete first-slice loop using production-shaped application contracts and explicitly non-production identity/meaning adapters:

```text
passwordless test entry → French profile → paste text → durable processing
→ Library → Reader → inspect word → Learning/Known/Ignore/Undo
→ Vocabulary → semantic resume → honest Progress
```

Completion means all 23 product acceptance scenarios have executable evidence, `make verify` passes with real runtime checks, the critical browser flow passes, one representative desktop screen-reader smoke is recorded, and an independent Reviewer reports no `BLOCKER` or `MAJOR` findings. It does not mean the product is approved for production launch.

## Non-goals

- No managed identity/email vendor, real recipient email, production credential, or provider SDK.
- No licensed production dictionary, external meaning request, AI meaning, or claim of general lexical coverage.
- No audio, synchronization, Sentence View, Review/SRS, cards, score/CEFR, file upload, deletion/editing, search/filter, or later import source.
- No object storage for bounded pasted text, Redis/broker, workflow engine, microservice, OpenAPI generator, Kubernetes, or hosted observability vendor.
- No production deployment or real-user data.

## Required implementation decisions

These are engineering choices necessary to execute the accepted architecture, not new product requirements:

- Scaffold the accepted pnpm TypeScript workspace with a Next.js web/API process and separately runnable Node worker. At the first Builder step, pin the current maintained Node LTS, pnpm, Next.js, React, TypeScript, PostgreSQL image, and every dependency in manifests/lockfiles; record the exact versions in this plan.
- Use PostgreSQL as source of truth and durable queue under ADR-0004. Use a pinned TypeScript SQL/schema/migration library that supports explicit transactions, constraints, generated migrations, and raw `FOR UPDATE SKIP LOCKED`; record a short ADR before the first migration if choosing it materially constrains schema/migration ownership.
- Use one repository-owned typed schema source for HTTP request/response validation. Do not add generated OpenAPI unless it is generated from that source and checked for drift.
- Implement French tokenization/POS/lemma through the product-selected Stanza provider behind the Language-intelligence port. Add the smallest separately runnable Python process only for that adapter; pin Python/model/package versions and cache model artifacts reproducibly. Normal TypeScript tests use recorded/owned fixture results rather than downloading models or requiring GPU/network.
- Keep language-mismatch detection behind its own local deterministic port. Select and pin the smallest maintained offline detector during the language milestone; document threshold/minimum-text policy and prove `undetermined` does not become a false mismatch.
- Use the approved repository fixture adapter for meanings and a local outbox/test fake for email proofs. Application startup rejects both adapters when `APP_ENV=production`.

If maintained-version or database-library research contradicts these constraints, stop before installing/migrating, update this plan, and obtain architectural review. Do not improvise a second backend, queue, or provider.

## Actual pinned baseline

- Node 24.11.1, pnpm 11.25.0, TypeScript 6.0.3.
- Next.js 16.3.4, React/React DOM 19.2.8, Zod 4.5.4.
- PostgreSQL 18.6-alpine, Kysely 0.29.5, pg 8.23.0.
- Vitest 4.1.11, Playwright 1.62.1, Axe Playwright 4.13.0.
- Python 3.12.12-slim by image digest, Stanza/resources 1.14.0, CPU-only torch 2.13.0+cpu, and exact transitive Python pins in `apps/language-worker/requirements.txt`.
- `franc-min` 6.2.0 for the conservative offline mismatch policy; Pino 10.3.1 for bounded structured logs.

ADR-0006 records the Kysely/SQL-first migration choice. The Stanza adapter is an optional non-root process image; normal tests use the recorded provider contract and require neither model downloads nor network/GPU.

## Repository shape and dependency enforcement

Create only the modules exercised by this slice:

```text
apps/
  web/                 # Next.js UI and thin HTTP delivery adapters
  worker/              # Node durable job runner
  language-worker/     # Python Stanza adapter process only
packages/
  contracts/           # shared stable primitives and serialized schemas
  modules/
    identity/
    learning-profile/
    import/
    library/
    content/
    language/
    reader/
    vocabulary/
    learning/
  platform/            # PostgreSQL, queue, telemetry, clocks/IDs, adapters
```

Each module exposes a public application entry point. Delivery/platform code may depend inward on application/domain contracts; domain code imports no Next.js, SQL, queue, Stanza, or provider package. Cross-module orchestration uses public commands/queries/events, never another module's repository or internal path. Extend the existing lightweight architecture check to reject forbidden imports; do not add a general dependency-analysis platform unless the simple check cannot express these rules.

## Data and migration scope

Create the minimum owned persistence needed for:

- internal users/sessions and one French learning profile;
- idempotency records with the 24-hour supported retry window;
- Import source/revision/digest, workflow/stage attempts, Library item, and database-backed jobs;
- normalized section/paragraph/sentence/token/lemma analysis and semantic locators;
- Reader position and explicit section completion;
- Vocabulary item/occurrence/state/change history with head-safe Undo;
- append-only Reader/Vocabulary events and the minimal Progress projection.

Do not create audio, review/card, export, sharing, billing, generic artifact, or speculative settings tables. The initial migration must clean-apply to an empty PostgreSQL database, enforce account ownership/unique duplicate and vocabulary invariants, and be exercised through a representative upgrade path. Generated migrations are reviewed SQL; no startup auto-migration or manual production edit.

## Ordered implementation milestones

### 1. Executable foundation

1. Pin runtime/tool versions and create the workspace, lockfile, local PostgreSQL container, environment schema, and safe `.env.example` additions.
2. Wire repository-native formatting, lint, typecheck, unit/domain, integration/API, architecture, migration, and security commands behind the existing Make targets. Delete foundation skips as soon as their runtime marker exists.
3. Add test factories for frozen time, opaque IDs, correlation IDs, accounts, and the approved French fixture.
4. Add structured JSON logging/redaction primitives and request/job correlation propagation; no hosted exporter.

Checkpoint: a minimal web and worker process boot, health checks distinguish liveness/readiness, a disposable PostgreSQL database starts reproducibly, and `make verify` runs real checks rather than foundation skips.

### 2. Identity and learning profile

1. Implement provider-neutral request/consume/revoke/session application contracts and thin `/api/v1` delivery mappings.
2. Implement one-time, expiring proofs in the local outbox/test adapter with uniform request responses, allowlisted relative return paths, secure cookie behavior, CSRF protection where needed, and complete secret/log redaction.
3. Make test-proof capture available only through test harness/local tooling—not a public production route—and fail startup if the adapter is selected in production.
4. Implement create-only French profile and A1–C2 validation.

Checkpoint: acceptance scenarios 1–2 plus invalid/expired/replayed proof, account-enumeration, cookie/session, sign-out, and production fail-closed tests pass.

### 3. Pasted-text intake and durable workflow

1. Implement normalization v1, well-formed Unicode validation, 50,000-scalar limit, 512 KiB pre-parse body cap, 80-scalar title, account-scoped digest, language acknowledgment, and escaped output.
2. Implement idempotent accept-import transaction: duplicate arbitration, immutable source revision, Library item, workflow, and first PostgreSQL job commit atomically.
3. Implement job lease/heartbeat/timeout/retry/redelivery and stage transactions for preparing text and language analysis. No long-running HTTP request.
4. Preserve readable text on optional word-tool failure; expose stable capability/status/error shapes and targeted retry.

Checkpoint: scenarios 3–10 pass, including CRLF/outer blanks, non-BMP/combining boundaries, literal markup, duplicate races, rollback atomicity, worker restart/redelivery, partial readiness, and safe reference IDs.

### 4. Content and language analysis

1. Implement one-section paragraph preservation, stable sentence/token occurrence IDs, scalar-value half-open offsets, and immutable analysis provenance.
2. Implement the Stanza adapter/process contract with bounded input/output, deadline, classified failure, reproducible model version, and no raw text telemetry.
3. Implement and document the offline language detector policy; short/uncertain text returns `undetermined` rather than mismatch.
4. Add recorded provider-contract fixtures covering apostrophes, elision, repeated inflections, combining marks, and `🥐` without live model/network dependence in normal CI.

Checkpoint: exact fixture slicing agrees between Python/TypeScript/browser; lemma identity groups the expected forms; analyzer failure produces truthful degraded readiness and targeted retry.

### 5. Reader, Vocabulary, resume, and Progress application behavior

1. Implement bounded Reader composition, section completion, semantic position save/resolve, and nearest-anchor behavior without pixel persistence.
2. Implement context composition and the fixture-backed meaning adapter with bounded provenance and `unavailable` outside the catalog. Production startup must reject it.
3. Implement account+French+lemma vocabulary uniqueness, Learning/Known/Ignore, idempotent changes, occurrence association, authoritative versions, and head-safe Undo.
4. Implement append-only events and idempotent minimal Progress projection for section completion and self-reported states only.

Checkpoint: scenarios 11–20 and 23 pass at domain/API/database layers, including no-silent-learning, cross-account indistinguishable `404`, mutation rollback, duplicate re-encounter, stale Undo, missing meaning, cross-viewport semantic resume, and no invented recall.

### 6. Product UI and browser acceptance

1. Build only Sign-in, minimal onboarding, Library/import/status, Page Reader/context surface, Vocabulary, and minimal Progress surfaces from the accepted wireframes.
2. Implement Turkish copy keyed from stable problem/status codes. Do not expose adapter/provider internals or future-feature placeholders.
3. Implement desktop side panel, tablet drawer, and mobile bottom sheet with semantic content, roving token navigation, focus entry/return, state announcements, non-color cues, and recoverable optimistic behavior.
4. Poll bounded processing status with backoff; do not add push infrastructure.
5. Add critical E2E across Chromium, Firefox, and WebKit, with keyboard flow, responsive structures, escaped markup, processing/failure states, state persistence, sign-out/in, and resume.

Checkpoint: scenarios 21–22 pass plus the complete happy path. Run the [accessibility smoke](../../quality/accessibility.md) with one available primary desktop AT combination and attach versioned evidence.

### 7. Full completion loop

1. Run targeted tests during each fix, then `make verify` and the separate browser E2E suite.
2. Self-review against all 23 scenarios, module boundaries, untrusted-input rules, tenant isolation, telemetry redaction, job recovery, migrations, and non-production adapter fail-closed behavior.
3. Obtain independent Reviewer findings using `BLOCKER`, `MAJOR`, `MINOR`, `PASS`.
4. Fix every actionable failure and all Blocker/Major findings; rerun narrow checks, full verification, E2E, and review until clean.
5. Exercise a restricted synthetic preview from the same immutable build, run migrations, complete the acceptance fixture loop, and record evidence.
6. Update this plan with actual versions, deviations, verification output, reviewer resolution, and acceptance evidence; move it to `completed/` only after final `PASS`.

## Test and acceptance allocation

| Evidence | Coverage |
| --- | --- |
| Pure unit/domain | normalization/counting/title/digest; state/Undo; locators; status/progress policies |
| Real PostgreSQL integration | constraints, atomic import+job handoff, leases/redelivery, duplicate races, projections, migrations |
| API | schemas/problem codes, authn/authz, idempotency, CSRF/session, capability degradation, cross-account `404` |
| Provider contracts | outbox/test identity, fixture meanings, recorded Stanza/language-detector results, timeout/error mapping |
| Browser E2E | critical loop, processing polling, responsive context, keyboard, escaped markup, persistence/resume |
| Manual accessibility | one recorded NVDA+Firefox or VoiceOver+Safari critical-loop smoke |
| Architecture/security | forbidden imports, production adapter rejection, secrets/content redaction, dependency/secret scanning |

Every product acceptance scenario must link to at least one executable test/evidence item. A live external provider is forbidden in normal CI.

## Observability requirements

- Carry request/correlation ID through API, transaction, job, worker attempt, and safe UI reference ID.
- Log only bounded event names, process/environment/revision, opaque domain IDs, stage/capability, duration, attempt, provider/dataset/policy version, and classified outcome.
- Record API latency/error, database/queue readiness, queue depth/oldest age, job attempt/timeout/failure, import stage duration, degraded readiness, retry, and meaning availability.
- Prove raw pasted text, source sentences, meanings, email/proofs, cookies/tokens, provider bodies, and account identifiers do not enter logs/metrics/traces/errors.
- Central exporter, alerts, dashboards, and paging remain production rollout work; local structured output and inspectable persisted state are required now.

## Security requirements

- Treat pasted text as hostile bounded plain text and render it only through escaped text nodes.
- Authorize every command/query at the application boundary; never trust account, lemma, or expected-language ownership from request bodies.
- Use non-enumerating account/resource behavior, secure session cookies, applicable CSRF defense, rate limits for auth/import/retry/context/mutations, bounded parsing, and safe error metadata.
- Non-production outbox/fixture adapters and proof-capture tooling must be impossible to activate when `APP_ENV=production`; add startup and regression tests.
- Pin dependencies and run vulnerability/secret checks once manifests exist. No raw private content in fixtures other than approved synthetic data.

## Verification commands

The Builder must make these real and passing:

```bash
make format-check
make lint
make typecheck
make test
make integration-test
make architecture-check
make migration-check
make security-check
make verify
make e2e
```

Run `make verify` again after integrating review fixes. Failures are fixed at root cause; no check, acceptance scenario, or rule may be weakened to obtain green output.

## Rollout and recovery

The implementation target is local, automated test, and an access-restricted preview containing only synthetic data. Promote the same build revision; change only validated configuration. Before preview, exercise clean migration, representative upgrade, worker restart/redelivery, failed-stage retry, and backup/restore of the disposable preview database.

Recovery is forward-fix or rollback to the previous application image plus a migration-compatible database state. Because no real-user production rollout is authorized, do not solve speculative zero-downtime or cross-provider migration. Preserve failed job/attempt evidence and use only audited scoped retry operations.

## Automated verification record

Executed on 2026-09-01 after the final Builder fix:

- `make verify`: PASS — 4 harness tests, formatting, lint, five workspace typechecks, 14 unit/provider tests, 5 real-PostgreSQL integration scenarios, architecture/doc/product checks, clean/representative/idempotent migrations, and dependency audit with no known vulnerabilities.
- `make e2e`: PASS — 9/9 tests across Chromium, Firefox, and WebKit, including the complete loop, HTTP/security boundaries, mobile structure, keyboard/focus behavior, mutation rollback/retry, semantic resume, and Axe serious/critical scan.
- `pnpm build`: PASS — optimized Next.js application and separately runnable worker.
- Real Stanza image: PASS — pinned image builds to approximately 661 MB, runs as UID 10001, and returns versioned French lemma/POS output with valid scalar offsets for MWT and `🥐` smoke input.

The local Linux host needed Playwright's WebKit OS libraries; CI installs them with the documented `playwright install --with-deps` step. That host prerequisite is not an application exception.

## Deferred production rollout gates

These do not block implementation or fixture-backed acceptance, but they block real-user production:

- approved managed identity/email provider, real delivery, DPA/subprocessors/transfers, retention, deletion/export, rate/abuse policy, and incident runbook;
- licensed French→Turkish source with coverage/quality acceptance, attribution/display/cache/storage rights, privacy, budget/rate limits, update/termination policy, and production adapter tests;
- measured final pasted-text quota and capacity/SLO budgets;
- public browser/OS/AT support matrix, device budget, release-smoke cadence, and exceptions policy;
- hosting region, production database/queue/telemetry services, backups/restore objective, alert owners, secrets, domains/TLS, availability target, and deployment approval.

Attempting production startup with fixture identity/meaning adapters or without the production configuration gates must fail clearly.

## Stop conditions

Stop and preserve evidence if implementation requires changing an accepted product scenario, weakening tenant/security boundaries, adding a new deployment unit/stateful service, accepting vendor/license terms, using real credentials/data, taking destructive production action, or choosing a schema/runtime approach that contradicts an accepted ADR. Update the plan and obtain the appropriate product, legal, or architecture decision before continuing.

## Reviewer record

### Builder self-review

The skeptical pass found and resolved these actionable issues:

- **MAJOR — false production readiness:** placeholder `managed`/`licensed` names could pass configuration while fixture behavior remained wired. Production startup is now unconditionally disabled until concrete rollout adapters exist, with regression tests.
- **MAJOR — weak mechanical contract:** `SliceApplication` returned `Promise<unknown>` throughout. Results now have concrete application types, `ReadifyService` compiles against them, and the architecture guard rejects regression.
- **MAJOR — accepted UX gaps:** Continue/resume labeling, vocabulary source/context/count/provenance, meaning-only Retry, real roving token tab order, degraded Reader messaging, and fixture `aller` coverage were missing. They are implemented with browser/integration evidence.
- **MAJOR — worker recovery risk:** signal shutdown could destroy the database connection during an active job. Shutdown now stops claims, lets the current attempt finish, then closes resources; health binds on a configurable container-probeable host.
- **MAJOR — provider/error safety:** production adapter selection did not fully fail closed, heartbeat failures could reject unobserved, and arbitrary exception messages could persist as job codes. All now fail/classify safely.
- **MAJOR — cross-browser auth race:** WebKit could submit stale controlled state after a fast fill/click. Submission now reads the actual form value; current Chromium, Firefox, and WebKit coverage exercises keyboard submission.
- **MAJOR — context dismissal after Retry:** refreshing meaning content could drop focus outside the replaced panel, so a panel-scoped Escape handler stopped working and the mobile sheet intercepted Reader actions. Dismissal now listens for Escape for the lifetime of the open context and restores the selected token; all three engines cover it.
- **MINOR — language image size/privilege:** recursive ownership created a redundant image layer. Model artifacts are now created directly as UID 10001; the real-model image is approximately 661 MB and runs non-root.

Scenario traceability is owned by [first-slice acceptance evidence](../../quality/first-slice-acceptance-evidence.md). A genuinely independent Reviewer has **not** yet run, so this plan remains active even though the Builder self-review has no known unresolved `BLOCKER` or `MAJOR`.

### Pending acceptance gates

- Record the specified manual desktop screen-reader smoke with exact OS/browser/AT versions.
- Obtain independent Reviewer `PASS` with no unresolved `BLOCKER` or `MAJOR`.
- Exercise the immutable build in an access-restricted synthetic preview and record migration/smoke evidence.

Do not move this plan to `completed/` until all three are satisfied.
