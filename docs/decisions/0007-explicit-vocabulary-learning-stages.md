# ADR-0007: Explicit vocabulary learning stages

- Status: Accepted
- Date: 2026-09-04

## Context

The initial slice stored one broad `learning` state beside `known` and `ignored`. Hands-on Reader acceptance found that insufficient for a learner to record increasing familiarity. Lookup must still remain non-mutating, and self-reported familiarity must not be presented as demonstrated recall.

## Decision

Use six explicit lemma-wide states: `new`, `recognized`, `familiar`, `learned`, `known`, and `ignored`. Null remains lookup-only/unclassified. Stages 1–4 are a manual familiarity scale; `learned` is not Recall Confirmed. `known` is a separate reversible self-report and `ignored` excludes noise without claiming knowledge.

The Reader exposes the ordered action tray Ignore, 1, 2, 3, 4, Known. Keyboard shortcuts are `Q`, `1`–`4`, and `E` while the context surface is active. Progress preserves its compact transport shape by aggregating stages 1–4 under `learning` while labeling the aggregate honestly.

The schema migration maps existing `learning` to `new`. A downgrade collapses all four stages back to `learning` and loses stage specificity; Known, Ignored, item identity, and history rows remain intact.

## Alternatives

- Keep one Learning state: rejected because it cannot express the accepted interaction.
- Make stage 4 equivalent to Known: rejected because the accepted panel has a distinct Known action and the meanings must remain separable.
- Save every lookup automatically as New: rejected because lookup alone must not create vocabulary or learning evidence.

## Consequences

- API clients and persisted enums understand four additional explicit states.
- Vocabulary state remains a simple enum rather than a speculative SRS/confidence model.
- A later scheduler can consume the states but must define its own evidence and transition policy; it may not reinterpret stage 4 as demonstrated recall.
