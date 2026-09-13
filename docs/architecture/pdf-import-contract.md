# PDF import and reconstruction contract

- Status: Accepted
- Date: 2026-09-12
- Decision: [ADR-0008](../decisions/0008-deterministic-pdf-reconstruction.md)

## Boundary and canonical output

PDF import is an Import-owned durable workflow. PyMuPDF is an infrastructure adapter; deterministic reconstruction produces Content-owned `Book → Chapter → Paragraph → Sentence → Token` data. Physical pages remain SourceAsset provenance and never become semantic parents. EPUB must later emit the same hierarchy without inventing pages.

The source revision records its book language, extractor/reconstruction/config versions and quality report. Source pages retain raw text, blocks, lines, spans, words, typography, reading order, dimensions, extraction quality and exclusions. Display text is NFC-normalized separately; raw extracted text is never overwritten.

Sections, paragraphs, sentences and occurrences have revision-stable deterministic IDs. Each may have multiple ordered source anchors containing page, source/display scalar ranges and available PDF bbox/block/line/word identities. A later audiobook alignment attaches timing to these semantic IDs; PDF import never fabricates timestamps.

## Deterministic pipeline

```text
accept upload → inspect/extract pages → OCR required pages → reconstruct
              → persist hierarchy → language NLP → ready/ready_degraded
```

- Native text is extracted with PyMuPDF. A page is classified `native_good`, `native_suspicious`, `ocr_required`, or `failed` from bounded quality signals.
- Only `ocr_required` pages invoke PyMuPDF's CPU Tesseract bridge. OCR language derives from the revision language; an unavailable OCR runtime leaves a diagnosable failed page rather than discarding other usable pages.
- Reading order uses source order and geometry, including a conservative two-column rule. Repeated edge headers/footers, page numbers and TOC leader rows are excluded from display but retained with reasons in page provenance.
- Paragraphs use PDF blocks/lines, indentation/spacing/style changes, dialogue/list boundaries and cross-page continuation signals. Footnotes receive a separate paragraph role. Soft hyphens and line-wrap hyphens are repaired in display text while source text and anchors remain intact.
- Chapter precedence is PDF outline, reliable outline-to-heading match, repeated heading typography, then multilingual lexical hints. Collections flatten leaf stories/chapters into Reader sections and retain parent outline titles in `heading_path`. Uncertain input becomes one low-confidence chapter instead of a failed import.
- Sentence segmentation uses the book language through `Intl.Segmenter`; NLP is a later language-configured provider stage and stores Universal Dependencies identifiers rather than localized grammar labels.

## Reliability and limits

The HTTP process stores intent and returns `202`; extraction runs in the general worker. Each extracted page is upserted as a checkpoint before whole-book reconstruction. A recovered job reuses non-failed page checkpoints, and deterministic IDs plus uniqueness constraints prevent duplicate semantic rows. Deterministic corrupt/password/size failures do not auto-retry; transient process/provider failures retain capped retries and lease recovery.

Uploads remain capped at 200 MB and reconstructed text at 1,000,000 Unicode scalar values. Local upload storage is intentionally retained for local/single-host work; shared object storage remains mandatory before workers run on separate hosts.

## Quality evidence

`source_revisions.import_quality_report` records page classes, OCR/failed pages, excluded boilerplate counts, chapter confidence and stable warning codes. `source_pages` holds page-level warnings and full extraction evidence. Logs contain correlation/stage/outcome only—never document text.

Known limitations: no manual chapter editor, nested Reader hierarchy, table/figure semantics, mathematical layout recovery, vertical writing specialization, or reprocessing UI. Cross-revision semantic remapping is deferred until reprocessing exists; current identities are stable within an immutable source revision.
