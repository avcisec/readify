# Agent operating guide

Use progressive disclosure: read this map, then the relevant spec/architecture document, then only the code in scope.

## Repository map

- Product truth: `idea.md`, `FEATURES.md`; interpreted scope, flows, and uncertainties start at `docs/product/README.md`.
- Acceptance-ready feature specifications: `docs/product-specs/`.
- Architecture and dependency rules: `ARCHITECTURE.md`, then `docs/architecture/`; read the relevant slice contract before implementation.
- Long-lived decisions: `docs/decisions/`.
- Non-trivial execution plans: `docs/exec-plans/active/`; move finished plans to `completed/`.
- Research: `docs/research/`; evidence is not a requirement unless promoted into a product spec.
- Quality and operations: `docs/quality/` and `docs/operations/`.

Before an architectural change, read `docs/architecture/overview.md`, `domain-boundaries.md`, the relevant slice contract, and relevant ADRs. Create or supersede an ADR when changing a long-lived decision.

## Work loop

For every non-trivial change: understand/reproduce → plan → implement → verify → self-review → independent review → fix → verify/review again → acceptance. Use the Planner, Builder, and Reviewer responsibilities in `docs/quality/development-lifecycle.md`. Do not create a plan for a trivial edit.

## Mandatory rules

- Run `make verify`. Run relevant targeted tests while iterating; run separate UI/E2E checks when affected.
- Dependencies flow inward toward domain contracts. Domains do not import another domain's internals; orchestration uses public application interfaces/events.
- Abstract real external boundaries (storage, queue, email, AI/ML, telemetry), not ordinary internal code.
- Schema changes require tested migrations. Never rely on manual production edits; destructive changes require an explicit plan and recovery path.
- Pin and time out external calls. Keep provider SDKs in adapters, validate outputs, record model/config versions, and use fakes in tests.
- Treat all user-supplied content as hostile. Bound and escape pasted text; for files also enforce type/size validation and isolated safe parsing. Always enforce authentication, authorization, and sensitive-log redaction.
- Update the relevant spec, ADR, runbook, or operational docs when behavior/contracts change. Avoid duplicated explanations; link to the owner document.
- Stay within scope. Preserve user changes and do not make unrelated cleanup.

## Definition of done

Requested behavior and acceptance criteria are satisfied; relevant tests and `make verify` pass; migrations and operations are safe; docs are current; no known regression remains; and independent review has no `BLOCKER` or `MAJOR` findings. If credentials, product decisions, or risky production actions block completion, stop and report the exact blocker.
