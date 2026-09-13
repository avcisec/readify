# Observability and incident debugging

Observability is part of each feature's acceptance, not a later dashboard project.

## Minimum telemetry

- Structured JSON logs with timestamp, severity, service/process, environment, revision, event name, correlation/trace ID, request or job ID, domain subject IDs, duration, and classified outcome.
- Centralized application error reporting with release/environment, safe context, grouping, ownership, and alert routing.
- Metrics for request latency/error/saturation, database availability/connections/query latency, queue depth/oldest age/retries/dead letters, and worker heartbeat/utilization.
- Import metrics by source/stage: duration, success/failure reason, retry, partial readiness, failed import/alignment counts.
- Source deletion backlog and failed local/object-storage purges, without logging private object keys.
- AI/media metrics by provider/model/config: latency, timeout/error, input/output usage, estimated cost, GPU seconds, audio minutes/pages/characters, quality/fallback result, and cache hit.
- Trace/correlation propagation from browser request through API, durable handoff, job attempts, provider calls, and artifact writes.

Never use unbounded user IDs or document text as metric labels. Never log raw uploads, transcript/document content, vocabulary context, prompts/responses, tokens, signed URLs, or secrets by default.

## Health and alerting

Liveness reports process ability to run; readiness checks critical dependencies without doing expensive work. Alerts should be actionable and tied to user impact: elevated API errors/latency, unavailable database, oldest queue age, dead-letter growth, stalled heartbeats, failed imports/alignment, provider budget/latency, and backup/restore failure. Dashboard-only signals without an owner/runbook are insufficient.

## Debug path

Given a user-safe error/reference ID, an operator should locate the request, import workflow, stage attempts, provider outcome, artifact versions, deployment revision, and relevant aggregate changes in centralized tooling. Production diagnosis must not require SSH. Privileged replay/reprocess actions are authorized, audited, scoped, idempotent, and described in a runbook before they are enabled.

## Incident loop

Triage impact and contain safely; correlate telemetry and recent changes; preserve evidence; recover through documented replay/fallback/rollback or forward-fix; communicate status; then record root cause and preventive actions. Do not delete failed artifacts/logs needed for diagnosis outside retention policy.

Provider choice is intentionally open. Instrument through standard structured logging/metrics/tracing boundaries so a hosted error/telemetry vendor or OpenTelemetry-compatible backend can be selected later.

## Implemented first-slice baseline

Web and worker expose separate liveness/readiness routes; readiness checks PostgreSQL. Every HTTP response carries a bounded `X-Request-Id`, accepted imports persist that correlation ID with the first job, and downstream jobs retain it. The worker emits structured JSON attempt start/completion events with stage, attempt, duration, and classified outcome. Logger redaction tests cover pasted text, email, proof/token, meaning, cookie, authorization, and response-body fields.

The durable `jobs` table makes queue state, attempts, leases, heartbeats, retry schedule, and classified terminal failures inspectable without process memory. Import workflow rows retain public-safe stage/capability/error reference state. Central export, dashboards, alert routing, SLOs, and incident ownership remain production rollout gates; raw content and credentials must not be added while wiring them.

PDF diagnosis additionally uses `source_pages.quality_status/warnings` and `source_revisions.import_quality_report`: OCR/failed page numbers, excluded boilerplate counts, chapter confidence, and processor/config versions. These values are bounded diagnostic codes and counts, never extracted text labels.
