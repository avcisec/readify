# Pasted-text Reader learning loop

- Status: Implemented with deterministic automated evidence; manual AT, independent review, restricted preview, and production provider/launch decisions remain open
- Date: 2026-09-01
- Product sources: [idea](../../idea.md), [feature inventory](../../FEATURES.md), [MVP scope](../product/mvp-scope.md)
- UX sources: [user flows](../product/user-flows.md), [interaction model](../product/interaction-model.md), [wireframes](../product/wireframes.md)

## Outcome

A new learner can authenticate, create a minimal French profile, paste French text into a large plain-text field, submit it privately, leave while it processes, open it in Page Reader, understand and explicitly classify a word without leaving the text, find that state in Vocabulary, resume the same reading position later, and see minimal progress without false learning claims.

This is the first delivery slice, not a redefinition of the broader declared Core MVP.

## User and problem

The initial user is a Turkish-speaking, self-directed French learner around late A2 to early B1. They have copied a short French text and want to begin reading with contextual word help without creating or uploading a file and without first configuring audio, review, AI tools, or a complex library.

The slice proves the product's shortest trustworthy loop:

```text
authenticate → paste and submit text → process in background → read
→ inspect word → set learning state → continue
→ reopen at same position → verify state/progress persisted
```

## First-slice decisions

These decisions apply to this slice only unless already established by product truth:

| Decision                | Slice choice                                                                                                           | Reason                                                                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interface language      | Turkish                                                                                                                | Matches current product terminology and validation cohort assumption; no language switcher yet.                                                                  |
| Authentication behavior | Provider-neutral passwordless email link; deterministic non-production delivery for slice verification                 | Avoids custom password/recovery behavior while preserving persistent private ownership; a production managed provider is not required to implement the contract. |
| Learning language       | French only                                                                                                            | Matches the first quality guarantee; learner still chooses approximate A1–C2 starting level.                                                                     |
| Import source           | One pasted plain-text submission                                                                                       | Removes file preparation and validates the shortest private intake, async processing, Reader, and persistence loop.                                              |
| Slice text limit        | 50,000 Unicode scalar values after normalization v1                                                                    | Concrete implementation/acceptance bound; the final production quota is validated later from measured evidence.                                                  |
| Text normalization      | Plain text only; normalize line endings, trim outer blank lines, preserve internal characters and paragraph breaks     | Gives deterministic behavior without interpreting rich clipboard formatting or silently rewriting content.                                                       |
| Library title           | First non-empty line, whitespace-normalized and safely truncated to 80 Unicode scalar values; fallback `İsimsiz metin` | Supplies a usable card title without adding metadata fields to the first slice.                                                                                  |
| Reader mode             | Page View only                                                                                                         | Proves the continuous reading loop; Sentence View remains a later MVP slice.                                                                                     |
| Word help               | One non-AI preferred meaning with visible provenance; acceptance uses the approved fixture adapter                     | Proves the provider-neutral contract and degradation without a production dictionary or sending private text externally.                                         |
| Vocabulary actions      | Learning, Known, Ignore, Undo                                                                                          | Proves explicit state and lemma propagation. Cards/Review are not in this slice.                                                                                 |
| Progress                | Structural reading position/completion plus explicit vocabulary counts                                                 | Proves persistence and honest separation without inventing exposure/recall evidence.                                                                             |
| Accessibility           | Keyboard-complete critical flow, named controls, non-color state cues, zoom/reflow, reduced motion                     | Prevents the risky Reader interaction model from becoming inaccessible by construction.                                                                          |

Changing a slice choice requires updating this spec and its acceptance scenarios before implementation.

## In scope

### Authentication and onboarding

- Signed-out users enter an email address and request a sign-in link.
- The confirmation state does not reveal whether another account exists.
- Following a valid, unexpired link creates/continues a session and returns to the intended safe route.
- First-time users create a French learning profile by choosing an approximate A1–C2 level. The UI states that this is a starting preference, not a proficiency test.
- Returning users skip onboarding and enter Library.

