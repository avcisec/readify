# ADR-0008: Deterministic CPU PDF reconstruction

- Status: Accepted
- Date: 2026-09-12

## Context

Reader, vocabulary, resume and future audiobook alignment need semantic text identities and precise provenance. Physical PDF pages, plain `get_text()` output and publisher-specific parsers cannot provide a durable book model. Readify targets horizontally scalable CPU workers and cannot require paid APIs, GPUs, LLMs or VLMs.

## Choice

Use PyMuPDF as the native extraction adapter, selective Tesseract OCR for unusable pages, and a first-party deterministic reconstruction layer. The layer emits a language-independent `Book → Chapter → Paragraph → Sentence → Token` hierarchy while retaining pages, raw geometry and multi-segment source anchors. Book language configures OCR and downstream NLP; canonical grammar identifiers follow Universal Dependencies.

Use outline and typography before language-specific heading words. Flatten leaf chapters/stories for the current Reader and retain their parent heading path as metadata. Persist version/config fingerprints and quality evidence. Keep this inside the modular monolith's asynchronous worker rather than creating a parsing service.

## Reasons

This preserves the best available native text, makes OCR cost proportional to actual need, keeps Reader identities independent from page layout, and allows CPU workers to scale without adding a service boundary. Provider-neutral output also lets a later EPUB extractor and audiobook alignment reuse the same content model.

## Alternatives

- Page-as-chapter/plain extraction: simpler but breaks paragraphs, navigation, provenance and audio alignment.
- OCR every page: predictable path but slower, less accurate for native text and unnecessarily expensive.
- Docling/LLM/VLM pipeline: broader layout capabilities but materially heavier CPU/runtime/operations and non-determinism for the current book use case.
- Publisher-specific parsers: can improve narrow datasets but create an unmaintainable rule matrix without measured evidence.

## Tradeoffs and migration difficulty

Heuristics require a representative quality corpus and confidence monitoring; unusual layouts will remain imperfect. Rich page metadata and anchors increase storage. PyMuPDF/Tesseract become pinned worker runtime dependencies, but their adapter output is provider-neutral. Replacing extraction is moderate difficulty; replacing the canonical hierarchy would be high difficulty, so it is versioned and provider-independent.

Cross-revision identity remapping is intentionally deferred until a reprocessing command exists. Source-revision IDs remain immutable; semantic IDs are deterministic within one revision.

## Consequences

PDF worker images must contain pinned PyMuPDF and optional Tesseract language packs. Import quality must be evaluated against a versioned corpus before production rollout. Low-confidence pages and chapter boundaries remain readable and diagnosable instead of silently failing the complete book.
