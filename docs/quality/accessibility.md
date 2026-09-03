# Accessibility verification baseline

- Status: Accepted for first-slice implementation; public support matrix deferred
- Date: 2026-09-01
- Product acceptance: [Pasted-text Reader learning loop](../product-specs/pasted-text-reader-learning-loop.md)

Readify targets WCAG 2.2 Level AA for first-slice implementation. This is a design and verification target, not a conformance or public browser-support claim before evidence exists. The normative standard is [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Implementation verification baseline

For every affected change:

- use semantic HTML and expose names, roles, states, labels, errors, and status changes programmatically;
- run automated critical-path checks on Chromium, Firefox, and WebKit engines;
- automate the complete keyboard flow with visible focus and no trap;
- exercise escaped literal markup, 200% zoom, applicable 400%/320-CSS-pixel reflow, reduced motion, touch-size behavior, and textarea count/errors;
- verify Reader token navigation, context-surface focus entry/return, vocabulary state, Undo, and resume without relying on color, pointer, hover, or drag;
- run static/runtime accessibility rules, while treating them as supplements rather than proof.

Before slice acceptance, manually smoke the critical loop with one available primary desktop combination and record exact OS/browser/AT versions:

- latest stable NVDA + current Firefox on Windows; **or**
- built-in VoiceOver + current Safari on macOS.

Use responsive browser tests at representative mobile widths for Import, Reader, context bottom sheet, Vocabulary, and resume. Mobile structure must remain semantic and keyboard/focus coherent where the platform exposes a keyboard.

## Critical-loop smoke script

Using deterministic non-production email delivery and the approved fixture, complete sign-in, onboarding, import, status, Reader token navigation, context open/dismiss, vocabulary change/Undo, Vocabulary, Progress, sign-out/in, and resume. Verify understandable focus order, announcements, state, errors, and recovery without sight or pointer input where supported.

Any exception needs an issue with severity, affected flow/combination, workaround, owner, and expiry. A `BLOCKER` or `MAJOR` accessibility defect in the critical loop blocks slice acceptance.

## Public support matrix deferred

Before a public launch, product/quality/operations must set and resource:

- the browser and OS support window;
- mandatory desktop and mobile screen-reader combinations;
- real-device or device-cloud access and release cadence;
- an exceptions/deprecation policy and public support wording.

VoiceOver+iOS Safari and TalkBack+Android Chrome are sensible later release-smoke candidates, but neither is a prerequisite for implementing and deterministically verifying this slice. Deferring the launch matrix does not authorize browser-specific markup or dismissal of reproducible standards-based defects.
