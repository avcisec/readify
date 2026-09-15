# Storage and database lifecycle

## Storage responsibilities

- PostgreSQL is the transactional source of truth for accounts, ownership, document metadata/structure, user learning state, jobs, events, and artifact metadata.
- S3-compatible object storage holds quarantined originals, normalized payloads too large for rows, page images, audio, model outputs, and export packages.
- PostgreSQL initially backs the durable queue as well as job/workflow records. Queue access remains behind a port so measured contention can justify a dedicated backend later.

Do not store large media blobs in PostgreSQL, use process-local memory as durable job state, or treat provider URLs as permanent artifact identity.

## Artifact identity and privacy

Every artifact records logical type, immutable object key, byte size, checksum, MIME type, owner/sharing scope, source/input hashes, processor/model/config versions, creation/expiry, and lifecycle status. Signed URLs are short-lived and authorization is checked before issuance.

In the current single-host adapter, private upload keys are account-scoped. Deleting a Library item permanently removes its source-owned database hierarchy in one transaction and queues an idempotent local-file purge; the purge first confirms that no live asset still references the key. A failed purge remains a diagnosable worker job and never restores access. Before production object storage is enabled, define the provider's recovery window, orphan scan, retention policy, and audited administrative recovery path; do not copy the local immediate-purge policy into production by assumption.

Public/licensed source artifacts may eventually use a canonical global key. Private source inputs—including pasted text and uploaded files—deduplicate within an account by default; a cross-account hash hit must never reveal another user's content. Cache sharing and retention require explicit policy approval.

## Migration rules

- Every schema change is a version-controlled migration reviewed with its code.
- Migrations run against a representative database in CI before merge and in preview before production.
- Prefer additive, backwards-compatible **expand/migrate/contract** changes: add compatible schema, deploy dual-compatible code/backfill, verify, then remove old schema in a later release.
- Backfills are bounded, resumable, observable, and separate from latency-sensitive deploy transactions.
- Destructive or locking changes require an execution plan, data-volume/lock assessment, backup/recovery method, and explicit approval.
- Never edit production schema or data manually as the source of truth. Emergency repair commands must be scripted, reviewed, audited, and followed by a migration if schema is affected.
- “Rollback” may mean forward-fix or restore; every risky migration states which recovery is safe.

Once an ORM/migration tool exists, `make migration-check` must create a clean schema, apply all migrations, check drift, and test the supported upgrade path.

## Backup and recovery

Production requires automated encrypted database backups with point-in-time recovery where supported, object versioning/lifecycle policy, and restore drills. Recovery point/time objectives, retention, region, and legal deletion policy remain open operational decisions; deployment cannot be called production-ready until they are set and tested.
