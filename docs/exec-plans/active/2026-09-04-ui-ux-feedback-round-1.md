# UI/UX feedback round 1

- Status: implementation active; human acceptance required before completion
- Date: 2026-09-04
- Source feedback: [`ui-ux-feedback.md`](../../../ui-ux-feedback.md)
- Product contract: [Pasted-text Reader learning loop](../../product-specs/pasted-text-reader-learning-loop.md)
- Architecture contract: [Pasted-text slice contracts](../../architecture/pasted-text-slice-contracts.md)

## Goal

Resolve the first hands-on UI/UX feedback without expanding into production providers, chapters, themes, or a general Library redesign. Preserve the explicit-learning and honest-progress invariants while improving responsive behavior, resume, feedback, and vocabulary classification.

The LingQ screenshot is interaction research only. Readify will not copy its visual assets or styling.

## Accepted decisions

- A lookup alone remains unclassified. Explicit states are `new`, `recognized`, `familiar`, `learned`, `known`, and `ignored`.
- Keys `1`–`4` select the matching learning stage; `Q` selects Ignore and `E` selects Known while the context panel is open.
- A policy-qualified non-French result is blocked. Short or undetermined input remains accepted to avoid false rejection.
- Pasted text remains one section. Semantic scroll resume is implemented now; chapters are deferred.
- Human review is the independent acceptance gate. This plan stays active until that review has no Blocker or Major findings.

## Ordered commits

1. Surface the saved onboarding level in Library.
2. Remove the redundant Library heading import shortcut.
3. Replace the tablet icon rail with bottom navigation.
4. Correct Reader overflow and use a tablet overlay drawer.
5. Correct Reader token hover/focus contrast.
6. Explain deterministic fixture-dictionary misses and expose retryability.
7. Persist semantic Reader position while scrolling/backgrounding.
8. Block confident non-French submissions without override.
9. Add explicit vocabulary stages, keyboard shortcuts, migration, and ADR.
10. Make the last state change and Undo action visibly discoverable.
11. Record automated verification and human-acceptance handoff.

Every behavior commit includes its focused test and owning documentation change. It must compile independently; commits are not squashed.

## Verification

Run targeted tests during each change, then:

```bash
pnpm format
make verify
make e2e
pnpm build
git diff --check
```

Manually inspect desktop, tablet, and mobile layout plus token state shortcuts, Undo, scroll resume, language rejection, and missing fixture meanings. Record commit hashes and evidence below. Do not push or merge without an explicit request.

## Deferred

- production identity and dictionary providers;
- brand guide, dark theme, and color-system expansion;
- general processing-card redesign;
- profile editing;
- pasted-text chapters;
- audio, SRS, and broader keyboard/mobile-sheet work.

## Evidence

Implementation commits on `ui/feedback-round-1`:

- `a7644c1` docs: record first UI UX feedback round
- `925cd71` feat(profile): surface the saved onboarding level
- `1392290` refactor(library): remove the redundant import shortcut
- `e4e0ad4` fix(navigation): use bottom navigation at tablet widths
- `d45807e` fix(reader): eliminate responsive overflow
- `f41efd4` fix(reader): improve token hover and focus contrast
- `8f2383e` fix(reader): clarify fixture dictionary availability
- `b48287a` feat(reader): persist semantic position while reading
- `5357684` fix(import): block confident non-French submissions
- `197afa1` feat(vocabulary): add four explicit learning stages
- `187bdc4` fix(reader): make undo discoverable
- `197677b` fix(docs): complete vocabulary ADR metadata
- `ad5f213` fix(reader): preserve hover and context focus behavior
- `a9933d2` fix(reader): harden restore and stale undo feedback

Automated evidence after the final commit:

- `pnpm format` passed.
- `make verify` passed: repository harness, formatting, lint, typecheck, unit/provider tests, PostgreSQL integration tests, architecture checks, migration upgrade/idempotency checks, audit, security, product, and documentation checks.
- `pnpm exec playwright test --project=chromium --project=firefox` passed: 8 tests.
- `pnpm build` passed for web and worker packages.
- `git diff --check` passed.
- WebKit was attempted through the full E2E configuration but could not start because this host lacks Playwright's required `libavif.so.16` and related system packages. `sudo` requires a local password, so installing OS dependencies is an environment action outside this repository change. Chromium and Firefox cover the application assertions successfully.

Human acceptance remains pending at the requested desktop (1440px), tablet (1024/820px), and mobile (500/390px) viewports, including visual contrast, keyboard shortcuts, Undo, semantic resume, mismatch blocking, and fixture-dictionary empty state. Keep this plan under `active/` until the independent review records only `PASS`. No push or merge has been performed.
