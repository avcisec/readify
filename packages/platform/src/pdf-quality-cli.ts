import { promises as fs } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { extractDocumentFromPath } from "./file-import";

type Expected = {
  language: string;
  chapters: Array<{ title: string; page: number }>;
  ocrPages: number[];
  excludedHeaders?: string[];
  crossPageParagraph?: string;
  preservedText?: string;
};

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("und").trim();
}

async function pdfFiles(input: string): Promise<string[]> {
  const stats = await fs.stat(input);
  if (stats.isFile())
    return extname(input).toLowerCase() === ".pdf" ? [input] : [];
  return (await fs.readdir(input, { withFileTypes: true }))
    .filter(
      (entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".pdf",
    )
    .map((entry) => resolve(input, entry.name))
    .sort();
}

async function evaluate(file: string) {
  const expectedPath = file.replace(/\.pdf$/iu, ".expected.json");
  const expected = JSON.parse(
    await fs.readFile(expectedPath, "utf8"),
  ) as Expected;
  const document = await extractDocumentFromPath(
    file,
    "pdf",
    expected.language,
  );
  const actualChapters = document.chapters.map((chapter) => ({
    title: chapter.title,
    page:
      chapter.anchors?.[0]?.pageNumber ?? chapter.pages?.[0]?.number ?? null,
  }));
  const unmatchedActual = new Set(actualChapters.map((_, index) => index));
  let matchedChapters = 0;
  for (const expectedChapter of expected.chapters) {
    const match = actualChapters.findIndex(
      (actual, index) =>
        unmatchedActual.has(index) &&
        normalize(actual.title) === normalize(expectedChapter.title) &&
        actual.page === expectedChapter.page,
    );
    if (match >= 0) {
      unmatchedActual.delete(match);
      matchedChapters += 1;
    }
  }
  const excludedHeaderSignatures = new Set(
    document.pages.flatMap((page) =>
      page.blocks.flatMap((block) =>
        (block.lines ?? [])
          .filter((line) =>
            new Set(["repeated_header", "repeated_footer"]).has(
              line.excludedReason ?? "",
            ),
          )
          .map((line) => normalize(line.text)),
      ),
    ),
  );
  const crossPageParagraph = expected.crossPageParagraph
    ? document.chapters.some((chapter) =>
        (chapter.paragraphs ?? []).some(
          (paragraph) =>
            paragraph.displayText.includes(expected.crossPageParagraph!) &&
            new Set(paragraph.anchors.map((anchor) => anchor.pageNumber)).size >
              1,
        ),
      )
    : true;
  const preservedText = expected.preservedText
    ? document.chapters.some((chapter) =>
        chapter.text.includes(expected.preservedText!),
      )
    : true;
  const expectedOcr = [...expected.ocrPages].sort((a, b) => a - b);
  const actualOcr = [...document.quality.ocrPages].sort((a, b) => a - b);
  const ocrPagesMatch =
    JSON.stringify(expectedOcr) === JSON.stringify(actualOcr);
  const headersMatch = (expected.excludedHeaders ?? []).every((header) =>
    excludedHeaderSignatures.has(normalize(header)),
  );
  const chapterPrecision = actualChapters.length
    ? matchedChapters / actualChapters.length
    : expected.chapters.length === 0
      ? 1
      : 0;
  const chapterRecall = expected.chapters.length
    ? matchedChapters / expected.chapters.length
    : 1;
  const failures = [
    chapterPrecision === 1 && chapterRecall === 1 ? null : "chapter_boundaries",
    ocrPagesMatch ? null : "ocr_page_selection",
    headersMatch ? null : "header_footer_exclusion",
    crossPageParagraph ? null : "cross_page_paragraph",
    preservedText ? null : "preserved_text",
  ].filter((failure): failure is string => Boolean(failure));
  return {
    file,
    passed: failures.length === 0,
    failures,
    chapterPrecision,
    chapterRecall,
    expectedChapterCount: expected.chapters.length,
    actualChapterCount: actualChapters.length,
    expectedOcrPages: expectedOcr,
    actualOcrPages: actualOcr,
    suspiciousPages: document.quality.suspiciousPages,
    failedPages: document.quality.failedPages,
    warnings: document.quality.warnings,
    versions: document.versions,
  };
}

async function main() {
  const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));
  const input = resolve(
    repositoryRoot,
    process.argv[2] ?? "extraction-benchmark-datasets/PDF",
  );
  const files = await pdfFiles(input);
  if (!files.length) throw new Error(`no_pdf_files:${input}`);
  const results = [];
  for (const file of files) results.push(await evaluate(file));
  const report = {
    generatedAt: new Date().toISOString(),
    passed: results.every((result) => result.passed),
    files: results,
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) process.exitCode = 1;
}

await main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "pdf_quality_evaluation_failed"}\n`,
  );
  process.exitCode = 1;
});
