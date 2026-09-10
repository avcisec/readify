# Documentation context optimization

- Status: implementation active
- Date: 2026-09-10
- Scope owner: [Agent operating guide](../../../AGENTS.md)

## Goal

Reduce the default documentation context needed by a fresh coding agent while preserving current product truth, architecture contracts, accepted ADRs, research evidence, and recoverable implementation history.

## Changes

- Replace broad progressive-disclosure guidance with a task-based read matrix in `AGENTS.md`.
- Consolidate product vision and non-goals into the MVP scope owner.
- Summarize completed execution plans in one historical index; full plan text remains recoverable from Git history.
- Consolidate active-plan routing in `docs/exec-plans/README.md`.
- Add mechanical context-budget checks for active plan count, oversized active documents, and completed-plan sprawl.
- Keep detailed competitor research intact and explicitly outside the default agent read path.

## Non-goals

- Rewriting research evidence or accepted ADR history.
- Compressing documents by deleting active requirements.
- Enforcing a repository-wide token count that would encourage opaque prose.

## Acceptance

- Product and architecture links remain valid.
- Completed plan history is understandable from its index and recoverable from Git.
- Agents receive a minimal task-specific read set.
- `make verify` mechanically prevents the same context sprawl from returning.
- Markdown file count and active-document line count decrease without loss of current requirements.

## Evidence

- Markdown count under `docs/` reduced from 113 to 93 files.
- Product vision/non-goals now live with MVP scope; completed-plan detail reduced from 10 documents/645 lines to one routed history index.
- `AGENTS.md` is a 38-line task router and excludes bulk reads of docs, completed plans, and research.
- Mechanical checks cap active plans at three, active documents at 500 lines, `AGENTS.md` at 80 lines, and completed-plan detail at the history index.
- Targeted documentation/context-budget tests and full repository verification passed. Human acceptance remains before this plan is summarized and removed from `active/`.
