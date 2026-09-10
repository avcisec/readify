# Deployment and release

## Release path

1. A reviewed change passes `make verify` and any affected E2E/media suites.
2. CI builds immutable artifacts once, records revision/dependency provenance, and scans them when manifests/images exist.
3. Preview/staging applies migrations and runs smoke/acceptance checks with production-like configuration.
4. Production preflight confirms migration/recovery plan, health/alerts, queue compatibility, and feature flags.
5. Deploy backwards-compatible web and workers, observe health/telemetry, then enable risky functionality gradually.
6. Record release outcome; move the execution plan to `completed/` after acceptance.

Workers and web from adjacent revisions may overlap during a rolling deployment. Job/event payloads therefore require explicit schema versions and backwards compatibility. Destructive schema contraction happens only after all old code/jobs are drained and evidence confirms the old path is unused.

## Failure and recovery

Prefer pausing a feature flag or job producer, draining/retrying compatible work, and forward-fixing. Application rollback is safe only if database/job contracts remain compatible. Every risky release names a decision owner, rollback/forward-fix condition, data recovery path, and verification query/metric.

Production promotion is blocked until hosting region, availability objectives, backup retention, restore drill, domains/TLS, secrets, capacity budgets, alert destinations, and incident ownership are decided. This foundation does not provision cloud resources.

## CI implementation

CI is routed by changed path. `.github/workflows/docs.yml` runs `make verify-docs` for documentation and product-contract changes without installing the Node dependency graph. `.github/workflows/verify.yml` runs `make verify` and builds web/worker artifacts for runtime, configuration, dependency, and tooling changes. `.github/workflows/browser.yml` installs Playwright's Chromium, Firefox, and WebKit engines and runs `make e2e` only when web, critical-flow package/worker, browser-test, dependency, or E2E infrastructure paths change. Mixed changes receive every matching workflow.

On browser failure, its HTML report, screenshots, and traces are retained for seven days as a repository-scoped artifact. Normal CI uses only the outbox, fixture-meaning, recorded-analysis, and approved synthetic content; it requires no paid credential or model download. Path filtering reduces redundant work but does not replace the risk-based local gates in the [testing strategy](../quality/testing-strategy.md).

The current artifacts authorize local/test and restricted synthetic preview only. Production promotion remains blocked by the gates above, and startup rejects deterministic provider adapters when `APP_ENV=production`.
