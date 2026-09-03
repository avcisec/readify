# Pasted-text slice architecture and API contracts

- Status: Completed
- Date: 2026-09-01
- Product spec: [Pasted-text Reader learning loop](../../product-specs/pasted-text-reader-learning-loop.md)

## Goal

Define provider-neutral, implementation-ready architecture and API contracts for the accepted first slice without creating application code, schemas, migrations, or selecting external providers.

## Scope

- Define transport conventions, authentication/session assumptions, errors, idempotency, authorization, correlation, and compatibility rules.
- Define the slice's application commands/queries and HTTP mappings for identity, profile, pasted-text intake, Library/status/retry, Reader/content/position/completion, contextual word lookup, vocabulary/change/undo, and Progress.
- Define durable identifiers, semantic locators, workflow/capability states, transaction boundaries, consistency visible to the UI, provider ports, sensitive-data rules, observability, and contract verification expectations.
- Resolve architecture-level ambiguities without adding product features; return product-level ambiguity to the product spec explicitly.
- Record long-lived API conventions in an ADR and link the slice contract from architecture indexes.

## Non-goals

- No application skeleton, OpenAPI generator, package/dependency choice, database tables/columns, migrations, live provider, production secret, UI code, or executable test fixture.
- No audio, Sentence View, phrase selection, cards/review, additional import sources, editing/deletion, search/filter, or expanded Progress behavior.
- No GraphQL gateway, event broker, workflow engine, microservice, generic repository framework, or speculative shared abstraction.

## Acceptance criteria

- Every backend implication in the product spec maps to an owned command/query and user-visible consistency rule.
- The contract covers all 23 acceptance scenarios without contradicting domain boundaries or existing ADRs.
- Long HTTP work is absent; import creation and durable handoff are atomic and processing is restart-safe.
- State-changing retries are idempotent; vocabulary Undo cannot overwrite a later change; unauthorized resources do not leak existence.
- Pasted text, token context, email-link secrets, and provider payloads are excluded from logs/metrics/traces.
- External identity/email and deterministic meaning providers remain behind narrow provider-neutral ports with deterministic fakes for tests.
- The contract distinguishes authoritative writes and query-composed read models from the eventually consistent Progress projection, exposing staleness honestly.
- Mechanical repository verification requires the contract and ADR.
- `make product-check` and `make verify` pass after self-review and reviewer disposition.

## Verification

```bash
make product-check
make verify
```

## Outcome

- Created the accepted [pasted-text slice architecture/API contract](../../architecture/pasted-text-slice-contracts.md).
- Added [ADR-0005](../../decisions/0005-versioned-json-http-contracts.md) for versioned same-origin JSON HTTP, stable problem codes, opaque IDs, compatibility, correlation, and idempotent mutation conventions.
- Defined owned application commands/queries and HTTP mappings for Identity, profile, Import, Library/status/retry, Reader/content/position/completion, context/meaning, Vocabulary/change/Undo, and Progress.
- Defined pasted-text normalization, account-scoped duplicate identity, one-section structure, semantic locators, processing/capability states, transaction boundaries, consistency, event/job payload policy, provider ports, authorization/privacy, observability, and implementation verification requirements.
- Added traceability for all 23 product acceptance scenarios and promoted the product spec status to architecture/API-defined.
- Updated architecture/product indexes, agent handoff guidance, and mechanical verification requirements.

## Self-review

- No runtime, dependency, schema/table, migration, provider, OpenAPI generator, workflow engine, broker, object-storage requirement, or application feature was introduced.
- Existing modular-monolith, domain ownership, PostgreSQL queue, and atomic-handoff ADRs remain authoritative; the slice adds no service or generic abstraction.
- Library is query-composed through public contracts rather than prematurely materialized; only the event-derived Progress summary is eventually consistent and exposes freshness.
- Raw pasted text is transient at ingress, normalized private input is bounded, and text/context/secrets/provider bodies are excluded from telemetry and messages.
- Provider-specific identity callback topology and licensed meaning data remain explicit blockers rather than leaking into public/domain contracts.

## Reviewer disposition

- **BLOCKER:** none.
- **MAJOR (resolved):** removed unintended existing-profile editing; derived expected language from the authenticated profile rather than client input; removed pre-auth email request from account-scoped idempotency; restricted private sentence egress/cache sharing at the meaning boundary.
- **MINOR (resolved):** made one-section behavior product-authoritative and defined language-scoped lemma identity across content revisions/items.
- **PASS:** the contract covers all product acceptance scenarios, respects domain boundaries and accepted ADRs, defines observable failure/consistency behavior, and is ready for blocker resolution plus implementation planning.

## Verification result

```text
make product-check  PASS
make verify         PASS
```
