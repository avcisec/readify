# First-slice blocker reclassification

- Status: Completed
- Date: 2026-09-01
- Product spec: [Pasted-text Reader learning loop](../../product-specs/pasted-text-reader-learning-loop.md)
- Readiness register: [First-slice implementation readiness](../../product/first-slice-implementation-readiness.md)

## Goal

Challenge whether each previously listed decision is necessary to implement and deterministically verify the first vertical slice, separate implementation acceptance from production launch acceptance, defer choices that do not meet that threshold, and create the first executable implementation plan if no true implementation blocker remains.

## Non-goals

- No application code, runtime manifest, dependency, schema, migration, provider account, credential, or external integration.
- No weakening of the accepted product behavior, security boundaries, or deterministic acceptance scenarios.
- No production-launch claim from fixture-backed or non-production adapters.

## Method and acceptance

- Classify each decision as required for implementation/verification, required only for production launch, or not yet required.
- Remove premature provider ADRs and provider-specific contract language when selection is deferred.
- Retain only the smallest concrete limits, fixtures, and accessibility evidence needed for deterministic implementation.
- Update the verification harness so it enforces the new readiness boundary rather than obsolete vendor gates.
- If no implementation blocker remains, add an active, ordered first-slice implementation plan with explicit production exclusions and verification/review loops.
- Run `make product-check` and `make verify`; record a Reviewer pass with no `BLOCKER` or `MAJOR` findings.

## Outcome

- Reclassified managed identity/email and licensed meanings as production rollout choices, not implementation prerequisites; removed their premature Proposed ADRs.
- Split character policy into the required scalar/counting contract plus 50,000-scalar implementation limit and a deferred measured production quota.
- Reduced accessibility from a public support matrix to the required multi-engine/keyboard baseline plus one representative desktop screen-reader smoke; deferred mobile/public support commitments.
- Kept the CC0 French fixture as the only listed decision that truly blocked deterministic acceptance; it was already resolved.
- Added the executable [first vertical slice implementation plan](../active/2026-09-01-first-vertical-slice-implementation.md) without adding application code.

## Reviewer record

- **PASS:** every listed decision now uses an explicit implementation-blocker test.
- **PASS:** deferral does not remove provider ports, failure/provenance behavior, tenant isolation, accessibility semantics, or production safeguards.
- **PASS:** non-production adapters must fail closed in production, preventing fixture-backed evidence from being mistaken for launch readiness.
- **PASS:** no `BLOCKER` or `MAJOR` finding remains; the active implementation plan is scoped and executable without external approval or credentials.

## Verification result

```text
make product-check  PASS
make verify         PASS
```
