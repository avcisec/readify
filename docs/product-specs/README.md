# Product specifications

Write an acceptance-ready spec here before implementing a feature. A spec should link to its product source, name the user/outcome, define in-scope and out-of-scope behavior, cover permissions and failure states, state observable acceptance criteria, identify affected domains/events, and list unresolved decisions.

Do not copy broad vision or architecture text into a spec; link to the owner document. Use a short kebab-case filename such as `pasted-text-import.md`. The first spec should select one end-to-end vertical slice and explicitly resolve the sequencing question in [MVP scope](../product/mvp-scope.md).

Before specifying UI behavior, read the [interaction model](../product/interaction-model.md), relevant [wireframes](../product/wireframes.md), and [UX decision log](../product/ux-decisions.md). A spec must resolve any open decision it depends on rather than choosing silently.

## Current specifications

- [Pasted-text Reader learning loop](pasted-text-reader-learning-loop.md) — ready for executable implementation planning with deterministic non-production adapters; production rollout gates remain in [first-slice readiness](../product/first-slice-implementation-readiness.md)