### Empty Library and pasted-text import

- Empty Library shows one primary `İçerik içe aktar` action and no disabled future-source controls.
- Import opens a single large multiline field labeled for French text. It supports paste and direct editing, states that submitted content remains private, and shows a live `current / 50,000` character count.
- Clipboard markup and visual formatting are discarded. Line endings normalize to LF, outer blank lines are trimmed, and internal text/paragraph breaks are preserved; HTML- or Markdown-looking content is never executed or rendered as markup.
- Validation distinguishes empty/whitespace-only content, ill-formed Unicode, more than 50,000 Unicode scalar values after normalization v1, submission/network interruption, and detected non-French content. Empty, invalid, or over-limit content cannot be submitted. The transport rejects JSON bodies over 512 KiB before parsing.
- A policy-qualified non-French result cannot be submitted to the French workspace; the learner edits or replaces the text. Short or undetermined input remains accepted to avoid false rejection.
- A recoverable submission failure keeps the current text and counter in the rendered form. Unsubmitted text is not promised to survive navigation, refresh, or sign-out.
- Submission creates a Library item immediately and returns to Library. Processing continues after navigation or sign-out.
- A same-account duplicate of the normalized text offers `Mevcut içeriği aç`; it does not create another item or rerun processing by default.

### Processing and partial readiness

Library shows user-facing stages: `Sırada`, `Metin hazırlanıyor`, `Dil analiz ediliyor`, `Okumaya hazır`, or `Başarısız`.

- Progress is determinate only when a reliable total exists; otherwise use stage plus activity, not a fabricated percentage.
- One pasted-text submission produces one logical section; preserved paragraph breaks do not create additional sections.
- Text preparation preserves paragraph order and produces stable sentence/token occurrences.
- If valid text is ready but language analysis/word tools fail, the item becomes `Okumaya hazır · Kelime araçları kullanılamıyor`; Reader opens and Retry targets the unavailable capability.
- A transient failed stage offers one Retry action and says completed work will be reused.
- Permanent validation failures do not offer meaningless Retry.
- Error details include a safe reference ID without parser/provider internals.

### Library after import

- The item shows the generated title, `Yapıştırılan metin` source type, current stage, and structural reading position when available.
- `Devam et` appears after the learner has a saved Reader position; before that the primary action is `Oku`.
- The slice does not require Library search, source filters, deletion, editing, favorites, recommendations, or multiple-item bulk behavior.

### Page Reader

- Reader shows Back to Library, generated title, current section, structural position, continuous paragraphs, and explicit `Bölümü tamamla` where a section boundary exists.
- The first slice does not render an audio player, Sentence View toggle, translation controls, grammar tree, card action, or placeholders for them.
- Eligible French tokens are selectable by pointer/touch and keyboard interaction.
- Inline vocabulary state is distinguishable without color alone. New/unclassified is subtle; Learning has persistent emphasis; Known and Ignored are neutral but explicit in the context surface/accessibility state.
- Opening Reader or scrolling alone does not mark words Known, create vocabulary, complete a section, or create demonstrated-recall progress.
- Completing a section changes structural completion only.

### Contextual word interaction

Selecting one token opens the standard context surface without navigation:

- desktop: non-overlapping side panel;
- tablet: dismissible drawer;
- mobile: collapsed/expandable bottom sheet that does not cover both selected sentence and Reader controls.

The surface shows a loading state, surface form, lemma when available, current explicit state, containing source sentence, one preferred POS-qualified meaning, and meaning provenance. The first slice does not claim sentence-aware word-sense disambiguation.

