# Private PDF quality corpus

Do not commit copyrighted books. CI behavior fixtures are synthetic in `packages/platform/src/file-import.test.ts`; this directory defines the manual/public-domain acceptance corpus.

Prepare 8–12 small PDFs covering: native novel, short-story/graded-reader collection, outline/TOC, typographic headings without outline, two-column/illustrated layout, scanned pages, mixed native/scanned pages, repeated headers/footers, and difficult hyphenation/accents/dialogue.

For each local file create an untracked sibling `<name>.expected.json`:

```json
{
  "license": "public-domain or local-evaluation-only",
  "language": "fr",
  "chapters": [{ "title": "Expected title", "page": 3 }],
  "ocrPages": [7],
  "excludedHeaders": ["Book title"],
  "crossPageParagraph": "short expected excerpt",
  "preservedText": "« Où vas-tu ? »"
}
```

Acceptance records chapter precision/recall, paragraph-boundary sample accuracy, corrupted-character count, OCR page choice, and source-anchor page/bbox spot checks. Add a general heuristic only when multiple corpus files demonstrate the same failure; avoid publisher-specific rules without measured need.

The executable local-corpus command and ignored dataset layout are documented in [`extraction-benchmark-datasets/README.md`](../../../extraction-benchmark-datasets/README.md). The command exercises the same PyMuPDF and reconstruction functions as the worker; it is deliberately separate from fast CI because the private corpus is not available there.
