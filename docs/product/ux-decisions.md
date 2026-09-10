# UX decisions and approval log

This log separates interaction decisions resolved from existing product evidence from material choices that still need human approval. Broader operational/architecture uncertainties remain in [open questions](open-questions.md).

## Resolved from current product truth

| Decision                        | Resolution                                                                                                                                                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product center                  | Library is authenticated home; Reader is the central learning surface.                                                                                                                                                                       |
| Reader lookup                   | One contextual surface: desktop side panel, tablet drawer, mobile bottom sheet; no lookup navigation or routine modal.                                                                                                                       |
| Vocabulary state                | Lookup-only unclassified plus explicit 1 New, 2 Recognised, 3 Familiar, 4 Learned, Known, and Ignored; Recall Confirmed remains derived evidence.                                                                                            |
| Save behavior                   | Lookup alone saves no vocabulary/card. Selecting 1–4, Known, Ignore, or Add card is explicit and reversible.                                                                                                                                 |
| Completion                      | Completing a section never bulk-marks words Known.                                                                                                                                                                                           |
| Processing                      | Status belongs to Library items; valid text opens even when optional audio/analysis is pending or failed.                                                                                                                                    |
| Audio degradation               | Word timing when valid, sentence timing fallback, unsynchronized playback label when only audio is usable.                                                                                                                                   |
| Resume                          | Restore semantic text anchor, view, sentence, and playback position; never count opening as reading.                                                                                                                                         |
| Responsive Reader               | Side panel becomes drawer/bottom sheet; compact player stays available and must not hide selected text.                                                                                                                                      |
| Standalone audio import         | Not an MVP source because current product truth lists pasted text, YouTube, EPUB, PDF, and Markdown only.                                                                                                                                    |
| Plain-text intake               | TXT file upload is removed. Users paste or type into a large plain-text field; clipboard formatting is discarded and paragraph breaks are retained.                                                                                          |
| First-slice technical readiness | The 50,000-scalar implementation limit, WCAG 2.2 AA verification baseline, and CC0 French fixture are accepted; vendor selection and public support policy are deferred in [first-slice readiness](first-slice-implementation-readiness.md). |

## Applied to the first vertical slice

The [pasted-text Reader learning-loop specification](../product-specs/pasted-text-reader-learning-loop.md) applies these reversible defaults: Turkish UI, passwordless email behavior, French-only profile, one plain-text submission up to 50,000 scalar values, Page View, one non-AI preferred meaning with provenance, explicit 1–4/Known/Ignore/Undo, semantic resume, and structural/self-report-only Progress. Implementation uses deterministic non-production identity/meaning adapters. Managed providers, licensed production data, a final launch quota, and a public browser/AT promise are deferred rollout decisions, not implementation blockers.

## Open decisions requiring approval

### 1. Subsequent MVP slice sequencing and fixture set

- **Decision:** which capability follows the accepted pasted-text loop and how later fixtures cover the full declared Core.
- **Why it matters:** determines whether the next contracts validate timed audio/sync risk, Sentence View/grammar, Review/SRS, or another import type.
- **Recommended default:** add one licensed timed-audio fixture next to validate playback, sentence timing, word timing/fallback, and resume before widening import formats.
- **Alternatives:** Sentence View/language intelligence; Review/SRS; EPUB/PDF/Markdown/YouTube import breadth; deliver remaining Core together.
- **Impact if changed later:** low before the next contract, high after media/content/review contracts and fixtures exist.

### 2. Launch interface language

- **Decision:** whether the full MVP launch remains Turkish after the Turkish first-slice validation cohort.
- **Why it matters:** affects all copy, help, word-meaning language, layout testing, and launch assumptions.
- **Recommended default:** retain Turkish through MVP validation; externalize copy and avoid a language switcher until Plus.
- **Alternatives:** bilingual UI at launch; browser-locale default.
- **Impact if changed later:** medium if copy is externalized early; high if product/help text is embedded ad hoc.

### 3. YouTube connector availability and fallback

- **Decision:** whether/where URL import is legally and operationally enabled, and what the user can provide when captions/audio cannot be accessed.
- **Why it matters:** determines whether YouTube appears in Import and which recoverable error actions are truthful.
- **Recommended default:** hide the connector unless the environment is explicitly approved; when enabled, label it experimental and fall back to compliant embed plus user-provided transcript/subtitles only if that fallback is approved for the same release.
- **Alternatives:** disable for MVP; caption-only import; embed-only lesson with user transcript.
- **Impact if changed later:** medium at the UX boundary, high if content/audio processing assumes unrestricted media access.

### 4. Review scheduling and Recall Confirmed policy

- **Decision:** scheduler, rating semantics, delayed interval, and exact two-success rule.
- **Why it matters:** drives due counts, answer effects, explanations, progress truth, and migration of existing schedules.
- **Recommended default:** choose a mature, explainable scheduler and version the policy; require successful delayed reviews on two distinct local dates as currently stated, with exact minimum delays validated before launch.
- **Alternatives:** simple fixed Leitner intervals; another established SRS; no Recall Confirmed until validated.
- **Impact if changed later:** high for schedules and mastery history unless events are preserved and policy is versioned.

### 5. Learning Score and CEFR readiness

- **Decision:** whether current formulas are approved product rules or hypotheses pending validation.
- **Why it matters:** Progress can create false authority even when calculation is deterministic.
- **Recommended default:** show transparent exposure/recall metrics first; label score policy version and keep CEFR at `Collecting data` until thresholds and calibration are approved.
- **Alternatives:** ship the current formulas immediately; omit score/CEFR from the first slice while preserving declared MVP scope.
- **Impact if changed later:** medium if raw events and policy versions are retained; high if only aggregates are stored.

### 6. `.apkg` delivery sequencing

- **Decision:** whether media-bearing `.apkg` must be in the first release or a later MVP slice.
- **Why it matters:** export interaction is simple, but media packaging, stable GUID compatibility, background status, and acceptance in Anki add a distinct vertical concern.
- **Recommended default:** keep `.apkg` in declared MVP but deliver after Reader/Vocabulary/Review state is stable; do not substitute CSV without product approval.
- **Alternatives:** first-release `.apkg`; temporary TSV/CSV validation; defer all export.
- **Impact if changed later:** low before external users rely on GUID/note types, high after exported decks exist.