- Learning, Known, and Ignore are explicit one-action changes.
- Known states that it applies to the lemma and all current forms.
- A successful change updates every visible occurrence of that lemma and shows Undo.
- Undo restores the prior confirmed state and every inherited occurrence presentation.
- Selecting another token replaces, rather than stacks, contextual content.
- Meaning lookup failure leaves deterministic token/lemma/state information and state actions usable when analysis exists; it offers Retry for meaning only.
- State-save failure restores the prior confirmed state and offers Retry. The UI never claims an unsaved change succeeded.

Phrase selection, pronunciation audio, manual meaning editing, translation, cards, Review, detailed morphology/grammar, and dependency visualization are outside this slice.

### Vocabulary

- Vocabulary lists items created by explicit Learning/Known/Ignore actions.
- Each item shows surface/lemma, preferred meaning when available, explicit state, first source sentence, occurrence count, and source link.
- Re-encountering the same lemma adds/reuses occurrences and never creates a duplicate vocabulary item.
- Opening a source link returns to the exact Reader occurrence when it still exists.
- Changing Learning/Known/Ignore from Vocabulary uses the same semantics and Undo behavior as Reader.
- The slice does not require search, filters, bulk actions, card intent, due state, Review, or export.

### Resume and structural progress

- Reader persists document revision, section, stable paragraph/sentence anchor, and a semantic scroll anchor at safe navigation/background checkpoints.
- Reopening through `Devam et` restores the nearest stable text position and all confirmed vocabulary state.
- Resume does not depend on the same viewport size; desktop-to-mobile resume uses semantic anchors rather than pixels.
- If the document revision no longer contains the anchor, Reader opens the nearest valid location and explains that content changed.
- A failed position save is shown non-blockingly and retried; the app does not claim the position is synchronized.

### Minimal Progress

Progress exposes only evidence available in this slice:

- **Content progress:** current section/total and explicitly completed sections.
- **Your learning state:** counts of Learning and self-marked Known; Ignored is available in detail but not framed as learning.
- **Demonstrated recall:** `Henüz tekrar verisi yok` with no accuracy, mastery, or Recall Confirmed number.

The slice does not show active study time, words exposed, Learning Score, daily goal/streak, heatmap, assistance rate, audio metrics, review metrics, or CEFR. Those remain declared MVP capabilities for later slices and require their own event/policy acceptance.

## Out of scope for this slice

- TXT file upload, EPUB, PDF, Markdown, YouTube, subtitles/transcripts, standalone audio, multiple/bulk imports, metadata editing, cancellation, deletion, and Library search/filter.
- Audio, TTS, playback, synchronization, karaoke, Sentence View, expression selection, translation, advanced linguistic display, and AI-generated help.
- Add card, Review/SRS, Recall Confirmed, `.apkg`, progress scoring/time/exposure, goals/streak, heatmap, and CEFR.
- Interface-language switching, multiple learning languages, themes/fonts, offline behavior, public content, social/community, tutor, or monetization features.

Out-of-scope items retain their existing Core/Plus/Later priority. This section sequences delivery; it does not reclassify the product roadmap.

## Responsive behavior

- **Desktop:** normal app navigation in Library/Vocabulary/Progress; Reader uses centered text and a side panel.
- **Tablet:** compact app navigation; Reader context is a drawer over part of the viewport and returns focus to the token when dismissed.
- **Mobile:** Library items are cards; Import is single-column and the multiline field spans available width with enough visible height to review several lines above the software keyboard; Reader uses a compact header and bottom sheet. No action depends on drag-and-drop, hover, or right-click.
- Changing viewport while Reader is open preserves semantic reading position and confirmed state.

## Accessibility behavior

- Authentication/import forms have programmatic labels, associated errors, and predictable focus on failure.
- The text field exposes its instructions, current count, limit, and validation error programmatically; paste is not the only input method.
- Status changes and background completion/failure are announced without repeatedly interrupting reading.
- Reader exposes content and controls as landmarks. Token interaction supports roving keyboard focus/arrow navigation with a clear exit from the token region; it does not add every token to the page-wide Tab sequence.
- Opening/closing the context surface announces its heading and returns focus to the selected token. Only true dialogs trap focus.
- Vocabulary state and processing results never rely on color alone.
- Touch targets are comfortably tappable; text reflows at browser zoom and text resize without clipping.
- Reduced motion disables animated scroll/panel transitions without removing state feedback.

