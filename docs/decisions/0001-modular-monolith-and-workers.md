# ADR-0001: Modular monolith with asynchronous workers

- Status: Accepted
- Date: 2026-08-31

## Context

Readify spans tightly connected content, reading, audio, vocabulary, review, and progress transactions, while import/OCR/ASR/TTS/alignment need long-running and sometimes GPU-backed execution. The team is initially small and has no measured independent-service scaling need.

## Choice

Build one modular application with explicit domain packages and one primary relational database. Run HTTP and durable workers as separate process types from the same versioned repository. Cross-domain work uses public application interfaces and durable events/jobs; long work never blocks HTTP.

## Reasons

This keeps local development, transactions, refactoring, testing, deployment, and incident correlation simple while allowing web, CPU workers, and GPU workers to scale separately. Explicit boundaries preserve future extraction points.

## Alternatives

- Microservices now: rejected because network contracts, distributed transactions, deployments, and observability would arrive before independent ownership/scale evidence.
- Single synchronous web process: rejected because media jobs exceed request lifetimes and require restart recovery.
- Serverless functions only: rejected as the primary model because GPU and long/chunked work have different execution needs; individual adapters may still use managed services later.

## Tradeoffs and migration difficulty

The monolith needs mechanical dependency checks and can contend for one database. Extraction later requires an ADR, owned data contract, backfill, dual-run/cutover, and operational ownership; moderate to high difficulty depending on data coupling.

