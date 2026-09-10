# Execution plans

Use a plan for non-trivial feature, refactor, migration, or maintenance work. A plan is a living handoff document, not a status performance report.

Include goal and source links, non-goals, assumptions/open decisions, affected domains/contracts, security/operations/migration risks, ordered steps, test/observability changes, acceptance criteria, verification commands, rollout/recovery, and reviewer findings/resolution.

Create it in `active/` before implementation and keep it current when reality changes. After acceptance and a final `PASS`, append one outcome row to `completed/README.md`, then remove the active file; Git preserves its full history. Keep a separate completed document only while it owns an active recovery procedure or incident record. Trivial isolated edits do not need plans.

## Active plans

- [First vertical slice implementation](active/2026-09-01-first-vertical-slice-implementation.md) — implementation complete; external acceptance gates remain.
- [Book index and dedicated import surface](active/2026-09-10-book-index-and-import-surface.md) — implementation verification complete; acceptance pending.

Agents read only the plan for their current task. [Completed history](completed/README.md) is not part of the default implementation context.