## Error and recovery summary

| Failure                                                  | User-visible behavior                                           | Recovery                                             |
| -------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| Sign-in link invalid/expired                             | safe message without account disclosure                         | request a new link                                   |
| Pasted text empty, ill-formed, or over 50,000 characters | specific inline validation; no item/job                         | edit the text                                        |
| Submission/network failure                               | retain current text and counter while the form remains rendered | retry submission                                     |
| Text preparation permanent failure                       | failed Library item with reference ID                           | create another pasted-text item; no false retry      |
| Analysis transient failure                               | Reader remains available if text is valid                       | retry word tools                                     |
| Meaning unavailable                                      | state/lemma remains usable                                      | retry meaning                                        |
| Vocabulary mutation fails                                | prior confirmed state restored                                  | retry mutation                                       |
| Resume save fails                                        | non-blocking unsaved-position status                            | retry automatically/manual navigation remains usable |
| Source anchor missing after revision                     | nearest valid location and source-changed notice                | continue from resolved position                      |

## Acceptance scenarios

1. **Passwordless entry:** Given a signed-out user, requesting and following a valid sign-in link results in an authenticated session without exposing account existence in the request confirmation.
2. **Minimal onboarding:** Given a first session, choosing French level B1 saves the learning profile and opens empty Library; no goal/tutorial/preferences are required.
3. **Valid import:** Given non-empty French plain text of at most 50,000 Unicode scalar values after normalization v1, submitting returns to Library with a private item before background processing completes.
4. **Input boundary:** Given whitespace-only text, ill-formed Unicode, normalized text over 50,000 scalar values, or a JSON body over 512 KiB, submission is blocked with the specific reason and no Library item/job is created; content that resembles HTML or Markdown remains escaped plain text.
5. **Language mismatch:** Given a policy-qualified non-French result, submission is blocked with corrective guidance and creates no partial state; short or undetermined input is not falsely rejected.
6. **Duplicate:** Given the same account submits text that normalizes to the same content twice, the second attempt offers the existing item and does not start duplicate processing by default.
7. **Background continuity:** Given processing is active, navigating elsewhere or signing out does not stop it; returning shows the durable current stage.
8. **Honest progress:** Given a stage has no reliable total, the UI shows its name/activity and no fabricated percentage.
9. **Partial readiness:** Given text preparation succeeds and analysis fails, Reader opens valid text, word tools show unavailable, and eligible Retry does not redo text preparation.
10. **Structure and title:** Given pasted text with outer blank lines, CRLF line endings, multiple paragraphs, and a first content line over 80 characters, Reader preserves internal text/paragraph order, reload returns the same normalized revision, and Library uses a safely truncated first-line title.
11. **No silent learning:** Opening, scrolling, or completing a section creates no vocabulary state, Known state, or demonstrated recall.
12. **Contextual lookup:** Selecting a token keeps Reader visible and produces loading → result with surface, lemma, source sentence, one meaning, provenance, and explicit state actions.
13. **Meaning degradation:** Given meaning lookup fails but lemma analysis exists, Learning/Known/Ignore remain usable and Retry affects meaning only.
14. **Learning state:** Marking a New token Learning updates the context surface, every matching visible lemma occurrence, Vocabulary, and persists after reload.
15. **Lemma-wide Known:** Marking one inflected form Known updates all occurrences sharing that lemma, pauses no cards because cards are absent, and does not create Recall Confirmed/progress score.
16. **Undo:** Immediately undoing a state change restores the prior state across Reader and Vocabulary after reload.
17. **Idempotent re-encounter:** Selecting the same lemma in another paragraph reuses one vocabulary item and adds an occurrence rather than a duplicate.
18. **Mutation failure:** Given the state save fails, the UI returns to the last confirmed state and a retry records at most one successful change.
19. **Resume:** Given the learner leaves at a paragraph anchor and later uses Continue on another viewport size, Reader returns to the same semantic vicinity with confirmed vocabulary state.
20. **Minimal Progress:** Given one completed section, two Learning lemmas, one Known lemma, and no review system, Progress shows exactly those structural/self-report facts and explicitly reports no recall data.
21. **Mobile context:** On a supported mobile viewport, selecting a token opens a dismissible bottom sheet without covering the selected sentence and without losing Reader position.
22. **Keyboard flow:** A keyboard-only learner can sign in, paste or type/edit text, submit, open Reader, enter/leave token navigation, inspect/change state, undo, navigate to Vocabulary/Progress, and resume with visible focus.
23. **Authorization:** A learner cannot list, open, resume, look up within, or mutate another account's private Library item even if an identifier is guessed.

