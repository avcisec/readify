# Low-fidelity MVP wireframes

These diagrams communicate hierarchy, controls, and surface relationships only. Labels are provisional; no color, type scale, spacing system, branding, or pixel dimensions are specified. `…` means bounded content continues.

## Sign in / register

```text
┌──────────────────────────────────────────────────────┐
│ Readify                                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│              Continue your French learning           │
│                                                      │
│              [ authentication fields/CTA ]           │
│              [ inline validation/error  ]            │
│                                                      │
│              Sign in  |  Create account              │
│              Privacy · Terms                         │
│                                                      │
└──────────────────────────────────────────────────────┘
```

One auth surface changes mode rather than sending the learner through unrelated marketing screens. The exact fields depend on the approved authentication method.

## Learning-profile onboarding

```text
┌──────────────────────────────────────────────────────┐
│ Set up your learning profile                         │
├──────────────────────────────────────────────────────┤
│ Learning language                                   │
│ French                                               │
│                                                      │
│ Approximate level                                    │
│ [A1] [A2] [B1] [B2] [C1] [C2]                       │
│ This sets starting defaults; it is not a test.       │
│                                                      │
│                                      [Continue]      │
└──────────────────────────────────────────────────────┘
```

## Library / authenticated home — desktop

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Readify      │ Library                         [Import content] [Profile]│
│              ├──────────────────────────────────────────────────────────┤
│ Library      │ Continue                                                 │
│ Vocabulary   │ ┌──────────────────────────────────────────────────────┐ │
│ Review   (8) │ │ Le Petit Prince · Chapter 4 · 38%                  │ │
│ Progress     │ │ Last read today · Audio 12:31                     │ │
│              │ │ [Continue reading]                                │ │
│              │ └──────────────────────────────────────────────────────┘ │
│              │                                                          │
│              │ Your Library     [Search____________] [Source ▾]         │
│              │ ┌──────────────────────────────────────────────────────┐ │
│              │ │ Une histoire        Ready to read · Audio processing│ │
│              │ │ EPUB · Section 1/12 [Open] [Status] [More]          │ │
│              │ ├──────────────────────────────────────────────────────┤ │
│              │ │ Notes de voyage     Synchronizing · 6/10 sections  │ │
│              │ │ PDF                 [View status]                   │ │
│              │ ├──────────────────────────────────────────────────────┤ │
│              │ │ Video lesson        Failed: captions unavailable   │ │
│              │ │ YouTube             [Retry] [Details] [Delete]      │ │
│              │ └──────────────────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────────┘
```

### Library empty state — mobile

```text
┌──────────────────────────────┐
│ Library             [Profile]│
├──────────────────────────────┤
│                              │
│ Bring something you want     │
│ to read in French.           │
│                              │
│ [ Import content ]           │
│                              │
├──────────────────────────────┤
│ Library  Vocabulary Review Progress │
└──────────────────────────────┘
```

## Import — pasted text selected

```text
┌──────────────────────────────────────────────────────┐
│ ← Library             Import private content         │
├──────────────────────────────────────────────────────┤
│ Paste private French text · [Paste text ✓]            │
│                                                      │
│ ┌──────────────────────────────────────────────────┐ │
│ │ Paste or type French text here…                 │ │
│ │                                                  │ │
│ │                                                  │ │
│ │                                                  │ │
│ │                                                  │ │
│ │                                                  │ │
│ └──────────────────────────────────────────────────┘ │
│ Paragraph breaks are kept · plain text only          │
│ 0 / 50,000 characters                                │
│                                                      │
│ Expected language: French                            │
│ Private to your account                              │
│                                                      │
│ [inline validation / detected-language mismatch]     │
│ [Cancel]                           [Import text]      │
└──────────────────────────────────────────────────────┘
```

Paste is the low-friction first-slice path and stays on one screen. The textarea is the dominant control; on mobile it spans the content width and remains tall enough to review several lines above the keyboard. Recoverable submission errors preserve its current value. `Cancel` means leave before submission; unsubmitted text is not promised to survive navigation, refresh, or sign-out. After submission the app returns to Library and does not show a blocking progress page.

## Book index — desktop and mobile structure

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Navigation   │ ← Library                                                │
│              │                                                            │
│              │ [FR cover]  Une histoire                                 │
│              │            Pasted text · 12 chapters                      │
│              │            [Continue from saved position]                 │
│              │                                                            │
│              │ Chapters                                                   │
│              │ 01  Chapter 1                                  [read ◉]   │
│              │ 02  Chapter 2                         Completed [read ◉]  │
│              │ …                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

The index is the book's stable home. Each read control opens only its selected section in Reader. A pasted-text item currently contains one generated chapter; structured imports can expose more chapters through the same list.

## Reader Page View — desktop

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Library  Le Petit Prince  [Chapter 4 ▾]  [Page|Sentence]  38%        │
├───────────────────────────────────────────────┬─────────────────────────┤
│                                               │ expression / lemma      │
│              Chapter 4                        │ [New]                   │
│                                               │                         │
│   Les grandes personnes ne comprennent        │ Contextual meaning      │
│   jamais rien toutes seules, et c'est          │ [lookup result/source]  │
│   fatigant, pour les enfants, de toujours      │                         │
│   et toujours leur donner des explications.    │ Source sentence         │
│                                               │ …                       │
│   …                                           │                         │
│                                               │ [🗑][1][2][3][4][✓]     │
│   PDF page 18                                 │  Q  learning scale  E   │
│                                               │ 3 Familiar saved [Undo] │
│                                               │                         │
│                             [Complete section] │ Grammar in sentence ▸   │
├───────────────────────────────────────────────┴─────────────────────────┤
│ [Play] [-5] [time────────────duration] [+5] [1× ▾] [Repeat]  Word sync │
└─────────────────────────────────────────────────────────────────────────┘
```

