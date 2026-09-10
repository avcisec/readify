# E2E CI reliability

- Status: implementation active
- Date: 2026-09-10
- Scope owner: [Development lifecycle](../../quality/development-lifecycle.md)
- Regression evidence: GitHub Actions runs `34489546867` and `34489631919`

## Goal

Restore a trustworthy browser acceptance gate by isolating retries and keeping each scenario within a meaningful timeout without weakening behavioral assertions.

## Diagnosis

- The main first-slice journey contains many independently valuable behaviors in one 45-second test and times out late on slower CI browsers.
- A failed first attempt persists its user/profile/data. The retry reuses the same email, reaches Library instead of onboarding, and hides the original failure.
- The focused HTTP and responsive tests pass; repository verification and production builds pass.

## Changes

1. Give every test attempt an isolated identity derived from the browser project, test identity, retry, and repeat index.
2. Split the monolithic journey into focused acceptance scenarios with explicit setup helpers and independent state.
3. Preserve coverage for onboarding/import/Reader, vocabulary state and Undo, semantic resume/meaning fallback, progress, and sign-out/sign-in restoration.
4. Keep the repository-wide 45-second default; add a larger timeout only if one coherent journey remains inherently longer after splitting.
5. Retain CI-only screenshots, traces, and the Playwright report for seven days without introducing a service dependency.

## Non-goals

- Changing product behavior, API contracts, database schema, or visual design.
- Removing assertions or skipping a browser to obtain a green build.
- Solving GitHub private-repository branch-protection plan limits.

## Risks and recovery

- Scenario splitting can accidentally reduce cross-surface coverage; shared setup must not replace final user-visible assertions.
- Tests must not depend on execution order or data from another test.
- Recovery is a revert of the test-only commit; no runtime or migration rollback is required.

## Acceptance

- A retry always starts with a fresh user and reaches onboarding.
- Each focused scenario passes independently in Chromium, Firefox, and WebKit.
- The complete `make e2e`, `make verify`, and production build pass locally.
- The GitHub Actions browser job passes on the fix PR.
- Reviewer finds no `BLOCKER` or `MAJOR` issue.

## Verification

```bash
pnpm exec playwright test tests/e2e/first-slice.spec.ts --project=chromium
make e2e
make verify
pnpm build
git diff --check
```

## Review

- Builder evidence: six Chromium scenarios passed; the same six Firefox scenarios passed during the cross-browser run. The longest focused scenario was under 13 seconds locally, versus the previous 45–52 second aggregate timeout.
- `make verify` and the production build pass with the isolated test-port override.
- Local WebKit launch is unavailable because the host lacks `libavif.so.16`; GitHub CI installs the required browser libraries and remains the acceptance authority for WebKit.
- Self-review found missing CI trace/report retention and added a seven-day failure artifact; independent PR/CI review remains pending.
