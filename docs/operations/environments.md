# Environments and configuration

| Environment | Purpose | Data/providers | Expectations |
| --- | --- | --- | --- |
| Local | fast development | synthetic fixtures, local services, fake providers by default | reproducible from documented commands |
| Test | automated isolation | disposable database/storage/queue, fakes/recorded fixtures | deterministic, parallel-safe, no paid credentials |
| Preview/staging | review each change/release candidate | synthetic or explicitly sanitized data, sandbox providers | production-like build/config/security; migrations exercised |
| Production | real users and content | production services and approved providers | least privilege, backups, monitoring, audit, controlled deploys |

Configuration is environment-driven, validated at startup, and fails fast for missing required values. `.env.example` documents names and safe local placeholders; `.env` is untracked. Feature flags gate experimental/high-cost providers such as the YouTube connector, not permanent forks of business logic.

Build artifacts are immutable and promoted from the same revision; environment differences are configuration and credentials. Production secrets use the hosting platform's secret manager, have owners/rotation, and never pass to browser bundles or preview logs.

Local setup is documented in the root README and uses Corepack, the pinned lockfile, and Docker Compose without undocumented global packages. PostgreSQL 18.6 is the only stateful service for this slice. GPU development is unnecessary; deterministic recorded language analysis keeps normal tests offline.

For the first slice, captured email proofs and fixture-backed meanings are local/test adapters. A restricted preview may use them only with synthetic accounts/content. Production startup is intentionally disabled even when placeholder provider names are selected: no managed identity or licensed meaning adapter exists yet. Implementing and approving those real adapters is a production rollout gate, not a reason to put vendor SDKs into the initial slice.
