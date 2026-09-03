# Product flow and wireframe definition

- Status: Completed
- Date: 2026-09-01
- Source: product-flow and low-fidelity wireframe definition request

## Goal

Define the MVP interaction model, primary and secondary user flows, screen/surface inventory, responsive low-fidelity wireframes, critical state transitions, accessibility constraints, backend/API implications, and material open decisions before architecture contracts or application code.

## Non-goals

- No production frontend/backend code, endpoint/schema design, visual system, branded mockups, or pixel specifications.
- No silent reduction or expansion of the declared Core scope in `FEATURES.md`.
- No architecture or provider selection changes.
- No detailed AI evaluation, content-policy, pricing, social, or later-feature design.

## Inputs and affected documents

- Product truth: `idea.md`, `FEATURES.md`.
- Existing interpretation: `docs/product/` and `docs/product-specs/README.md`.
- Evidence: competitor comparison and flow/reader/audio/vocabulary/import/progress/responsive research.
- Constraints: `AGENTS.md`, `ARCHITECTURE.md`, relevant architecture and quality documents.
- Outputs: refine `docs/product/user-flows.md`; add `screen-inventory.md`, `interaction-model.md`, `wireframes.md`, and a concise UX decision log.

## Risks and controls

- Broad declared Core scope versus research-recommended delivery sequencing: preserve MVP behavior while flagging first-slice sequencing for approval.
- Reader overload: keep lookup/state changes contextual and move management/review/progress to separate surfaces.
- Audio speculation: distinguish declared Core from recommended first useful degradation levels; do not reclassify scope.
- Backend leakage: list implied capabilities without endpoints, schemas, tables, or services.
- Responsive inconsistency: define structural desktop/tablet/mobile transformations for every major surface.

## Work

1. Read source material and extract invariant behavior, contradictions, and open decisions.
2. Define loops, navigation/surface hierarchy, screen states, and Reader interaction rules.
3. Define import, vocabulary, audio/sync, resume, review, progress, and settings transitions.
4. Create low-fidelity desktop plus structurally distinct mobile wireframes.
5. List backend/API implications and only material human decisions.
6. Verify documentation and self-review for scope, friction, consistency, and avoidable backend complexity.

## Acceptance criteria

- A designer or engineer can trace every primary MVP loop, state, entry/exit, and failure path.
- Reader lookup and playback behavior are unambiguous without prescribing visual polish.
- Every MVP screen has purpose, entry points, actions, information, empty/loading/error/success, and exits.
- Desktop/mobile structural differences and baseline accessibility constraints are explicit.
- Wireframes cover every major MVP surface without redundant screens or modal-heavy flow.
- Backend/API implications avoid implementation design.
- Open decisions use decision/reason/default/alternatives/change-impact and do not repeat resolved requirements.
- `make verify` passes and review has no `BLOCKER` or `MAJOR` findings.

## Verification

```bash
make verify
```

Reviewer findings and resolution will be appended before moving this plan to `completed/`.

## Outcome

- Defined Library-centered navigation and the complete import → Reader → vocabulary → review → progress → resume loop.
- Added a nine-surface MVP inventory with empty/loading/error/success and navigation behavior.
- Defined Reader layout, word/expression selection, vocabulary states, semantic resume, audio/sync degradation, responsive transformations, accessibility constraints, and critical state transitions.
- Added low-fidelity wireframes for authentication, onboarding, Library states, Import, Page/Sentence Reader, mobile lookup, Vocabulary, Review, Progress, and Settings.
- Recorded backend/API capabilities implied by UX without endpoints, schemas, tables, or architecture changes.
- Consolidated material human choices in the UX decision log and removed their duplication from broad open questions.
- Added a mechanical `product-check` to the repository verification harness.

## Self-review and reviewer disposition

The friction review removed an unnecessary exit-review confirmation, clarified that Add card does not silently change vocabulary state, kept lookup to one contextual surface, and kept processing within Library rather than creating a destination. The scope review confirmed that Plus/Later features are absent or explicitly deferred, standalone raw-audio import was not invented, and broad declared Core was not silently narrowed by competitor recommendations.

Responsive behavior is structurally consistent, accessibility constraints cover the risky token/player/drawer interactions, and backend implications state capabilities rather than implementation. No architecture document or application code changed.

Verification:

```bash
make product-check
make verify
```

Reviewer disposition: `PASS`; no `BLOCKER` or `MAJOR` findings remain in this documentation scope.
