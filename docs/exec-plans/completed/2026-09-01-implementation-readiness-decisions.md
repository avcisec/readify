# First-slice implementation-readiness decisions

- Status: Completed; executable implementation plan intentionally gated
- Date: 2026-09-01
- Product spec: [Pasted-text Reader learning loop](../../product-specs/pasted-text-reader-learning-loop.md)
- Architecture contract: [Pasted-text slice contracts](../../architecture/pasted-text-slice-contracts.md)

> Superseded on 2026-09-01 by [blocker reclassification](2026-09-01-first-slice-blocker-reclassification.md): provider/legal approvals are production rollout gates, not prerequisites for fixture-backed implementation and verification. The historical outcome below records the earlier, overly broad gate.

## Goal

Resolve or explicitly route every remaining first-slice implementation-readiness decision: passwordless identity/email, deterministic French-to-Turkish meaning data, production text limit/counting, browser/assistive-technology support, and the French acceptance fixture.

## Scope

- Classify each item as product/business, legal/licensing, or technical engineering.
- Use current primary/vendor sources for unstable pricing, product capabilities, licenses, and standards.
- Compare two or three realistic options by MVP simplicity, cost, maintenance, privacy, lock-in, and scale.
- Make safe reversible technical decisions and record significant long-lived decisions in ADRs.
- Clearly separate recommendations from approvals that only a product owner or legal/data-protection owner can give.
- Prepare the first executable implementation plan only if no blocking approval remains.

## Non-goals

- No application code, dependency installation, schema/migration, account creation, vendor signup, contract acceptance, credential use, fixture execution, or provider integration.
- No feature expansion beyond the accepted first slice.

## Acceptance criteria

- Each requested decision has a recommendation, rationale, alternatives, cost/license implications, approval owner, and first-slice impact.
- Technical defaults are reflected consistently in the product spec, architecture contract, quality docs, or ADRs without duplicating owner text.
- Vendor/legal claims link to current primary sources and time-sensitive values are dated.
- Any remaining blocker is exact and cannot be mistaken for an engineering uncertainty.
- If approvals remain, no executable implementation plan is falsely marked ready; if none remain, a scoped active plan is prepared without implementation.
- `make product-check` and `make verify` pass with no `BLOCKER` or `MAJOR` reviewer findings.

## Verification

```bash
make product-check
make verify
```

## Outcome

- Recommended Clerk email links and Lexicala French→Turkish API in Proposed ADRs; recorded the exact finance/privacy/licensing approvals required before either becomes Accepted.
- Accepted the 50,000-Unicode-scalar normalization policy, 512 KiB request-body ceiling, 24-hour idempotency window, WCAG 2.2 AA browser/AT matrix, and repository-authored CC0 French fixture.
- Updated the product specification, architecture contract, quality policy, decision index, UX decision log, and verification harness so old provisional wording cannot silently return.
- Did not create the first executable implementation plan because the Clerk and Lexicala human approval gates remain unsatisfied.

## Review

- **PASS:** each requested decision is classified, compared, cost/license-qualified, connected to first-slice impact, and mechanically linked to its owner document.
- **PASS:** no provider SDK, account, credential, application runtime, schema, dependency, or product implementation was introduced.
- **PASS:** no `BLOCKER` or `MAJOR` documentation finding remains. The two named human approvals are deliberate stopping conditions, not hidden engineering work.

## Verification result

```text
make product-check  PASS
make verify         PASS
```

Foundation-only typecheck, application tests, integration/API tests, and migration execution remain explicit fail-closed skips because no application runtime or schema exists.
