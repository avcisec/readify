# Replace TXT upload with pasted-text import

- Status: Completed
- Date: 2026-09-01
- Source: product-owner decision in the current task

## Goal

Replace TXT file upload with a large plain-text paste/edit surface everywhere it is an active Readify product requirement, UX contract, first-slice acceptance criterion, architecture implication, or mechanical repository check.

## Scope

- Update `idea.md` and `FEATURES.md` so pasted text, not TXT files, is product truth.
- Rename and revise the first vertical-slice specification and every product-doc link to it.
- Revise import flows, screen states, wireframes, validation, duplicate behavior, fixtures, security boundaries, data flow, and storage wording where pasted text changes behavior.
- Keep EPUB, PDF, Markdown, subtitle, and other declared file-source security requirements intact.
- Preserve competitor research as historical evidence; record that the new product decision supersedes its TXT recommendation.
- Update mechanical product checks and run the full verification loop.

## Decisions used for the revision

- The import surface is a large multiline plain-text field that supports paste and direct editing.
- Rich clipboard formatting is discarded; paragraph breaks are retained.
- The first slice uses a visible provisional 50,000-character limit and counter. The value is a slice constraint and may be revised from measured processing/UX evidence.
- Empty/whitespace-only and over-limit content are blocked before submission; language mismatch requires explicit confirmation.
- The Library title is generated from the first non-empty line, truncated safely, with `İsimsiz metin` as fallback. Metadata editing remains outside the first slice.
- Duplicate detection is same-account and based on normalized pasted content; it must not reveal another account's content.
- Unsubmitted text remains in the field after recoverable submission errors but is not claimed to survive refresh, sign-out, or navigation.

## Non-goals

- No production application code, endpoint/schema design, provider selection, rich-text editor, document upload redesign, or change to raw competitor observations.
- No removal of file-upload security controls required by EPUB, PDF, Markdown, subtitle, audio, or future file sources.

## Acceptance criteria

- Active product and architecture documentation contains no Readify requirement for TXT file upload.
- The first slice describes a single large textarea and contains no filename, MIME, encoding, file picker, drag/drop, byte-size, or upload validation for pasted text.
- Product flow, screen inventory, wireframe, errors, responsive/accessibility behavior, fixtures, and backend implications agree.
- Historical research can still mention competitor TXT behavior without being mistaken for current Readify scope.
- `make product-check` and `make verify` pass, followed by a reviewer pass with no `BLOCKER` or `MAJOR` findings.

## Verification

```bash
make product-check
make verify
```

## Outcome

- Replaced TXT file upload in product truth with direct pasted-text creation through a large multiline field.
- Renamed and revised the first-slice product specification, including normalization, validation, duplicate detection, generated title, failure recovery, responsive/accessibility behavior, acceptance scenarios, fixture requirements, and backend implications.
- Updated product flows, screen inventory, wireframe, UX decisions, MVP scope/non-goals, security, data flow, storage, background-job wording, research interpretation, indexes, and the prior plan's live link.
- Preserved factual competitor TXT observations as historical evidence and added an explicit product-decision supersession notice.
- Strengthened `product-check` to require the pasted-text contract across source truth, UX, and the first-slice spec, and to reject restoration of the obsolete TXT spec file.

## Self-review

- The pasted-text path contains no filename, MIME, encoding, byte-size, file picker, drag/drop, or upload-validation dependency.
- EPUB/PDF/Markdown file-source validation, quarantine, and hostile-file controls remain intact.
- Rich clipboard formatting is discarded, pasted content is bounded/escaped, and no raw text is introduced into logs or metric labels.
- The provisional 50,000-character limit and Unicode counting rule are visible rather than hidden and remain an explicit production-acceptance blocker.
- No application code, endpoint, schema, provider, or unrelated architecture was added.

## Reviewer disposition

- **BLOCKER:** none.
- **MAJOR:** none.
- **MINOR:** the exact production character limit was not supplied by the product decision; retained as a provisional first-slice value with explicit validation/approval required before implementation acceptance.
- **PASS:** active product truth, UX, acceptance criteria, architecture implications, security rules, and mechanical checks consistently describe pasted text rather than TXT upload.

## Verification result

```text
make product-check  PASS
make verify         PASS
```