## Product acceptance evidence

The implementation phase must eventually provide:

- behavior-focused tests for every applicable acceptance scenario;
- responsive evidence for desktop, tablet, and mobile structures;
- keyboard-only and representative screen-reader smoke evidence for the critical loop under the accepted [accessibility verification baseline](../quality/accessibility.md);
- the approved CC0 [French plain-text fixture](../product/fixtures/french-reader-acceptance.txt), which contains multiple paragraphs, repeated lemmas/inflected forms, apostrophes/elision, long-title behavior, a non-BMP character, literal markup, and deterministic fake meanings;
- import/job evidence showing background continuation, duplicate reuse, partial readiness, retry, and safe error reference;
- verification output from the repository-native command.

No live paid provider or production credential is required for deterministic automated tests.

## Backend/API Implications

The accepted [pasted-text slice architecture/API contract](../architecture/pasted-text-slice-contracts.md) defines these capabilities without changing the product behavior above:

- Identity: passwordless request/consume, session, intended-route return, account-safe messaging.
- Learning profile: create/read French profile and starting level.
- Import: validate/normalize/submit one bounded pasted-text value, generate its display title, perform same-account normalized-content duplicate detection, and expose durable status, partial readiness, capability retry, and a safe failure reference.
- Library: empty/list/item/Continue projections with authorization and processing state.
- Content: normalized revision, paragraph/sentence/token/lemma occurrences, stable semantic locators.
- Reader: retrieve bounded content and persist/retrieve semantic position and section completion.
- Language intelligence/meaning boundary: deterministic lemma plus one contextual meaning/provenance, independently degradable.
- Vocabulary: idempotent state change, lemma-wide projection, occurrence reuse, Undo, list, and source navigation.
- Learning/progress: structural completion and explicit-state aggregates only; no inferred recall/exposure policy in this slice.

That contract owns the transaction/event boundaries, consistency visible to the UI, provider-neutral deterministic meaning boundary, and authorization across composed Reader data. It must not be expanded with features absent from this specification.

## Implementation readiness and deferred production gates

[First-slice implementation readiness](../product/first-slice-implementation-readiness.md) owns the blocker analysis. No unresolved decision prevents implementation or deterministic verification:

- identity uses a provider-neutral contract and non-production outbox/fake;
- meanings use the CC0 fixture catalog and explicit `unavailable` behavior;
- normalization/counting uses the 50,000-scalar slice limit and 512 KiB transport ceiling;
- accessibility uses the bounded implementation verification baseline and one representative desktop screen-reader smoke;
- acceptance uses the approved CC0 French fixture.

Managed identity/email, a licensed production meaning source, a measured final production quota, and the public browser/AT support promise are production rollout gates. Non-production adapters must fail closed in production, and passing fixture-backed acceptance must not be described as production launch readiness.