The context panel opens only after selection. When closed, the content area recenters rather than reserving an empty column.

## Reader Sentence View — desktop/tablet

```text
┌───────────────────────────────────────────────────────────────┐
│ ← Library  Chapter 4  [Page|Sentence]          Sentence 12/84 │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│ [Previous]                                                     │
│                                                               │
│     Les grandes personnes ne comprennent jamais rien          │
│     [learner-friendly role/phrase indicators on demand]       │
│                                                               │
│     Translation ▸      Grammar ▸      Dependency tree ▸       │
│                                                               │
│     [Play sentence] [Repeat] [Review sentence]                 │
│                                                     [Next]    │
├───────────────────────────────────────────────────────────────┤
│ [Play] [-5] [time────────duration] [+5] [0.9× ▾] Sentence sync│
└───────────────────────────────────────────────────────────────┘
```

Selecting a word opens the same context surface as Page View; it is omitted above to show the focused default.

## Reader word interaction — mobile

```text
┌──────────────────────────────┐
│ ←  Chapter 4   Page ▾   38%  │
├──────────────────────────────┤
│                              │
│ Les grandes personnes ne     │
│ comprennent jamais rien      │
│ toutes seules…               │
│                              │
│ [selected sentence remains   │
│  visible above the sheet]    │
│                              │
├──────────────────────────────┤
│ ── contextual bottom sheet ─ │
│ comprennent · comprendre     │
│ contextual meaning           │
│ [🗑][1][2][3][4][✓]          │
├──────────────────────────────┤
│ [Play] [-5]  01:12/03:40 [+5]│
└──────────────────────────────┘
```

The sheet expands for source sentence, Add card, Ignore, pronunciation, and grammar. Back/Escape closes it and restores token focus. The compact player remains usable without covering the selected sentence.

## Vocabulary — desktop and mobile structure

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Navigation   │ Vocabulary                     [Review due 8] [Export]  │
│              ├──────────────────────────────────────────────────────────┤
│              │ [Search____________] [State ▾] [Word/Phrase ▾] [Source]│
│              │                                                          │
│              │ Term       Meaning       State     Due     Source       │
│              │ comprendre understand    Learning  Today   Chapter 4 →  │
│              │ tout seul  on one's own  Known     Paused  Chapter 4 →  │
│              │ …                                                        │
│              │                                                          │
│              │ [background export: Packaging media…]                   │
└──────────────┴──────────────────────────────────────────────────────────┘

Mobile: each row becomes a card/accordion:
┌──────────────────────────────┐
│ comprendre       [Learning]  │
│ understand · Due today       │
│ Chapter 4 · 3 occurrences  → │
└──────────────────────────────┘
```

## Review

```text
┌──────────────────────────────────────────────────────┐
│ Review                              Due 8 · Card 3/8 │
├──────────────────────────────────────────────────────┤
│ Source: Le Petit Prince · Chapter 4                  │
│                                                      │
│ Les grandes personnes ne ________ jamais rien.       │
│                                                      │
│                    [Show answer]                     │
│                                                      │
│ after reveal: comprendre · understand                │
│                                                      │
│ [Again]          [Hard]          [Good]       [Easy] │
│                                                      │
│ [Exit review]                         [Open source]  │
└──────────────────────────────────────────────────────┘
```

### Review empty/summary

```text
┌──────────────────────────────────────┐
│ Review                               │
│ Nothing due right now.               │
│ Next review: tomorrow                │
│ [Continue reading] [Vocabulary]      │
└──────────────────────────────────────┘
```

## Progress

```text
┌──────────────┬──────────────────────────────────────────────────────────┐
│ Navigation   │ Progress · French                  [Last 7 days ▾]      │
│              ├──────────────────────────────────────────────────────────┤
│              │ Today: 14 / 20       Streak: 3 days      [heatmap]      │
│              │ [Continue reading]   [Review 8 due]                      │
│              │                                                          │
│              │ Exposure              Your learning state               │
│              │ Active study 82m      Learning 42                       │
│              │ Read/listen …         Self-marked Known 310             │
│              │ Sections 3            [definitions/tooltips]            │
│              │                                                          │
│              │ Demonstrated recall                                      │
│              │ Accuracy 81% · Recall Confirmed 24 · Lapses 3           │
│              │                                                          │
│              │ Estimated level: Collecting data                         │
│              │ Requires 3 days · 3 sections · 50 review events          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

Mobile stacks the three metric groups; the period selector remains at the top and every chart/table has a labeled summary.

## Profile & Settings

```text
┌──────────────────────────────────────────────────────┐
│ ← Back              Profile & Settings              │
├──────────────────────────────────────────────────────┤
│ Learning profile                                    │
│ Language: French                                    │
│ Starting level: [B1 ▾]                              │
│                                                      │
│ Daily goal: [20 ▾]                                  │
│                                                      │
│ Account                                              │
│ [session/account controls from approved auth]        │
│                                                      │
│ [inline saved/error status]                         │
└──────────────────────────────────────────────────────┘
```

Plus/Later settings are absent until their owning feature exists; do not show disabled placeholders.
