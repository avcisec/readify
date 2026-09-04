# MVP screen and surface inventory

The MVP uses nine screens/surfaces. Processing, contextual lookup, Anki export, and destructive confirmation are subordinate surfaces rather than additional navigation destinations.

## 1. Sign in / register

- **Purpose / goal:** establish the persistent identity required for private imports and learning state.
- **Entry:** signed-out route, expired session, protected deep link.
- **Actions / information:** sign in or create account using the approved auth method; legal/privacy links; preserved intended destination.
- **Empty:** initial blank form. **Loading:** submitted controls disabled with progress. **Error:** field-level validation, invalid credentials, provider/unavailable error. **Success:** onboarding or intended authenticated route.
- **Exit:** onboarding, Library, or safe return from account recovery. Auth method is unresolved in [UX decisions](ux-decisions.md).

## 2. Learning-profile onboarding

- **Purpose / goal:** create the minimum French learning context.
- **Entry:** first successful authentication without a profile.
- **Actions / information:** French target language, approximate A1–C2 level, clear explanation that it sets defaults rather than testing proficiency.
- **Empty:** no level chosen. **Loading:** profile saving. **Error:** preserve selection and retry. **Success:** confirmation and empty Library.
- **Exit:** Library; sign out. Library repeats the saved target language and starting level as a read-only summary so the learner can verify onboarding succeeded. Do not add interests, tutorial carousels, goals, or notification prompts to MVP onboarding.

## 3. Library (authenticated home)

- **Purpose / goal:** resume learning, open an item, or import content.
- **Entry:** post-onboarding, primary navigation, Reader Back, completed import.
- **Actions / information:** Continue card; Import CTA; item title/source/type; section progress; ready/processing/failed state; search; source-type filter; open status details; retry; delete.
- **Empty:** short value statement and one `Import content` CTA. **Loading:** stable card skeletons, not a blank page. **Error:** retry Library load without hiding cached/available items. **Success:** Continue and item list.
- **Exit:** Reader, Import, Vocabulary, Review, Progress, Profile/Settings.

Processing detail is an expandable card/drawer showing current stage, honest progress, safe error, Retry, and reference ID. It is not a separate dashboard.

## 4. Import

- **Purpose / goal:** submit one supported private source with confidence.
- **Entry:** Library Import CTA or empty state.
- **Actions / information:** choose enabled source; for `Paste text`, use a large multiline plain-text field with placeholder, visible character counter/limit, and paragraph-preserving paste/edit behavior; for other sources use the appropriate URL/file input; expected French language; privacy statement; validation; detected-language mismatch; submit.
- **Empty:** source choices: Paste text, YouTube when enabled, EPUB, PDF, Markdown; the first slice opens directly with the empty paste field and does not show unavailable-source placeholders. **Loading:** submission/validation uses an explicit phase and disables duplicate submission without replacing entered text. **Error:** specific empty/over-limit/language/network error for pasted text, or source-appropriate file/URL error, with correction. **Success:** item created and return to Library status.
- **Exit:** Library without submitting; Library item after submitting. Closing after submit does not cancel background work.

Import does not include a rich-text editor, metadata editing, chapter selection, raw-audio upload, bulk import, or a dedicated processing wait screen. Pasted markup is treated as plain text rather than rendered formatting.

## 5. Reader

- **Purpose / goal:** read/listen and resolve unknown language with minimal interruption.
- **Entry:** Library item, Continue, Vocabulary source occurrence, Review source link.
- **Actions / information:** Back; title/section; Page/Sentence view; section navigation/progress; content; contextual word/expression surface; translation/grammar details on demand; player; sync state; explicit section completion.
- **Empty:** unavailable if no usable section; Library status is shown instead. **Loading:** preserve shell and position while loading a bounded section. **Error:** retry section; degrade optional lookup/audio/analysis independently. **Success:** stable content, saved state, and resumable position.
- **Exit:** Library, source-linked Review, or browser/app navigation with state persisted.

Desktop uses a non-overlapping side panel. Tablet uses a collapsible overlay drawer. Mobile uses a dismissible bottom sheet above a persistent compact player.

## 6. Vocabulary

- **Purpose / goal:** find and manage explicitly encountered words/expressions.
- **Entry:** primary navigation, Reader contextual surface, Review summary.
- **Actions / information:** search; filter by stages 1–4/Known/Ignored, word/expression, and source; meaning/source snippet; occurrence count; due state; change state; Study again; open source; select/export to `.apkg`.
- **Empty:** explain that items are created explicitly in Reader and link to Library. **Loading:** list skeleton retaining filters. **Error:** retry without dropping filters. **Success:** updated row/card and reversible feedback.
- **Exit:** source Reader, Review, export dialog, primary navigation.

Bulk state editing and editable card fields are Plus. Anki export uses a focused confirmation dialog and background status within Vocabulary, not a permanent screen.

## 7. Review

- **Purpose / goal:** complete focused recall work without Reader clutter.
- **Entry:** primary navigation, due CTA, Vocabulary, `Review sentence`.
- **Actions / information:** due count; source/type filter; start; prompt; reveal/answer; Again/Hard/Good/Easy; progress; exit; source link; session summary.
- **Empty:** `Nothing due` plus next due information and Continue reading. **Loading:** preserve session position. **Error:** retry current answer without double-recording. **Success:** next card or summary with completed count.
- **Exit:** Review home, Vocabulary, source Reader, Library.

## 8. Progress

- **Purpose / goal:** understand activity and recall without vanity claims.
- **Entry:** primary navigation, Library goal card, Review summary.
- **Actions / information:** period filter; daily score/goal and streak; heatmap; grouped exposure, self-reported learning state, demonstrated recall; totals and period change; metric definitions; CEFR estimate/confidence or Collecting data.
- **Empty:** explain what will populate each group and link to Import/Library. **Loading:** retain period selector. **Error:** retry affected aggregates. **Success:** current language-scoped metrics and actionable Continue/Review links.
- **Exit:** Reader/Library, Review, Profile/Settings.

## 9. Profile & Settings

- **Purpose / goal:** manage the learning profile and account-level preferences without occupying primary learning navigation.
- **Entry:** account menu/avatar.
- **Actions / information:** target language context, starting level, daily goal, and session/account controls.
- **Empty:** not applicable after onboarding. **Loading:** field-level. **Error:** retain prior saved value and explain unsaved change. **Success:** visible saved confirmation.
- **Exit:** previous destination or primary navigation.

Only Core settings appear initially. Plus settings such as interface-language choice, export/account deletion, fonts, and themes appear when their features ship.

## Modal/dialog policy

Use a modal dialog only for destructive import deletion or configuring/confirming an `.apkg` export. Leaving an unanswered review card has no destructive side effect and needs no confirmation. Ordinary lookup, processing, navigation, errors, and state changes stay inline, in a side panel/drawer/bottom sheet, or on their owning screen.
