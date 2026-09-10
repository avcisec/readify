# MVP scope

This document organizes, but does not replace, the priorities in [FEATURES.md](../../FEATURES.md). `Core`, `Plus`, and `Later` there remain the declared product scope until a product owner approves a narrower delivery sequence.

## Vision and audience

Readify turns content a learner chooses into an interactive French learning experience that connects reading, listening, vocabulary, grammar context, review, and honest progress.

The product loop is:

`choose content → import → read/listen → inspect a word or phrase → understand it in context → review later → see evidence-based progress → resume`

The initial audience is a self-directed French learner around late A2 to early B1 who can benefit from authentic input but still needs timely lexical, grammatical, and audio support.

Product principles:

- Keep the learner in the source context; vocabulary and review retain provenance.
- Connect reading and listening through a shared text/audio timeline, with graceful sentence-level fallback.
- Separate exposure, user-declared knowledge, and demonstrated recall.
- Explain automated analysis and confidence; do not present model output as human truth.
- Keep imported content private by default and make expensive processing visible and recoverable.
- Prefer a reliable end-to-end learning loop over a wide catalog of disconnected features.

## Declared Core outcome

A signed-in French learner can import supported private content, observe recoverable processing, open a structure-preserving reader, read and listen with synchronized position, inspect/save word or phrase context, review saved material, export to Anki, resume later, and see language-specific progress that distinguishes exposure, self-report, and recall.

Declared Core currently includes:

- email/session identity and one French learning profile;
- private Library and imports for pasted plain text, YouTube, EPUB, PDF, and Markdown;
- deduplication, native extraction, selective OCR, caption quality checks, align-only and ASR fallback;
- sentence/paragraph structure, French lemma/POS/morphology/dependency annotation;
- Page and Sentence views with vocabulary state, translation, player, sync, and alignment fallback;
- context vocabulary, three review card types, spaced review, and `.apkg` export;
- honest study/progress metrics, goal/streak, and a confidence-qualified CEFR estimate;
- observable, idempotent, asynchronous processing and private artifact handling.

## Delivery sequencing

The competitor synthesis originally recommended validating TXT/Markdown/EPUB before the costliest processing pieces. The product owner has since replaced TXT upload with direct pasted-text creation. The [pasted-text Reader learning-loop specification](../product-specs/pasted-text-reader-learning-loop.md) defines the first delivery slice: passwordless entry, one bounded plain-text submission, Page Reader, explicit vocabulary state, resume, and minimal honest progress. This is sequencing, not an approved reduction of the remaining declared Core; subsequent slice order remains in the [UX decision log](ux-decisions.md).

## MVP invariants

- Completing a lesson never silently marks vocabulary Known.
- Known is reversible self-report; Recall Confirmed requires evidence from delayed reviews.
- Audio and reading position survive switching reader views.
- Alignment degradation preserves usable sentence-level playback.
- Expensive jobs are deduplicated, versioned, retryable, and not tied to an HTTP request.
- All progress is scoped by learning language and derived from auditable events.

Detailed acceptance examples remain in the final section of [FEATURES.md](../../FEATURES.md) until promoted into individual product specs.

Cross-MVP interaction behavior is defined in the [user flows](user-flows.md), [screen inventory](screen-inventory.md), and [interaction model](interaction-model.md). These clarify broader behavior while individual product specifications control delivery-slice acceptance.

## Non-goals

The MVP excludes the `Later` items in [FEATURES.md](../../FEATURES.md), including:

- community, tutors, public publishing, social feeds, leaderboards, and challenges;
- voice cloning, speaking/writing assessment, and broad multi-language guarantees;
- podcast/RSS, DOCX, bulk import, advanced PDF reconstruction, and handwriting OCR;
- bidirectional Anki sync and advanced grammar/production cards;
- standalone raw-audio import;
- TXT upload, because plain-text intake uses direct paste/edit;
- microservice extraction or autoscaling before measured need;
- claims that a CEFR estimate is an official proficiency test.

Research findings do not enter scope merely because a competitor has a feature. Monetization, native mobile/offline behavior, and public-content licensing remain undecided until promoted into a product decision or specification.
