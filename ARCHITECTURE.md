# Architecture

Readify starts as a **modular monolith with asynchronous workers**. The web/API process and workers share versioned domain/application modules and one relational source of truth; long-running import and media workflows never occupy an HTTP request. Object storage holds untrusted originals and derived artifacts.

Read in this order:

1. [Architecture overview](docs/architecture/overview.md)
2. [Domain boundaries](docs/architecture/domain-boundaries.md)
3. The relevant flow: [data flow](docs/architecture/data-flow.md), [background jobs](docs/architecture/background-jobs.md), or [storage](docs/architecture/storage.md)
4. The relevant slice contract, currently [pasted-text architecture/API contracts](docs/architecture/pasted-text-slice-contracts.md)
5. [Accepted ADRs](docs/decisions/README.md)

Operational constraints are owned by [environments](docs/operations/environments.md), [observability](docs/operations/observability.md), and [deployment](docs/operations/deployment.md). This file is intentionally a stable index rather than a duplicate design document.
