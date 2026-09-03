# Visual foundation and Reader/Library polish

## Outcome

Give the implemented first slice a coherent, accessible visual foundation and
polish its two primary surfaces without changing domain behavior. The layout is
informed by LinguaCafe's proven collection/sidebar and reader/context patterns,
but Readify keeps its own visual language, copy, assets, and product contracts.

## Scope and constraints

- Introduce a small CSS-token design foundation led by deep teal `#001e1e`, warm
  neutral canvases, readable typography, consistent spacing, radii, focus, and
  elevation.
- Replace the desktop top navigation with the product-specified persistent app
  sidebar; use a compact bottom navigation on mobile.
- Make Library scan like a content collection: clear page toolbar, focused paste
  surface, stronger empty/processing states, and book-like content cards without
  inventing cover-image support.
- Make Reader immersive: its own compact header/back action, readable page,
  unobtrusive status, selected-token feedback, and a stable context panel that
  becomes an accessible mobile bottom sheet.
- Preserve API behavior, Turkish labels used by acceptance tests, keyboard
  roving focus, focus return, status semantics, and responsive contracts.
- Do not copy LinguaCafe code, artwork, logo, book covers, or exact styling.

## Acceptance result

- Implemented the teal token foundation, responsive app shell, typographic
  Library covers, Reader page, and desktop/mobile context treatments.
- Kept navigation and sign-out reachable at desktop, tablet, and mobile sizes.
- Corrected contrast findings reported by axe and constrained the mobile context
  sheet so the selected sentence remains visible above it.
- Web build and repository verification passed. The full first-slice E2E suite
  passed in Chromium and Firefox, including axe, keyboard, and mobile checks.
- WebKit execution is blocked on this workstation before application startup by
  missing system library `libavif.so.16`; this is an environment dependency, not
  an observed application failure.
- Visual browser review covered empty/filled Library, desktop Reader context, and
  mobile Reader context. Temporary screenshot test code was removed afterward.
