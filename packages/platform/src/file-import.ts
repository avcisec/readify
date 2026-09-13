import EPub from "epub";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import {
  reconstructPdf,
  type ExtractedChapter,
  type PdfExtraction,
  type ReconstructedDocument,
  type SourcePage,
} from "./pdf-reconstruction";

export type {
  ExtractedChapter,
  ImportQualityReport,
  ReconstructedDocument,
  ReconstructedParagraph,
  SourceAnchor,
  SourcePage,
} from "./pdf-reconstruction";

export type FileSourceType = "pdf" | "epub";

const MAX_FILE_BYTES = 200 * 1024 * 1024;

function isPyMuPdfUnavailable(error: unknown): boolean {
  return (
    error instanceof Error &&
    (("code" in error && error.code === "ENOENT") ||
      error.message === "pdf_extractor_unavailable" ||
      /No module named ['"]fitz['"]|ModuleNotFoundError/iu.test(error.message))
  );
}

export function maxUploadBytes(): number {
  return MAX_FILE_BYTES;
}

async function extractPdfWithPyMuPDF(
  bytes: Buffer,
  language: string,
  onPage?: (page: SourcePage) => Promise<void>,
): Promise<ReconstructedDocument> {
  const path = join(tmpdir(), `readify-${randomUUID()}.pdf`);
  const scriptCandidates = [
    process.env.READIFY_PDF_EXTRACTOR,
    join(process.cwd(), "scripts", "extract_pdf.py"),
    resolve(process.cwd(), "../../scripts/extract_pdf.py"),
    fileURLToPath(new URL("../../../scripts/extract_pdf.py", import.meta.url)),
  ].filter((candidate): candidate is string => Boolean(candidate));
  const script = scriptCandidates.find((candidate) => existsSync(candidate));
  if (!script) throw new Error("pdf_extractor_unavailable");
  await fs.writeFile(path, bytes, { mode: 0o600 });
  try {
    const extraction = await extractPdfPathWithPyMuPDF(path, language, onPage);
    if (!Array.isArray(extraction.pages) || !extraction.pages.length)
      throw new Error("file_no_extractable_text");
    const document = reconstructPdf(extraction);
    if (!document.chapters.length) throw new Error("file_no_extractable_text");
    return document;
  } finally {
    await fs.rm(path, { force: true });
  }
}

async function extractPdfPathWithPyMuPDF(
  path: string,
  language: string,
  onPage?: (page: SourcePage) => Promise<void>,
  existingPages: SourcePage[] = [],
): Promise<PdfExtraction> {
  const scriptCandidates = [
    process.env.READIFY_PDF_EXTRACTOR,
    join(process.cwd(), "scripts", "extract_pdf.py"),
    resolve(process.cwd(), "../../scripts/extract_pdf.py"),
    fileURLToPath(new URL("../../../scripts/extract_pdf.py", import.meta.url)),
  ].filter((candidate): candidate is string => Boolean(candidate));
  const script = scriptCandidates.find((candidate) => existsSync(candidate));
  if (!script) throw new Error("pdf_extractor_unavailable");
  const child = spawn(
    /* turbopackIgnore: true */
    process.env.PYTHON ?? "python3",
    [
      script,
      path,
      language,
      existingPages.map((page) => page.number).join(","),
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  let stderr = "";
  child.stderr.on("data", (chunk: Buffer) => {
    if (Buffer.byteLength(stderr) < 16_384) stderr += chunk.toString();
  });
  const timeout = setTimeout(() => child.kill("SIGKILL"), 10 * 60_000);
  const close = once(child, "close") as Promise<[number | null]>;
  let header: Omit<PdfExtraction, "pages"> | undefined;
  const pages: SourcePage[] = [...existingPages];
  let totalBytes = 0;
  try {
    const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
    for await (const line of lines) {
      totalBytes += Buffer.byteLength(line);
      if (totalBytes > 64 * 1024 * 1024) {
        child.kill("SIGKILL");
        throw new Error("pdf_extractor_response_too_large");
      }
      const event = JSON.parse(line) as
        | ({ type: "document" } & Omit<PdfExtraction, "pages">)
        | { type: "page"; page: SourcePage }
        | { type: "complete" };
      if (event.type === "document") {
        header = {
          outline: event.outline,
          extractor: event.extractor,
          metadata: event.metadata,
        };
      } else if (event.type === "page") {
        pages.push(event.page);
        await onPage?.(event.page);
      }
    }
    const [code] = await close;
    if (code !== 0) throw new Error(stderr.trim() || "pdf_extractor_failed");
    if (!header) throw new Error("pdf_extractor_invalid_response");
    return { ...header, pages: pages.sort((a, b) => a.number - b.number) };
  } catch (error) {
    if (!child.killed) child.kill("SIGKILL");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function cleanHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<\/p\s*>/giu, "\n\n")
    .replace(/<[^>]+>/gu, "")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

export async function extractDocument(
  bytes: Buffer,
  sourceType: FileSourceType,
  language = "und",
): Promise<ReconstructedDocument> {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_FILE_BYTES)
    throw new Error("file_too_large");
  if (sourceType === "pdf") {
    try {
      return await extractPdfWithPyMuPDF(bytes, language);
    } catch (error) {
      // A missing optional Python runtime/dependency falls back to the bounded JS parser.
      if (!isPyMuPdfUnavailable(error)) throw error;
    }
    const { PDFParse } = await import("pdf-parse");
    if (!(globalThis as { pdfjsWorker?: unknown }).pdfjsWorker)
      (globalThis as { pdfjsWorker?: unknown }).pdfjsWorker = await import(
        "pdfjs-dist/legacy/build/pdf.worker.mjs" as string
      );
    const parser = new PDFParse({ data: bytes });
    const parsed = await parser.getText();
    await parser.destroy();
    const pages = parsed.pages
      .map((page) => page.text.replace(/\r\n?/gu, "\n").trim())
      .filter(Boolean);
    if (!pages.length) throw new Error("file_no_extractable_text");
    const sourcePages = pages.map((text, index) => ({
      number: index + 1,
      rawText: text,
      text,
      qualityStatus: "native_suspicious" as const,
      qualityScore: 0.5,
      warnings: ["fallback_extractor_no_geometry"],
      blocks: [{ id: `p${index + 1}:b0`, text, order: 0 }],
    }));
    return reconstructPdf({
      pages: sourcePages,
      outline: [],
      extractor: { name: "pdf-parse-fallback", version: "2.4.5" },
    });
  }
  const epub = new EPub(bytes);
  await epub.parse();
  if (epub.hasDRM()) throw new Error("file_drm_unsupported");
  const chapters: ExtractedChapter[] = [];
  for (const [index, item] of epub.flow.entries()) {
    const text = cleanHtml(await epub.getChapter(item.id));
    if (text)
      chapters.push({
        title: String(item.title || `Bölüm ${index + 1}`),
        text,
      });
  }
  if (!chapters.length) throw new Error("file_no_extractable_text");
  return {
    chapters,
    pages: [],
    metadata: {},
    quality: {
      pageCount: 0,
      nativeGoodPages: [],
      suspiciousPages: [],
      ocrPages: [],
      failedPages: [],
      excludedHeaderFooterLines: 0,
      excludedPageNumbers: 0,
      excludedTocLines: 0,
      chapterConfidence: 1,
      warnings: [],
    },
    versions: {
      extraction: "epub@2.1.1",
      reconstruction: "epub-spine-v1",
      configuration: "epub-spine-v1",
    },
  };
}

export async function extractDocumentFromPath(
  path: string,
  sourceType: FileSourceType,
  language = "und",
  onPage?: (page: SourcePage) => Promise<void>,
  existingPages: SourcePage[] = [],
): Promise<ReconstructedDocument> {
  const stats = await fs.stat(path);
  if (stats.size === 0 || stats.size > MAX_FILE_BYTES)
    throw new Error("file_too_large");
  if (sourceType !== "pdf")
    return extractDocument(await fs.readFile(path), sourceType, language);
  try {
    const extraction = await extractPdfPathWithPyMuPDF(
      path,
      language,
      onPage,
      existingPages,
    );
    const document = reconstructPdf(extraction);
    if (!document.chapters.length) throw new Error("file_no_extractable_text");
    return document;
  } catch (error) {
    if (!isPyMuPdfUnavailable(error)) throw error;
    return extractDocument(await fs.readFile(path), sourceType, language);
  }
}
