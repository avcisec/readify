# Product interaction model

This document owns cross-screen interaction behavior for the declared MVP. It refines [user flows](user-flows.md) without selecting backend design or visual styling.

## Interaction priorities

1. Reading/listening remains primary; lookup never navigates away.
2. The common path has one focus and one obvious next action.
3. Expensive or uncertain processing is visible but does not hold the learner on a waiting screen.
4. User-declared state, system-derived analysis, and demonstrated recall are visibly distinct.
5. Optional detail is progressively disclosed.

## Where actions live

| Interaction form                   | MVP use                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| One-click/tap                      | play/pause, ±5 seconds, repeat sentence, vocabulary stage/Known/Ignore, Add card, Undo, Continue, answer rating |
| Inline                             | validation, save status, processing progress, sync quality/state, recoverable error, section progress           |
| Contextual surface                 | word/expression meaning, source sentence, pronunciation, current state, translation provenance, grammar details |
| Side panel / drawer / bottom sheet | the contextual surface: side panel on desktop, drawer on tablet, bottom sheet on mobile                         |
| Modal dialog                       | destructive deletion and `.apkg` export confirmation                                                            |
| Separate screen                    | Import, Vocabulary management, focused Review, Progress, Profile/Settings                                       |

Do not use a modal for ordinary word lookup, import progress, provider failure, or Reader settings. Import is a dedicated screen so the Library remains focused on choosing content.

## Reader layout

### Persistent regions

- **Reader header:** Back to Library, title, current chapter/section, section chooser, Page/Sentence switch, section progress.
- **Content area:** bounded readable line length; document hierarchy in Page View or one focused sentence in Sentence View.
- **Context area:** closed by default; opens for a word/expression and does not replace the content.
- **Player:** persistent compact bar while audio exists or is processing; does not obscure content/context.
- **Status messaging:** small inline banners for unsaved state, partial readiness, lookup/analysis degradation, or sync processing.

The Reader does not show full global navigation, Progress dashboards, due-card lists, import controls, or vocabulary tables.

### Page View

- Continuous content preserves chapter, heading, paragraph, and PDF page anchors.
- All eligible tokens are focusable/clickable.
- The active audio sentence is highlighted; the current word is additionally highlighted only when valid word timing exists.
- Section controls remain reachable without loading the entire document.
- Explicit `Complete section` affects structural progress only.

### Sentence View

- Shows one stable sentence with previous/next navigation and position (`12 of 84`).
- Provides sentence play/repeat, contextual translation, learner-friendly grammar roles, phrase groups, and word selection.
- Full dependency tree and parent/head details stay collapsed until requested.
- `Review sentence` starts a focused review and preserves the return position.

Switching views keeps the current sentence, audio time, selected vocabulary item when possible, and vocabulary state. The lesson-level view preference persists for resume.

## Word and expression interaction

### Word

```text
click/tap/focus token
→ selected token and containing sentence become current
→ contextual surface opens with skeleton/loading state
→ show surface form + lemma + current explicit state
→ show one preferred contextual meaning and source/provenance
→ optional actions: 1 New | 2 Recognised | 3 Familiar | 4 Learned | Known | Ignore
→ optional detail: pronunciation, morphology/POS, grammar in sentence, occurrences
```

Lookup failure leaves the token selected; already available state and deterministic annotation remain visible. Retry appears only for a failure classified as retryable. Selecting another token replaces the panel content without stacking panels.

### Expression

The learner uses normal text selection, then chooses `Use expression` from a small contextual action. The context surface shows the exact selected span and sentence before any save. Desktop supports mouse/keyboard selection; touch devices use native selection handles. A simple click continues to mean a single token.

### Common actions

- **1–4 learning stages:** explicitly create/update the vocabulary item from New through Learned and preserve the occurrence. Learned remains self-reported familiarity, not demonstrated recall.
- **Known:** applies to the lemma and its forms, clearly says `Applies to this lemma`, pauses existing cards, and is reversible.
- **Ignore:** removes a proper name/noise item from learning treatment without claiming knowledge.
- **Add card:** explicitly saves the selected word/expression when needed and adds it to review; it does not silently change its vocabulary state.
- **Undo:** appears immediately in the context surface and transient confirmation; undo restores inherited occurrence presentation.

State saves optimistically only when the UI can show pending state. Failure restores the confirmed state and offers Retry; it never leaves an ambiguous half-saved highlight.

## Vocabulary text states

The editable vocabulary states are:

| State          | Meaning                                           | Reader treatment                                           |
| -------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| Unclassified   | lookup only; no explicit learner decision         | subtle token treatment; not stored in Vocabulary           |
| 1 · New        | explicitly saved as new                           | first-stage persistent emphasis                            |
| 2 · Recognised | learner recognizes it                             | second-stage persistent emphasis                           |
| 3 · Familiar   | learner reports strong familiarity                | third-stage persistent emphasis                            |
| 4 · Learned    | highest learning stage, still not recall evidence | fourth-stage persistent emphasis                           |
| Known          | reversible self-report at lemma level             | neutral text; context surface/accessible name states Known |
| Ignored        | excluded noise/proper name                        | neutral text; context surface states Ignored               |

