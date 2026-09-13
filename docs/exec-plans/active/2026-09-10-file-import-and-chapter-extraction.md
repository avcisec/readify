# File import and chapter extraction

- Status: implementation complete; awaiting private PDF-corpus acceptance
- Date: 2026-09-10
- Scope owner: [Pasted-text Reader specification](../../product-specs/pasted-text-reader-learning-loop.md)

## Goal

Add a safe, asynchronous PDF/EPUB import path while preserving the existing pasted-text flow. The import screen presents Text, PDF, and EPUB source choices; ready file content is exposed as ordered chapters in the existing book index and opens the selected chapter in Reader.

## In scope

- Source selector for Text, PDF, and EPUB; existing pasted-text behavior remains unchanged.
- Multipart upload validation with bounded size, MIME/extension checks, and private ownership.
- Bounded extraction into ordered sections/chapters, followed by the existing asynchronous text preparation and language analysis stages.
- PDF page-aware sections and EPUB spine/document sections where reliable; deterministic fallback to one section when structure is unavailable.
- User-safe processing, retry, and parse-failure states.
- Contract, migration, unit/integration/API/E2E coverage and documentation updates.

## Out of scope

- Audiobook upload, playback, transcription, TTS, alignment, or synchronized audio.
- DRM bypass, remote URLs, bulk import, manual chapter editing, table/figure semantics, or metadata authoring.
- Production object-storage deployment; a storage port/local adapter may be introduced only as needed for bounded local verification.

## Safety and recovery

- Uploaded bytes are untrusted. Enforce byte limits before parsing, verify declared and detected type, reject encrypted/corrupt/unsupported files, and never execute embedded content.
- File bytes are retained through the configured local upload storage adapter and extraction runs as a durable `extract_file` job before text preparation. Production deployment must replace the local adapter with shared object storage before workers are distributed across hosts.
- Pasted TEXT remains limited to 50,000 Unicode scalar values; extracted PDF/EPUB text is limited to 1,000,000 Unicode scalar values.
- Failed extraction leaves no readable partial sections and exposes a safe reference plus retry only when classified transient.
- Existing pasted-text imports and old rows remain readable through additive migration.

## Acceptance

- User can choose Text, PDF, or EPUB in the import UI.
- Valid PDF/EPUB creates one private Library item and eventually an ordered chapter list; each ready chapter opens only its content in Reader.
- Invalid, oversized, encrypted, and unsupported files are rejected without partial state.
- Existing pasted-text critical flow remains green.
- Audiobook capability is explicitly deferred and does not alter this slice's public behavior.

## Verification

```bash
make verify
make e2e
pnpm build
git diff --check
```

## Decisions requiring confirmation

- Exact production upload quota and object-storage provider remain rollout decisions; the implementation uses a bounded local/test adapter and documents the limit.
- PyMuPDF native extraction is preferred when the CPU runtime in `scripts/requirements-pdf.txt` is installed; scanned pages are OCR candidates and remain diagnosable when Tesseract is unavailable.

## Implementation evidence

- PDF/EPUB source selector and multipart import route are implemented.
- PDF pages are retained as provenance entities; semantic chapter grouping no longer uses physical pages as the parent. Existing EPUB behavior remains unchanged for this PDF-only implementation.
- Canonical source asset/page metadata and optional Universal Dependencies-compatible token annotations are stored additively.
- PDF reconstruction now uses outline/typography/geometry before multilingual lexical hints, reconstructs paragraphs across pages, and preserves raw/display text plus multi-segment anchors.
- Migration `006_pdf_book_reconstruction` stores processor/config versions, page quality, deterministic semantic keys, canonical structure, quality reports, and source anchors.
- Page checkpoints are restart-safe and reused on retry; deterministic extraction failures no longer consume all retry attempts.
- Reader delivery is cursor-paged in 50-paragraph windows, opens around a saved semantic anchor, and no longer truncates long fallback chapters.
- Single-item deletion revokes access transactionally, rehomes shared vocabulary references, and purges account-scoped local source bytes through an idempotent worker job. Migration `007_content_deletion_indexes` prevents pathological foreign-key cascade scans.
- The Verify workflow installs the pinned PyMuPDF/Tesseract runtime and executes native-text plus selective-OCR smoke coverage. The ignored local corpus has an executable manifest-based acceptance command.
- Automated evidence covers story/long-book chapters, leaf-outline flattening, two columns, boilerplate, hyphenation, dialogue/accents, sentence anchors, stable IDs, real PostgreSQL persistence, token provenance, and retry deduplication.
- `make verify` and `pnpm build` pass. A generated native PDF and a generated scanned PDF passed the real PyMuPDF 1.26.4/Tesseract 5.3.4 smoke path; scanned-page OCR selected only page 1 and produced readable text.
- Browser regression: Chromium and Firefox passed 12/12. WebKit could not launch because this host lacks `libavif.so.16`; no WebKit test body ran, so the full `make e2e` gate remains infrastructure-blocked rather than waived.
- Audiobook attachment and alignment remain deferred.

## Remaining acceptance

- Run the local/private 8–12 PDF quality corpus described in `tests/fixtures/pdf/README.md` with the pinned PyMuPDF/Tesseract runtime.
- Review chapter boundaries, paragraph boundaries, preserved punctuation and sampled PDF bbox anchors. Record failures as corpus cases before adding heuristics.
- Push the feature branch, obtain green GitHub Verify/Browser/Documentation workflows and an independent review. Do not close this plan on local evidence alone.
