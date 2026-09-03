# ADR-0003: Durable staged jobs and versioned artifacts

- Status: Accepted
- Date: 2026-08-31
- Amendment: [ADR-0004](0004-atomic-durable-handoff.md) replaces the unconditional outbox mechanism with the simplest available atomic handoff; the remaining decision is unchanged.

## Context

Imports may combine validation, extraction, OCR, transcription, segmentation, linguistic annotation, TTS, alignment, and enrichment. These steps vary in cost and failure mode, and successful intermediate work should survive retry/restart or provider upgrades.

## Choice

Model processing as durable, bounded, idempotent stages linked by a workflow record. Persist job attempts and user-facing status. Store immutable derived artifacts with input checksum plus processor/model/config version. Reliably publish work from committed state using an outbox pattern; assume at-least-once delivery.

## Reasons

This enables partial readiness, targeted retry, cache reuse, cost/quality telemetry, restart recovery, and reproducibility without requiring a distributed workflow platform on day one.

## Alternatives

- One monolithic import job: simpler initially but poor progress, retries, recovery, and selective invalidation.
- Long-running HTTP: rejected because disconnects/deploys would make correctness depend on request lifetime.
- Adopt a workflow engine immediately: deferred until branching, duration, operator burden, or scale proves a queue plus persisted state insufficient.

## Tradeoffs and migration difficulty

More states and idempotency tests are required. Artifact lifecycle and version cleanup need deliberate policy. Moving to a workflow engine later is moderate difficulty if stage contracts remain explicit; unversioned payloads would make it high.
