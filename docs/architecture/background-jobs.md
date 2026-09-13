# Background jobs

Long-running work is a durable workflow, never a long HTTP request.

## Import workflow

```text
received → validating → [extracting for file/remote sources] → normalizing → segmenting
         → [OCR when required]
         → [caption/transcription when required]
         → annotating
         → [TTS when requested/eligible]
         → [alignment]
         → partial_ready/ready
```

Stages are a dependency graph, not one opaque job. Optional enrichment can complete later or fail without discarding valid prior artifacts. A user-facing import status is derived from stage records, not a worker's in-memory state.

Source-byte deletion is also a durable idempotent job. It is not an import stage and therefore cannot mutate a deleted or unrelated import workflow when retries are exhausted.

## Job contract

Every job records:

- stable job ID, type, payload schema version, tenant/owner, priority;
- workflow/import ID, correlation ID, causation ID, idempotency key;
- queued/started/heartbeat/completed timestamps, attempt count, progress unit/value;
- timeout and retry policy, lease/visibility deadline, worker/provider version;
- result artifact references or a classified internal error plus safe user message.

Workers checkpoint between bounded units (page, section, audio chunk). A lease and heartbeat allow another worker to recover abandoned work after restart. Completion uses compare-and-set/idempotency protection so redelivery is safe.

For PDF imports, extracted pages are durable idempotent checkpoints. Recovery reuses successful native/OCR pages, retries failed pages, then reruns deterministic whole-book reconstruction; semantic uniqueness and revision-stable IDs prevent duplicate chapters or anchors. Details are owned by the [PDF import contract](pdf-import-contract.md).

## Retry and failure policy

- Retry only classified transient failures with capped exponential backoff and jitter.
- Validation, authorization, unsupported input, and deterministic corrupt-file failures do not auto-retry.
- Provider throttling honors provider guidance and a global concurrency/rate budget.
- Each attempt has a hard timeout and propagates cancellation where supported.
- Exhausted jobs enter a failed/dead-letter state with an operator-visible reason and replay procedure.
- Manual retry creates an audited attempt and reuses valid prior artifacts.

Do not catch an error and mark the stage successful, retry without a bound, or use a process-local queue for durable work.

## Idempotency and reliable publication

Use a semantic key derived from operation, input/artifact hash, scope, and processing configuration version. The invariant is atomic durable handoff: when state and the PostgreSQL-backed queue share a transaction, insert the job directly in that transaction. If a future queue/event transport cannot join the transaction, persist an outbox record with the state and relay it at least once. Consumers always deduplicate by message/job ID and validate that dependencies still match before committing results.

## Progress and cancellation

Progress is monotonic within a stage and honest about unknown totals. Cancellation prevents new downstream work and asks running tasks to stop at checkpoints; it does not delete artifacts still referenced elsewhere. State transitions and administrative replays are audited.
