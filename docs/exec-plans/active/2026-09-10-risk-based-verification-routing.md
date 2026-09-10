# Risk-based verification routing

- Status: implementation active
- Date: 2026-09-10
- Scope owner: [Testing strategy](../../quality/testing-strategy.md)

## Goal

Reduce agent context, local runtime, and CI minutes without weakening the checks relevant to a changed surface.

## Changes

1. Add a fast `make verify-docs` gate for documentation and execution-plan-only changes.
2. Route documentation, runtime verification, and browser acceptance through separate GitHub workflows using native path filters.
3. Keep mixed changes additive: every matching workflow runs.
4. Mechanically verify the routing entry points so future edits cannot silently collapse the tiers.
5. Document a concise risk-based matrix for agents and operators.

## Non-goals

- Skipping tests for affected behavior.
- Adding a third-party path-classification action or custom CI orchestrator.
- Optimizing media/AI evaluation pipelines that do not yet exist.
- Changing application behavior, dependencies, or production deployment.

## Risks and recovery

- An incomplete Browser path list could miss a regression; critical runtime and dependency surfaces remain explicit and mechanically checked.
- GitHub path filters operate at workflow trigger level; mixed changes deliberately run multiple workflows.
- Revert the workflow/routing commit to restore the previous all-change pipeline; application rollback is unnecessary.

## Acceptance

- A docs-only change runs Documentation but not Verify or Browser.
- Runtime-only changes run Verify; Browser additionally runs for declared user-flow surfaces.
- Workflow/tooling changes validate their own routing.
- `make verify-docs`, `make verify`, workflow syntax/format, and routing regression tests pass.
- No `BLOCKER` or `MAJOR` review finding remains.

## Verification

```bash
make verify-docs
make verify
pnpm exec prettier --check '.github/**/*.yml'
git diff --check
```

## Review

- `make verify-docs` passed with eight routing/context harness tests and no Node dependency installation.
- `make verify` passed after the workflow, Makefile, and verifier changes; workflow YAML formatting and `git diff --check` passed.
- Application behavior and browser commands are unchanged, so local E2E was not repeated; the relocated Browser workflow remains the CI acceptance authority for its own routing change.
- Self-review confirmed docs-only, runtime-only, browser-impacting, mixed, fixture, dependency, and workflow-file path classes. No `BLOCKER` or `MAJOR` self-review finding remains; GitHub CI and human acceptance are pending.
