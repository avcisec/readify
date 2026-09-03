# ADR-0004: Simplest atomic durable handoff

- Status: Accepted
- Date: 2026-08-31
- Amends: [ADR-0003](0003-durable-jobs-and-artifacts.md), publication mechanism only

## Context

ADR-0003 required an outbox relay for reliable job publication. ADR-0002 places both initial application state and the durable queue in PostgreSQL, where the job can be inserted in the same transaction. Requiring a separate outbox row and relay in that topology adds duplicate state, lag, code, and an operational failure mode without increasing atomicity.

## Choice

Require atomic durable handoff, not a specific pattern. Insert jobs/events directly with the state transaction when the selected PostgreSQL queue supports it. Use a transactional outbox and at-least-once relay only when the destination transport cannot participate in the state transaction. Consumers remain idempotent in both cases.

## Reasons

This preserves the reliability invariant while selecting the fewest moving parts for the initial topology. It also leaves the queue port free to move to a dedicated backend later without pretending that direct enqueue is atomic across two systems.

## Alternatives

- Always use an outbox: consistent across future transports, but premature for the initial single-database boundary.
- Enqueue after commit without an outbox: simpler but can lose work between state commit and publish.
- Enqueue before state commit: can expose work whose source state later rolls back.

## Tradeoffs and migration difficulty

Queue adapters must declare whether they support the caller's transaction, and integration tests must prove rollback/commit behavior. Moving to a non-transactional external queue requires adding an outbox relay before cutover; moderate difficulty and no domain-contract change.

