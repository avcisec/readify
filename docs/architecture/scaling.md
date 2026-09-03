# Scaling and evolution

Scale by measured bottleneck, first through process replicas, queue priorities/concurrency, indexing, caching, and bounded work.

| Surface | Likely pressure | First response | Evidence for larger change |
| --- | --- | --- | --- |
| Web/API | concurrent readers, polling/status reads | stateless replicas, projection/cache tuning | sustained latency/error SLO breach |
| PostgreSQL | event volume, progress queries, job writes | query/index review, batching, read models | measured CPU/I/O/lock saturation |
| General workers | imports and exports | horizontal consumers, fair per-user limits | queue age exceeds target at safe concurrency |
| GPU/media | ASR/TTS/alignment time and VRAM | dedicated queues, chunking, cache, on-demand nodes | utilization/queue age justifies capacity |
| AI providers | rate, latency, cost, outages | budgets, concurrency limits, fallback/degrade | provider SLO/cost repeatedly violates budget |
| Object storage/CDN | audio/page delivery | signed CDN/cache, lifecycle policy | egress/latency measurements justify it |

Identity, Library, Reader, Vocabulary, Review, and Progress should remain in the monolith until [extraction criteria](domain-boundaries.md#extraction-criteria) are met. Media/ML execution may scale independently as a process because hardware differs, while its business workflow remains owned by the modular application.

Before changing topology, capture baseline throughput, p50/p95/p99 latency, queue age, failure/retry rate, cost per successful import, utilization, and operational burden in an ADR.

