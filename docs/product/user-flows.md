# User flows

These flows define user-visible behavior for the declared MVP. They do not choose endpoints, schemas, providers, or the first implementation slice. Screen states are owned by the [screen inventory](screen-inventory.md); detailed Reader behavior is owned by the [interaction model](interaction-model.md).

## Product navigation model

- **Library** is the authenticated home: resume, processing, completed imports, search/filter, and Import.
- **Reader** is the central learning surface and temporarily reduces global navigation to keep content primary.
- **Vocabulary**, **Review**, and **Progress** are separate destinations because they involve management, focused recall, and reflection rather than reading.
- **Profile & Settings** is secondary account navigation.
- Processing status lives on a Library item and its details; it is not a standalone top-level screen.

MVP “discovery” means finding, filtering, and resuming the learner's own private Library. Public discovery and personalized next-input recommendation retain their Later/Plus priorities.

Desktop uses persistent primary navigation. Mobile uses bottom navigation for Library, Vocabulary, Review, and Progress; Import remains a prominent Library action. Reader replaces the normal shell with Back, section navigation, view controls, and the player.

## Primary product loop

```text
authenticate/onboard
→ import private content or resume an item
→ read and/or listen in Reader
→ inspect an unknown word/expression in context
→ explicitly set Learning/Known/Ignored or add a card
→ continue without leaving Reader
→ later review due cards
→ return to the source or Library
→ inspect honest progress
→ resume
```

Saving, marking Known, completing a section, and importing are not evidence of recall and do not silently change one another.

## Authentication and onboarding

```text
signed out → sign in/register → authenticated?
  no  → field-level/general error → retain safe input → retry
  yes → learning profile exists?
          yes → Library
          no  → choose French + approximate A1–C2 level
                → save profile → empty Library
```

Authentication mechanism and launch interface language remain open. Onboarding asks only information already required for the learning profile; goals and deeper preferences are changed later in Settings/Progress.

## Import and prepare content

```text
Library → Import
→ choose Paste text, YouTube (when enabled), EPUB, PDF, or Markdown
→ paste/edit plain text, provide URL, or choose a file as appropriate
→ immediate source-specific validation
→ confirm expected learning language; correct a high-confidence mismatch if detected
→ submit private import
→ Library item appears immediately with stage/progress
→ leave page or continue using app while work continues
→ first usable section ready?
     yes → Open Reader, with optional enrichment still processing
     no  → continue status
→ ready / partial failure / failed
```

For `Paste text`, the primary control is a large multiline field with a visible character counter. Clipboard formatting is discarded while paragraph breaks remain. Empty/whitespace-only or over-limit text is blocked inline before submission.

User-visible alternatives:

- Empty/over-limit pasted text, or unsupported, malformed, encrypted/DRM, empty, or oversized file/URL input, is rejected before processing with a specific recovery action.
- A same-account duplicate offers `Open existing item`; reprocessing is not the default.
- A transient failed stage offers Retry and explains which completed work will be reused.
- Valid text with failed/pending audio, alignment, or enrichment remains readable and is labeled `Ready to read`.
- Closing Import never cancels submitted work. Cancellation is Plus, not required MVP behavior.
- YouTube is shown only where the experimental connector is enabled. Legal/ToS and fallback behavior remain an approval decision.

Standalone raw-audio upload is not a declared MVP source type. MVP audio comes from an allowed source such as YouTube or from text-to-speech for text-only content.

## Library management and resume

```text
Library opens
→ Continue item exists?
     yes → Continue restores last stable reader state
     no  → show imports or empty-state Import CTA

Search/filter → select item
  processing → inspect current stage/error
  ready/ready-to-read → open Reader
  failed → retry or delete
```

Deleting an import is a destructive confirmation and returns to Library. Favorites, playlists, history, public discovery, and recommendation are not required MVP surfaces.

## Reader: consume and interact

```text
open/continue item
→ restore section, view, text anchor, selected sentence, and playback position
→ read Page View or focus Sentence View
→ optional play
→ select word or expression
→ contextual surface opens without navigating away
→ lookup loading → contextual result/failure
→ optional one-click Learning / Known / Ignore / Add card
→ mutation saved; Undo remains available
→ dismiss/continue reading
```

Switching Page/Sentence View preserves sentence, audio time, vocabulary state, and lesson-level view preference. Section completion is explicit and never marks vocabulary Known. `Review sentence` enters a focused review surface and returns to the same Reader state.

## Audio and synchronization

```text
audio available → play
→ persist actual playback position
→ alignment state?
     word timing valid     → sentence + current word highlight
     sentence timing only  → sentence highlight; no word karaoke
     alignment processing  → audio may play; sync controls explain pending state
     audio processing      → disabled player with progress; reading continues
     audio/alignment failed→ readable text + actionable status/retry where eligible
```

The learner can play/pause, seek ±5 seconds, change speed, repeat the current sentence, click a timed sentence to seek, and resume playback later. Manual scrolling pauses auto-follow until the learner chooses `Resume follow`; it does not pause audio.

## Vocabulary lifecycle

```text
encounter word/expression
→ inspect contextual meaning and source sentence
→ explicitly choose state or add card
→ repeated encounter reuses lemma/phrase item and adds occurrence
→ Vocabulary lists current state and occurrences
→ search/filter by status, type, or source
→ open source occurrence or start due Review
```

Known applies lemma-wide and is reversible. Existing cards pause rather than disappear; `Study again` resumes them. Adding a card is explicit and separate from setting Learning. Expressions are stored as selected spans with their exact source context.

## Review session

```text
Review → due queue with count and optional source/type filter
→ start focused session
→ prompt (recognition, contextual cloze, permitted audio, or source-launched sentence ordering)
→ reveal/answer → Again / Hard / Good / Easy
→ next card or session summary
→ return to Review, Vocabulary, or source Reader position
```

An empty due queue reports the next due state rather than manufacturing work. Scheduling details and exact Recall Confirmed rules require product approval; review events never rewrite self-marked Known silently.

## Progress and learning feedback

```text
Progress → select period
→ see daily goal/status
→ inspect separate groups:
   Exposure | Learning state | Demonstrated recall
→ follow metric explanation or source/session detail
→ resume due review or continue reading
```

The UI never presents imports, clicks, saved words, or self-marked Known as demonstrated learning. CEFR remains `Collecting data` below the declared evidence threshold and is always labeled an estimate with confidence.

## Profile and settings

The learner can inspect/change target-language profile data supported by MVP, approximate starting level, daily goal, and account/session settings. Changes that affect language-scoped progress require clear confirmation. Multi-language, data export/deletion, themes, font customization, and reports follow their existing Plus/Later priorities.

## Cross-cutting failure recovery

- Inline errors preserve valid input and the user's location.
- Background failures expose a safe reason, failed stage, retry eligibility, and reference ID; raw provider/parser details remain hidden.
- Optimistic state changes visibly reconcile; a failed save restores the previous state and offers Retry.
- Offline/network interruption does not claim a save succeeded. Already-loaded Reader content may remain visible, but offline product support is not promised.