While the context surface is open, `1`–`4` select the matching stage, `Q` selects Ignore, and `E` selects Known. Shortcuts never fire from editable controls or with modifier keys.

“Unseen” is an exposure/analytics fact, not another vocabulary state or permanent visual style. Recall Confirmed is a derived learning result shown in Vocabulary/Progress, not a Reader editing state. Every state uses text plus icon/underline/pattern where displayed; color is supplementary.

## Reading and resume state

Persist at debounced semantic scroll checkpoints and on navigation/backgrounding, even when the learner never opens a word:

- Library item and current document revision;
- chapter/section and stable paragraph/sentence anchor;
- Page/Sentence view preference;
- Page scroll anchor or Sentence View index;
- playback media variant, actual time, speed, and repeat state where useful;
- selected sentence; selected token may be restored only if its stable occurrence still exists.

Resume favors semantic anchors over raw pixel offsets. If content was reprocessed and the exact anchor no longer exists, return to the nearest valid section location and explain that the source changed. Position persistence does not itself increment reading exposure.

## Audio experience

### Declared MVP

- Compact play/pause, ±5-second seek, speed selection, sentence repeat, elapsed/duration, and sync status.
- Playback position and speed persist per Library item.
- Timed sentence selection seeks audio. Sentence View previous/next changes focus; the player does not add redundant previous/next segment buttons.
- Valid word timing enables word karaoke. Sentence timing is the required graceful fallback when word alignment is unavailable or fails.
- Audio may play without sync while alignment is pending, with an explicit `Sync processing` state and no false highlighting.
- Text-only content shows audio processing for first-section TTS and remains readable; later sections can show pending audio as the learner approaches them.
- Original/allowed audio and generated TTS are labeled by provenance. YouTube video opens through the compliant embed control rather than exporting original audio.

### Follow behavior

Playback keeps the active sentence visible while follow is active. Manual scroll suspends follow without stopping audio and reveals `Resume follow`. Seeking or choosing a timed sentence restores follow. Reduced-motion preference prevents animated scrolling.

### Failure behavior

- Audio pending: disabled play control plus current stage; reading works.
- Audio failed: `Audio unavailable` with eligible Retry; reading works.
- Word alignment failed: sentence highlight and seek continue; no alarming full-import failure.
- Sentence alignment unavailable but playable audio exists: playback remains available without text seek/highlight and is labeled unsynchronized.
- Transcription/text quality failure that prevents readable content remains an import failure, not a silent empty Reader.

### Later / Plus

Second voice, continuous chapter/playlist play, download/offline, user-triggered regeneration, audio-quality feedback, transcript/alignment editor, background-mobile guarantees, voice design/cloning, and standalone audio import are not required MVP interactions. This does not reclassify word karaoke or sentence fallback, which remain declared Core.

## Vocabulary, review, and export

Vocabulary stores the selected lemma or exact expression, preferred contextual meaning, exact source occurrence/sentence, language, explicit state, and card intent. Re-encounter adds an occurrence rather than a duplicate item and shows the current state immediately in Reader.

The Vocabulary screen supports search and Core filters: state, word/expression, and source. Selecting an occurrence returns to the stable Reader position. Bulk state edit and editable card fields remain Plus.

Review uses only explicit cards and records each rating once. Recognition, contextual cloze, and permitted-audio cards share one session shell. `Review sentence` uses the same focused shell for a contextual cloze or sentence-ordering exercise and then returns to Reader. Known pauses cards without deleting their history; `Study again` resumes them. The scheduler and exact Recall Confirmed rule are open, but the UX always distinguishes `Known (you marked)` from `Recall Confirmed (review evidence)`.

`.apkg` export begins from Vocabulary selection or source filter. A dialog confirms scope and media inclusion, then closes; progress and retry/download appear inline in Vocabulary because packaging is asynchronous.

## Import interaction model

The Import screen keeps the paste flow focused:

1. **Open import screen:** Library CTA navigates to `/import`.
2. **Validate and submit:** pasted text limit/result, expected language, blocking high-confidence mismatch guidance, private-by-default notice, Submit.

After submission, Library owns progress. Each item opens a book index that lists its persisted sections as ordered chapters. User-facing stages use stable language such as `Queued`, `Preparing text`, `Analyzing language`, `Preparing audio`, `Synchronizing`, `Ready to read`, `Ready`, and `Failed`; internal provider names stay in details only when useful. Progress is determinate only when the system knows a reliable total.

Partial readiness prioritizes opening valid text. Optional processing states attach to capabilities (`Audio processing`, `Word sync unavailable`) rather than leaving the entire item indefinitely “processing.” Retry is stage-aware but presented as one user action.

## Progress model

Progress uses three visible groups:

- **Exposure:** active reading/listening time, words/unique lemmas encountered, audio coverage, sections completed.
- **Your learning state:** saved/Learning and self-marked Known.
- **Demonstrated recall:** due cards, review accuracy/lapses, delayed recall, Recall Confirmed.

