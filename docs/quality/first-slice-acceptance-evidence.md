# First-slice acceptance evidence

- Status: Automated evidence implemented; manual desktop AT smoke and independent review pending
- Product spec: [Pasted-text Reader learning loop](../product-specs/pasted-text-reader-learning-loop.md)
- Execution plan: [First vertical slice implementation](../exec-plans/active/2026-09-01-first-vertical-slice-implementation.md)

This index prevents a green aggregate command from being mistaken for acceptance without scenario-level evidence. Test names are stable evidence locators; line numbers are intentionally omitted.

| Scenario | Executable evidence |
| --- | --- |
| 1. Passwordless entry | Browser happy path; PostgreSQL integration `enforces one-time proofs and create-only French profile`; production adapter-gate unit tests. |
| 2. Minimal onboarding | Browser happy path selects B1 and reaches Library; profile integration covers French-only/create-only behavior. |
| 3. Valid import | Browser happy path observes the immediate processing item; PostgreSQL integration asserts `202` before jobs run. |
| 4. Input boundary | Normalization unit tests cover whitespace/limit/ill-formed Unicode/scalar counting/literal markup; browser HTTP-boundary test covers malformed and oversized bodies; escaped fixture markup is asserted in Reader. |
| 5. Language mismatch | PostgreSQL integration `does not persist a policy-qualified language mismatch`; the application contract requires explicit acknowledgment for the successful retry. |
| 6. Duplicate | PostgreSQL integration covers idempotent replay, duplicate reuse, and concurrent duplicate arbitration. |
| 7. Background continuity | PostgreSQL lease-recovery integration plus separately runnable worker and durable job state; browser flow observes processing through Library polling. |
| 8. Honest progress | Browser flow asserts processing status has no fabricated percentage; the processing contract exposes `progress: null` until a reliable total exists. |
| 9. Partial readiness | PostgreSQL integration `keeps Reader available after analyzer exhaustion and supports a targeted retry` proves three failed attempts, degraded Reader, and analysis-only recovery. |
| 10. Structure and title | Normalization units and the main PostgreSQL integration cover CRLF, outer blanks, scalar-safe title, paragraph order, persistence, and non-BMP text. |
| 11. No silent learning | Main PostgreSQL integration asserts empty Vocabulary/zero state counts after opening Reader; completion affects only structural progress. |
| 12. Contextual lookup | Browser happy path covers in-place context, loading announcement, focus entry, surface/lemma/sentence/meaning/provenance/state controls, and Axe serious/critical scan. |
| 13. Meaning degradation | PostgreSQL integration covers deterministic `unavailable`; browser happy path reissues only the context query with `Anlamı yeniden dene` while state controls remain present. |
| 14. Learning state | Browser and PostgreSQL happy paths cover explicit Learning, lemma-wide visible projection, Vocabulary, and persistence. |
| 15. Lemma-wide Known | PostgreSQL integration marks one `choisir` inflection Known and asserts both analyzed inflections update, while Progress remains self-report-only. |
| 16. Undo | Browser happy path and PostgreSQL integration cover successful Undo; lease/race integration rejects stale Undo. |
| 17. Idempotent re-encounter | PostgreSQL integration proves repeated lemma occurrences resolve to one vocabulary item and reports the authorized occurrence count. |
| 18. Mutation failure | Browser happy path intercepts the first state command with `503`, verifies confirmed state is unchanged, then retries once successfully; database idempotency tests cover replay conflict. |
| 19. Resume | Browser happy path saves from Reader, switches viewport, uses `Devam et`, and observes confirmed state; PostgreSQL integration verifies semantic locator persistence. |
| 20. Minimal Progress | PostgreSQL integration asserts exactly one completion, two Learning lemmas, one self-marked Known lemma, and no recall field. |
| 21. Mobile context | Dedicated browser test verifies the fixed bottom context surface, Escape dismissal, and focus return at 390×844; the happy path also resumes across viewport size. |
| 22. Keyboard flow | Browser tests use keyboard sign-in activation, Reader arrow navigation, Escape/focus return, visible focus, and Axe scanning. The required manual NVDA+Firefox or VoiceOver+Safari smoke remains pending. |
| 23. Authorization | PostgreSQL integration proves cross-account list filtering and indistinguishable `404` for Reader, item, context, position, completion, and vocabulary mutation; browser boundary covers unauthenticated access and cross-origin command rejection. |

## Commands

```bash
make verify
make e2e
pnpm build
```

The Stanza container is an optional provider-contract artifact and is verified separately with a non-root real-model smoke. Normal CI remains offline/deterministic and uses recorded analysis.

## Remaining acceptance evidence

- Run and record the critical loop with either current NVDA + Firefox on Windows or VoiceOver + Safari on macOS, including exact versions and findings.
- Obtain a genuinely independent Reviewer result with no unresolved `BLOCKER` or `MAJOR` findings.
- Exercise the same immutable build in an access-restricted synthetic preview before moving the execution plan to `completed/`.

These are acceptance gates, not reasons to weaken or duplicate the automated harness.
