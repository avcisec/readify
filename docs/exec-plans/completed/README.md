# Completed plan history

Completed plans are summarized here so agents do not load obsolete implementation instructions. Current behavior belongs to the linked spec, architecture contract, ADR, or operating guide. Full historical plan text remains available through Git, for example:

```bash
git log --all --full-history -- docs/exec-plans/completed/<plan>.md
git show <commit-before-removal>:docs/exec-plans/completed/<plan>.md
```

| Date | Completed work | Current authority |
| --- | --- | --- |
| 2026-08-31 | Repository documentation, tooling, lifecycle, and verification foundation | [AGENTS.md](../../../AGENTS.md), [Architecture](../../../ARCHITECTURE.md) |
| 2026-08-31 | Skeptical foundation review fixed false-green checks, ownership ambiguity, and redundant handoff design | [Development lifecycle](../../quality/development-lifecycle.md), [domain boundaries](../../architecture/domain-boundaries.md) |
| 2026-09-01 | First vertical-slice product specification | [Pasted-text Reader spec](../../product-specs/pasted-text-reader-learning-loop.md) |
| 2026-09-01 | Implementation-readiness decisions and blocker reclassification | [First-slice readiness](../../product/first-slice-implementation-readiness.md) |
| 2026-09-01 | Pasted-text architecture and API contracts | [Pasted-text contracts](../../architecture/pasted-text-slice-contracts.md) |
| 2026-09-01 | TXT upload replaced with direct pasted-text import | [Pasted-text Reader spec](../../product-specs/pasted-text-reader-learning-loop.md) |
| 2026-09-01 | Product flows, screen inventory, interaction model, and low-fidelity wireframes | [Product index](../../product/README.md) |
| 2026-09-02 | Visual foundation and Reader/Library polish | [Visual foundation](../../product/visual-foundation.md) |
| 2026-09-04 | First UI/UX feedback round: profile summary, responsive Reader/navigation, semantic resume, language blocking, explicit vocabulary stages, and Undo | [Pasted-text Reader spec](../../product-specs/pasted-text-reader-learning-loop.md), [ADR-0007](../../decisions/0007-explicit-vocabulary-learning-stages.md) |
| 2026-09-10 | Agent context routing, product-doc consolidation, completed-plan indexing, and detailed competitor-research archival | [Agent operating guide](../../../AGENTS.md), [research index](../../research/README.md) |
| 2026-09-10 | Retry-isolated, focused browser journeys; configurable test DB port; retained failure artifacts; green Chromium/Firefox/WebKit CI | [Testing strategy](../../quality/testing-strategy.md), [deployment](../../operations/deployment.md) |
| 2026-09-10 | Risk-based documentation, runtime, and browser verification routing with mechanically checked CI path coverage | [Testing strategy](../../quality/testing-strategy.md), [deployment](../../operations/deployment.md) |
| 2026-09-10 | Dedicated Import surface, private book index, ordered chapter list, and section-scoped Reader navigation | [Screen inventory](../../product/screen-inventory.md), [pasted-text contracts](../../architecture/pasted-text-slice-contracts.md) |

New completed work is appended as one concise row after acceptance. Do not retain a separate completed plan unless its recovery procedure or incident evidence is still operationally active.
