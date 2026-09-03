# Open product questions

Do not silently choose defaults that change product scope, policy, cost, or architecture. User-facing and first-slice choices are tracked with recommendations and change impact in the [UX decision log](ux-decisions.md).

## Media, data, and quality policy

- When may public/licensed artifacts be shared across users, and which originals/derivatives must remain account-scoped?
- What confidence thresholds choose native extraction, OCR, caption, align-only, ASR, word timing, sentence fallback, or unsynchronized playback?
- Which raw inputs/model outputs may be retained for debugging or future quality evaluation, with what consent and redaction?
- What deletion/recovery window applies to originals, derivatives, learning state, and exported packages?
- Which model/provider quality, latency, and cost thresholds block rollout or trigger fallback?

## Operations and economics

- What latency, throughput, GPU cost, and per-import budgets define acceptable service?
- Which region, hosting provider, data residency, backup retention, and recovery objectives apply?
- What production availability objectives and incident ownership apply to web, database, queue, object storage, and GPU processing?

## Later product policy

- What content licensing/moderation rules would be required before any public Library exists?
- What consent and abuse controls would be required before voice cloning or speaking feedback?
- What portability/deletion scope applies when Plus account export and deletion ship?

Research-specific unanswered questions remain in the [research summaries](../research/README.md).

