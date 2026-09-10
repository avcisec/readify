import EPub from "epub";

export type FileSourceType = "pdf" | "epub";
export type ExtractedChapter = { title: string; text: string };

const MAX_FILE_BYTES = 200 * 1024 * 1024;

export function maxUploadBytes(): number {
  return MAX_FILE_BYTES;
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

export async function extractFile(
  bytes: Buffer,
  sourceType: FileSourceType,
): Promise<ExtractedChapter[]> {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_FILE_BYTES)
    throw new Error("file_too_large");
  if (sourceType === "pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: bytes });
    const parsed = await parser.getText();
    await parser.destroy();
    const pages = parsed.pages
      .map((page) => page.text.replace(/\r\n?/gu, "\n").trim())
      .filter(Boolean);
    if (!pages.length) throw new Error("file_no_extractable_text");
    return pages.map((text, index) => ({ title: `Sayfa ${index + 1}`, text }));
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
  return chapters;
}
