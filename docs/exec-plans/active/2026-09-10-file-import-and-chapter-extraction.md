# File import and chapter extraction

- Status: planned
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
- OCR for scanned PDFs, complex layout reconstruction, DRM bypass, remote URLs, bulk import, editing, or metadata authoring.
- Production object-storage deployment; a storage port/local adapter may be introduced only as needed for bounded local verification.

## Safety and recovery

- Uploaded bytes are untrusted. Enforce byte limits before parsing, verify declared and detected type, reject encrypted/corrupt/unsupported files, and never execute embedded content.
- The current bounded 200 MB implementation performs extraction before creating the durable workflow so the existing database-backed worker can reuse the normalized chapter text. Moving raw-byte retention and extraction itself behind the worker is a follow-up hardening step before production-scale uploads.
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
- Whether scanned PDF OCR is needed remains deferred; this slice rejects PDFs without extractable text.

## Implementation evidence

- PDF/EPUB source selector and multipart import route are implemented.
- PDF pages and EPUB spine entries become ordered Reader sections; existing pasted text remains a single section.
- `make verify`, `pnpm build`, and Chromium critical E2E (6 tests) pass locally.
- Audiobook attachment, raw-byte durable storage, and worker-side extraction remain follow-up work before production-scale file uploads.
