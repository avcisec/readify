# Visual foundation

This document owns the implemented visual direction for the application shell,
Library, and Reader. Behavioral authority remains the [interaction model](interaction-model.md)
and the relevant product specification.

## Direction

Readify uses a calm, content-first reading workspace. Its information architecture
is informed by the useful parts of LinguaCafe: a persistent collection navigation
rail, scannable reading items, a generous text canvas, and a contextual vocabulary
surface that stays beside the text on desktop and becomes a bottom sheet on mobile.
This is a layout reference, not permission to copy LinguaCafe code, branding,
artwork, book covers, wording, or exact styling.

## Foundation

- Primary brand and interactive color: deep teal `#001e1e`.
- Canvas: warm, low-contrast neutral; reading page: near-white warm paper.
- Surfaces: white with quiet borders and shallow elevation. Elevation communicates
  containment, not decoration.
- Typography: system sans-serif for application UI and a platform serif stack for
  long-form Reader text. No runtime font service is required.
- Shape: modest rounded corners, with a distinctive asymmetrical Readify mark.
- State and focus: state never relies on color alone; visible focus uses a
  contrast-safe teal outline. Muted text must still satisfy WCAG AA at its rendered
  size.

## Shell and responsive behavior

- Desktop uses a labeled left navigation rail. Tablet collapses the rail to icons
  with accessible names. Mobile uses a four-action bottom bar so navigation and
  sign-out remain reachable.
- Reader keeps the shell available but adds its own compact reading header. The
  page remains the primary visual surface; opening context must not shrink it below
  a useful reading width.
- Library items use generated typographic covers until real cover metadata is an
  approved feature. Generated covers must not imply uploaded or inferred artwork.
- Reader context is sticky and independently scrollable on desktop. On mobile it
  becomes a bounded bottom sheet with a visible handle and close action; it may
  cover the global bottom bar while open.

## Current limits

This foundation does not add themes, user-selectable colors/fonts, cover uploads,
Reader settings, audio controls, review navigation, or unimplemented product
features. Those appear only when their owning product scope is implemented.