Daily Learning Score, goal, streak, heatmap, periods, totals/change, assistance, known coverage, and CEFR estimate remain declared Core. They are secondary to the three groups, carry plain-language calculation help, and never imply that import/save/completion proves learning. Below the evidence threshold, CEFR shows `Collecting data`.

## Responsive structure

| Surface        | Desktop                                | Tablet                            | Mobile                                                           |
| -------------- | -------------------------------------- | --------------------------------- | ---------------------------------------------------------------- |
| App shell      | persistent side navigation             | labeled bottom navigation         | labeled bottom navigation; account in header/menu                |
| Library        | Continue + multi-column/list cards     | reduced columns                   | stacked cards; full-width Import CTA                             |
| Import         | centered step form                     | same flow                         | single column; native file picker; no drag-only dependency       |
| Reader content | centered text + non-overlap side panel | text + overlay/collapsible drawer | full-width text; bottom sheet; Reader-specific header            |
| Player         | full compact bar                       | compact bar                       | fixed compact bar above bottom edge; expanded controls on demand |
| Vocabulary     | table/list with source snippet         | reduced columns                   | cards/accordion; filters in drawer                               |
| Review         | centered focused card                  | same                              | full-width card; large answer targets                            |
| Progress       | grouped cards/charts                   | two/one columns                   | stacked groups; tables become labeled cards                      |

Opening the mobile bottom sheet must not hide the selected sentence behind both sheet and player; it has collapsed/half/full states and can be dismissed with Back/Escape or a labeled control.

## Accessibility constraints

- Every icon control has an accessible name and visible state; player actions do not rely on tooltip alone.
- Tokens and expressions are keyboard reachable without turning every word into an impractical Tab stop: provide roving focus/arrow navigation within the text region, with an exit to the next landmark.
- Opening a context surface moves/announces focus appropriately without trapping desktop reading; closing returns focus to the selected token.
- Dialogs alone trap focus. Drawers/bottom sheets have headings, labeled close controls, and predictable Escape/Back behavior.
- Touch targets are at least comfortably tappable and answer/state buttons are not color-only.
- Text supports browser zoom and resizing, readable line length, sufficient contrast, and no fixed-height clipping.
- Active sentence/word, every vocabulary state, errors, and review feedback have non-color cues.
- Auto-scroll honors reduced motion; media has semantic control names and exposed time/status.

## Deferred UX

Follow the priority owner in [FEATURES.md](../../FEATURES.md) and the consolidated [MVP scope and non-goals](mvp-scope.md). In particular, do not surface disabled placeholders for:

- **Plus:** favorites, playlists/history, next-input recommendation, import cancellation/preview/chapter selection/metadata editing, transcript/OCR editing, bulk vocabulary changes, card editing, export history/options, continuous play/download/regeneration, font/theme customization, reports, or source difficulty trends;
- **Later:** standalone audio/podcast/RSS/DOCX/bulk import, public Library/community/tutors/social/gamification, speaking/writing feedback, voice cloning/design, multi-language guarantees, or offline-native behavior.

The declared Core items that research recommends sequencing later—such as word karaoke, selective OCR, ASR fallback, advanced linguistic analysis, and `.apkg`—remain MVP scope until a human approves a scope change.

## Important state transitions

### Vocabulary state change

```text
confirmed state → user action → pending visual state
→ save succeeds → confirmed new state + Undo
→ save fails    → restore prior state + Retry
```

### Resume

```text
Continue → load item revision + last stable anchors
→ exact anchors valid? yes → restore view/time/position
                      no  → nearest valid position + source-changed notice
```

### Review answer

```text
prompt → answer/reveal → rating pending → recorded once
→ next card
or network failure → same card/rating retained → retry without duplicate event
```

## Backend/API Implications

The UX implies capabilities, not endpoint or schema choices:

- authenticate sessions and retrieve/create the learning profile;
- list/search/filter user-authorized Library items and expose Continue state;
- validate supported source inputs and limits before accepting an import;
- create a private import, detect same-account duplicates, and expose user-safe processing stage, progress, partial readiness, failure, retry eligibility, and reference ID;
- retrieve bounded document structure/segments with stable source and revision locators;
- compose Reader content with vocabulary state, deterministic annotation, translation/meaning provenance, audio availability, and timing quality;
- persist and retrieve semantic reading position, view preference, selected sentence, playback position, speed, and follow-relevant state;
- perform contextual word/expression lookup independently from Reader content loading and degrade it independently;
- mutate vocabulary/card intent idempotently, return confirmed state, support undo/history semantics, and attach repeat occurrences without duplicates;
- retrieve/search/filter Vocabulary and link each occurrence back to its source location;
- expose due review work, record one answer/rating idempotently, preserve history, pause/resume cards, and calculate next-due/Recall Confirmed under a versioned policy;
- start and monitor `.apkg` export jobs and authorize the resulting download;
- expose allowed audio variants, provenance, processing/failure state, duration, sentence/word timing, and timing granularity/quality;
- persist auditable learning events and return language/period-scoped progress grouped as exposure, self-report, and recall with metric explanations;
- return partial failures by capability so valid text remains usable when lookup/audio/alignment is unavailable;
- support accessible status announcements and safe optimistic-mutation reconciliation without exposing provider internals.
