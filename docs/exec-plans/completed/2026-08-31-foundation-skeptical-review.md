# Foundation skeptical review

- Status: Completed
- Date: 2026-08-31
- Scope: repository controls and architecture documentation only

## Goal

Review the initialized repository for false-green verification, premature architecture, ambiguous ownership, unnecessary tooling, and agent-specific coupling. Preserve working decisions unless a concrete failure mode justifies change.

## Findings to resolve

### MAJOR — Foundation skips can become false-green checks

`make verify` unconditionally reports skipped typecheck, unit/domain, integration/API, and migration execution, while format/lint/architecture/security inspect documentation only. Adding a runtime manifest, application source root, or migrations would not force the owner to replace all foundation-only checks. Add a fail-closed transition guard and standard-library tests for it; route `make e2e` through the same guard.

### MAJOR — Reliable publication prescribes redundant machinery

The accepted baseline initially uses PostgreSQL for both state and durable jobs, but architecture docs require a transactional outbox and relay in every case. Require atomic durable handoff as the invariant; use direct transactional enqueue when possible and an outbox only across a non-atomic boundary.

### MAJOR — Import/Platform ownership is internally ambiguous

The boundary table calls Platform a product domain and says Import owns a processing saga, while dependency rules put cross-domain workflows in an application process manager. Clarify that platform services are infrastructure capabilities and that the Import application layer coordinates public module contracts without owning their domain data.

## Non-findings

- Historical references to T3 Browser are research provenance, not an operational dependency. No generated operating guide requires T3Codes, Codex, or hidden context.
- Separate worker process types are justified by request lifetime and GPU/resource differences; they are not premature microservices.
- Provider ports correspond to real external systems. No evidence justifies removing them.
- The current CI and dependency-free foundation checker are sufficient before a runtime exists; adding a full documentation/toolchain linter now would be unnecessary.

## Acceptance criteria

- Verification fails with an actionable message if runtime/schema markers are introduced while checks remain foundation-only.
- Foundation guard behavior has executable regression tests.
- `make verify` and targeted checks pass in the current documentation-only repository.
- Job documentation chooses the simplest atomic handoff supported by the queue boundary.
- Import coordination and platform-service ownership are unambiguous.
- Final review has no remaining Blocker or Major finding in this scope.

## Verification

```bash
python3 -m unittest discover -s scripts -p 'test_*.py'
make verify
make e2e
```

Negative guard behavior will be tested with temporary repositories, not by adding fake runtime files to the workspace.

## Resolution and review

- Added fail-closed runtime/schema transition guards across foundation-only format, lint, architecture, security, typecheck, test, integration, E2E, and migration behavior.
- Added four dependency-free regression tests covering empty-foundation behavior plus manifest, source-root, and nested-migration detection.
- Replaced the unconditional outbox requirement with atomic durable handoff and recorded the correction in [ADR-0004](../../decisions/0004-atomic-durable-handoff.md).
- Clarified that platform services are infrastructure, artifact metadata belongs to producing modules, and the Import application layer coordinates rather than owns Content/Audio/Language-intelligence state.
- Rechecked operational documents for stale current architecture and confirmed that T3 references are confined to research provenance and this audit note, not operating instructions.

Verification passed with the commands above. Reviewer disposition: `PASS`; no `BLOCKER` or `MAJOR` findings remain in the requested scope.
