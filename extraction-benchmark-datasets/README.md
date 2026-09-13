# Local extraction quality corpus

This directory is intentionally ignored except for this guide. Never commit copyrighted or private books, expected excerpts, or generated reports.

Place PDF files under `PDF/`. Add a same-name manifest beside each file, for example `sample.pdf` + `sample.expected.json`:

```json
{
  "license": "public-domain or local-evaluation-only",
  "language": "fr",
  "chapters": [{ "title": "Chapitre I", "page": 3 }],
  "ocrPages": [7],
  "excludedHeaders": ["Book title"],
  "crossPageParagraph": "short exact excerpt crossing two pages",
  "preservedText": "« Où vas-tu ? »"
}
```

Run the production PyMuPDF → reconstruction path from the repository root:

```bash
PYTHON=.venv/bin/python pnpm --filter @readify/platform quality:pdf extraction-benchmark-datasets/PDF \
  > extraction-benchmark-datasets/pdf-quality-report.json
```

The command fails when any expected chapter boundary, OCR page, repeated header/footer, cross-page paragraph, or preserved-text sample does not match. Its JSON includes chapter precision/recall and processor versions. Review suspicious/failed pages and spot-check bbox anchors manually before accepting the corpus.

`EPUB/` and `plaintext/` remain reserved for later importer quality work; this command is PDF-only.
