# Performance and capacity

Performance work starts with budgets and measurements, not speculative distribution.

## Measure from the first executable slice

- web/API request rate, p50/p95/p99 latency, error rate, and saturation;
- database query latency, slow queries, connections, locks, storage growth, and backup/restore time;
- queue depth, oldest-job age, run time, retry/dead-letter rate, and worker utilization by job type;
- import time to first usable section and time to fully ready;
- extraction/OCR pages, ASR/alignment/audio minutes, TTS characters, GPU seconds, cache-hit rate, and cost per successful import;
- reader initial load, long-document memory, interaction latency, media start time, and sync drift.

## Initial qualitative budgets

Interactive API work must be bounded and return without waiting for media processing. Reader payloads must be paged/windowed by stable document structure rather than loading an entire book. Workers process bounded pages/chunks and apply per-user fairness. Database queries need explicit limits; no unbounded list or N+1 access is acceptable.

Numeric SLOs and capacity assumptions are deferred until the first vertical slice can be measured with representative fixtures. A product/operations owner must set them before production acceptance.

## Change policy

Optimize after profiling. Every cache defines identity, privacy scope, version, invalidation, and behavior on loss. A topology or extraction change must satisfy the evidence rules in [scaling](../architecture/scaling.md). Performance tests belong near the critical algorithm; full load tests remain a separate CI/on-demand suite.

