# Agent operating guide

Use progressive disclosure. Start with one task row below, then read the relevant specification/contract, then only the code in scope. Never bulk-read `docs/`, completed plans, or competitor research.

## Task routing

| Task | Required first read | Read only when affected |
| --- | --- | --- |
| Product behavior | `docs/product/README.md`, relevant `docs/product-specs/*` | linked UX decision/flow |
| UI/UX | relevant product spec, `docs/product/interaction-model.md` | screen inventory, wireframe, visual foundation |
| Architecture/API | `ARCHITECTURE.md`, relevant slice contract | domain boundaries and relevant ADR |
| Database/job change | relevant slice contract | storage/background-jobs and migration ADR |
| Operations/security/performance | owning document under `docs/operations/` or `docs/quality/` | relevant architecture contract |
| Research | `docs/research/README.md`, then one competitor `SUMMARY.md` | archived baseline only to answer a named uncertainty |
| Implementation | relevant active plan | specification, contract, then touched code |

Product truth starts at `idea.md` and `FEATURES.md`; interpreted MVP scope is `docs/product/mvp-scope.md`. ADRs live in `docs/decisions/`. Active plans live in `docs/exec-plans/active/`; completed work is summarized in `docs/exec-plans/completed/README.md` and full history stays in Git.

Before an architectural change, read `docs/architecture/overview.md`, `domain-boundaries.md`, the relevant slice contract, and only the relevant ADRs. Create or supersede an ADR when changing a long-lived decision.

## Work loop

For every non-trivial change: understand/reproduce → plan → implement → verify → self-review → independent review → fix → verify/review again → acceptance. Use the Planner, Builder, and Reviewer responsibilities in `docs/quality/development-lifecycle.md`. Do not create a plan for a trivial edit.

## Mandatory rules

- Use the verification tier owned by `docs/quality/testing-strategy.md`: documentation/plan-only changes run `make verify-docs`; runtime, dependency, configuration, and tooling changes run `make verify`; user-flow/browser changes also run `make e2e`. Run targeted checks while iterating.
- Dependencies flow inward toward domain contracts. Domains do not import another domain's internals; orchestration uses public application interfaces/events.
- Abstract real external boundaries (storage, queue, email, AI/ML, telemetry), not ordinary internal code.
- Schema changes require tested migrations. Never rely on manual production edits; destructive changes require an explicit plan and recovery path.
- Pin and time out external calls. Keep provider SDKs in adapters, validate outputs, record model/config versions, and use fakes in tests.
- Treat all user-supplied content as hostile. Bound and escape pasted text; for files also enforce type/size validation and isolated safe parsing. Always enforce authentication, authorization, and sensitive-log redaction.
- Update the relevant spec, ADR, runbook, or operational docs when behavior/contracts change. Avoid duplicated explanations; link to the owner document.
- Stay within scope. Preserve user changes and do not make unrelated cleanup.

## Definition of done

Requested behavior and acceptance criteria are satisfied; the required verification tier passes; migrations and operations are safe; docs are current; no known regression remains; and independent review has no `BLOCKER` or `MAJOR` findings. If credentials, product decisions, or risky production actions block completion, stop and report the exact blocker.
