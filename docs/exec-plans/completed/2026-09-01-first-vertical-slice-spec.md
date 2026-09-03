# First vertical-slice product specification

- Status: Completed
- Date: 2026-09-01
- Source: approved continuation of the recommended post-wireframe phase

## Goal

Promote the recommended first delivery slice into an acceptance-ready product specification that can drive the next architecture/API contract phase without implementing application code.

## Scope

- Resolve only decisions required for one coherent private-text → Library → Page Reader → contextual word state → Vocabulary → resume → minimal honest progress loop.
- State exact user-visible validation, loading, success, failure, responsive, accessibility, and acceptance behavior.
- Identify affected product domains and contract questions without endpoints, schemas, database tables, packages, or providers.

## Non-goals

- No production code, executable fixture, API/schema design, architecture change, provider installation, or dependency selection.
- No silent change to the broader declared Core MVP.
- No design of audio/TTS/sync, Sentence View, phrase selection, Review/SRS, `.apkg`, AI meaning generation, PDF/EPUB/Markdown/YouTube, or full Progress behavior in this slice.

## Inputs

- `idea.md`, `FEATURES.md`
- `docs/product/README.md`, `mvp-scope.md`, `user-flows.md`, `interaction-model.md`, `wireframes.md`, `ux-decisions.md`
- `docs/product-specs/README.md`
- relevant domain, job, security, testing, and performance constraints

## Acceptance criteria

- A fresh planner can determine exactly what behavior belongs in the first slice and what does not.
- Every included surface has normal, empty/loading/error/success, responsive, and accessibility behavior where applicable.
- Product acceptance scenarios are observable and provider/implementation neutral.
- Decisions consumed by the spec are recorded as slice decisions; broader unresolved decisions remain open.
- Backend implications name capabilities/domains but no API or data design.
- `make product-check` and `make verify` pass.

## Verification

```bash
make product-check
make verify
```

Review findings and disposition will be appended before completion.

## Outcome

- Created the acceptance-ready first-slice specification, subsequently revised under an approved product decision as the [pasted-text Reader learning loop](../../product-specs/pasted-text-reader-learning-loop.md).
- Applied reversible first-slice defaults without reducing the broader declared Core MVP.
- Recorded user-visible behavior, failure/recovery behavior, responsive and accessibility constraints, 23 observable acceptance scenarios, acceptance evidence, capability-level backend implications, and external blockers.
- Updated the product/spec indexes, delivery-sequencing record, and mechanical product checks so the specification is discoverable and required.

## Self-review

- No production code, API endpoints, schemas, provider SDKs, or architecture contracts were introduced.
- Page View, pasted-text-only intake, and minimal Progress are explicitly slice sequencing; broader Core behavior remains authoritative in `FEATURES.md` and cross-MVP UX documents.
- Lookup remains non-mutating, vocabulary state is explicit and reversible, Known is lemma-wide self-report, and completion creates no learning claim.
- UI states never fabricate processing percentages, recall, mastery, exposure, or synchronized persistence.

## Reviewer disposition

- **BLOCKER:** none.
- **MAJOR:** none.
- **MINOR:** corrected the stale MVP-scope statement that still described first-slice sequencing as unresolved.
- **PASS:** the spec is coherent with product invariants, separates slice scope from roadmap priority, names external blockers, and is ready to drive provider-neutral architecture/API contracts.

## Verification result

```text
make product-check  PASS
make verify         PASS
```
