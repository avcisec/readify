# Development lifecycle and agent roles

## Lifecycle

```text
research → product specification → ADR when needed → execution plan
→ implementation → verification → independent review
→ preview/staging → acceptance → production
```

Research is evidence. A product spec promotes chosen behavior into acceptance criteria. An ADR records a durable technical choice. A non-trivial execution plan breaks approved behavior into reviewable work.

## Iterative completion loop

For implementation, bugs, refactors, and maintenance:

```text
understand/reproduce → plan → implement → verify → self-review
→ independent review → fix findings → verify/review again
→ confirm acceptance criteria → complete
```

On failure, diagnose and fix the root cause, rerun the narrow check, then the broader affected suite. Do not weaken tests, lint, architecture rules, validation, or acceptance merely to pass. A bug fix should reproduce the failure and leave a regression test whenever practical.

Stop with preserved findings and the exact blocker when progress requires an unresolved product choice, missing credentials/access, destructive production action, incompatible requirements, human architectural approval, or repeated evidence that the plan is wrong.

## Roles

### Planner

Reads product truth and relevant architecture, identifies affected domains/risks, resolves or lists uncertainties, writes acceptance criteria and an execution plan, and does not immediately modify application code.

### Builder

Implements the approved plan only, adds/updates behavior-focused tests, runs targeted and repository verification, updates owned docs, and records deviations for review.

### Reviewer

Independently checks the diff and evidence against product requirements, architecture, security, correctness, operations, and acceptance criteria. Findings use:

- `BLOCKER`: unsafe or cannot merge/ship.
- `MAJOR`: acceptance/correctness/security/architecture gap that must be fixed.
- `MINOR`: worthwhile non-blocking improvement.
- `PASS`: no actionable Blocker or Major finding.

The builder fixes all Blocker/Major findings and repeats verification and review. Completion requires no known regression and current documentation.

## Parallel worktrees

Use one task → one branch/worktree → implementation → verification → review → merge. Parallelize only independently specified work with disjoint ownership. Avoid concurrent edits to the same domain contract, migration sequence, shared API, or ADR. Rebase/integrate deliberately and rerun verification after combining work. Do not build a custom orchestrator until real coordination pain justifies it.

