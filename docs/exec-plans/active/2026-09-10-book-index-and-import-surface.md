# Book index and dedicated import surface

- Status: implementation active
- Date: 2026-09-10
- Product sources: [MVP scope](../../product/mvp-scope.md), [screen inventory](../../product/screen-inventory.md), [interaction model](../../product/interaction-model.md)
- Architecture contract: [pasted-text slice contracts](../../architecture/pasted-text-slice-contracts.md)

## Goal

Make Library a collection surface, move pasted-text creation to a dedicated `/import` page, and give every imported book a private index route at `/library/{libraryItemId}`. The book index lists the item's available sections as chapters; selecting a chapter's read action opens Reader scoped to that section.

## Slice decision

Existing persisted `sections` are the chapter boundary for this UI. The current pasted-text worker creates one section, so pasted text initially shows one chapter. This change exposes the boundary without inventing heading parsing or changing the import pipeline. A future EPUB/structured-content slice may create multiple sections and reuse the same index surface.

## Scope

- Add `/import` with the existing paste form, validation, counter, and processing submission behavior.
- Change Library actions to navigate to Import and show collection cards linking to each book index.
- Add book index route and a read action per chapter/section.
- Add an application query/API shape for an owned book summary with ordered chapters and completion/readiness state.
- Keep existing Reader behavior and position semantics; opening a chapter supplies an explicit section context.
- Update product and architecture documentation and add API/E2E coverage.

## Deferred

- Automatic chapter detection for pasted text.
- Editing/reordering/renaming chapters.
- Audio chapter controls and Sentence View.
- Library card redesign beyond navigation affordances.

## Acceptance criteria

- `/library` contains no large import form and its import CTA opens `/import`.
- `/import` preserves the current paste flow and returns to Library after submission.
- Each owned library item opens `/library/{id}`; another account's guessed ID remains indistinguishable from not found.
- The book index lists ordered chapters with status/completion and an accessible read icon/button.
- Selecting a chapter opens Reader for that chapter only; existing pasted text opens its single section.
- Desktop, tablet, and mobile layouts remain within the viewport.
- `make verify`, targeted integration tests, Chromium/Firefox E2E, and `pnpm build` pass.

## Verification and handoff

Run targeted tests while implementing, then `make verify`, browser E2E, `pnpm build`, and `git diff --check`. Keep this plan active until manual acceptance and independent review pass.
