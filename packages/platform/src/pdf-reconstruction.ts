import { createHash } from "node:crypto";

export type BBox = [number, number, number, number];

export type SourceSpan = {
  id: string;
  text: string;
  bbox?: BBox;
  font?: string;
  size?: number;
  flags?: number;
  sourceStartScalar?: number;
  sourceEndScalar?: number;
};

export type SourceLine = {
  id: string;
  text: string;
  bbox?: BBox;
  spans?: SourceSpan[];
  sourceStartScalar?: number;
  sourceEndScalar?: number;
  excludedReason?:
    | "repeated_header"
    | "repeated_footer"
    | "page_number"
    | "toc"
    | "chapter_heading";
};

export type SourceBlock = {
  id: string;
  text: string;
  bbox?: BBox;
  order?: number;
  lines?: SourceLine[];
};

export type SourceWord = {
  id: string;
  text: string;
  bbox?: BBox;
  blockId?: string;
  lineId?: string;
  order: number;
};

export type PageQualityStatus =
  "native_good" | "native_suspicious" | "ocr_required" | "failed";

export type SourcePage = {
  number: number;
  width?: number;
  height?: number;
  rotation?: number;
  rawText?: string;
  text: string;
  ocr?: boolean;
  qualityStatus?: PageQualityStatus;
  qualityScore?: number;
  warnings?: string[];
  blocks: SourceBlock[];
  words?: SourceWord[];
};

export type PdfOutlineEntry = {
  level: number;
  title: string;
  pageNumber: number;
};

export type PdfExtraction = {
  pages: SourcePage[];
  outline: PdfOutlineEntry[];
  metadata?: { title?: string; author?: string };
  extractor: {
    name: string;
    version: string;
    ocrEngine?: { name: string; version: string | null } | null;
    configuration?: Record<string, unknown>;
  };
};

export type SourceAnchor = {
  pageNumber: number;
  sourceStartScalar: number;
  sourceEndScalar: number;
  displayStartScalar: number;
  displayEndScalar: number;
  bbox?: BBox;
  blockId?: string;
  lineId?: string;
  wordIds?: string[];
};

export type ReconstructedParagraph = {
  sourceText: string;
  displayText: string;
  anchors: SourceAnchor[];
  role?: "body" | "dialogue" | "list" | "footnote";
};

export type ExtractedChapter = {
  title: string;
  text: string;
  sourceText?: string;
  role?: "body" | "front_matter" | "back_matter";
  headingPath?: string[];
  confidence?: number;
  paragraphs?: ReconstructedParagraph[];
  pages?: SourcePage[];
  anchors?: SourceAnchor[];
};

export type ImportQualityReport = {
  pageCount: number;
  nativeGoodPages: number[];
  suspiciousPages: number[];
  ocrPages: number[];
  failedPages: number[];
  excludedHeaderFooterLines: number;
  excludedPageNumbers: number;
  excludedTocLines: number;
  chapterConfidence: number;
  warnings: string[];
};

export type ReconstructedDocument = {
  chapters: ExtractedChapter[];
  pages: SourcePage[];
  metadata: { title?: string; author?: string };
  quality: ImportQualityReport;
  versions: {
    extraction: string;
    reconstruction: string;
    configuration: string;
  };
};

export const PDF_RECONSTRUCTION_VERSION = "2.0.0";

type LineUnit = {
  page: SourcePage;
  block: SourceBlock;
  line: SourceLine;
  blockIndex: number;
  lineIndex: number;
};

type BlockUnit = {
  page: SourcePage;
  block: SourceBlock;
  lines: LineUnit[];
  globalIndex: number;
};

type HeadingCandidate = {
  blockIndex: number;
  title: string;
  score: number;
  kind: "part" | "chapter" | "heading";
  headingPath: string[];
};

const HEADING_WORDS =
  /^(?:chapter|chapitre|cap[ií]tulo|kapitel|hoofdstuk|capitolo|rozdział|bölüm|part|partie|parte|livre|book|story|histoire|conte)(?:\s+|$)/iu;
const PART_WORDS = /^(?:part|partie|parte|livre|book)(?:\s+|$)/iu;
const TERMINAL_PUNCTUATION = /[.!?…][\]”’»)]*$/u;
const DIALOGUE_START = /^(?:[—–-]\s+|[«“"])/u;
const LIST_START = /^(?:[•◦▪]|\d+[.)]|[a-z][.)])\s+/iu;

function scalars(value: string): number {
  return [...value].length;
}

function normalizedSignature(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("und")
    .replace(/\d+/gu, "#")
    .replace(/\s+/gu, " ")
    .trim();
}

function isPageNumber(value: string): boolean {
  return /^(?:[-–—]\s*)?(?:\d{1,4}|[ivxlcdm]{1,10})(?:\s*[-–—])?$/iu.test(
    value.trim(),
  );
}

function syntheticLines(
  page: SourcePage,
  block: SourceBlock,
  sourceBase = 0,
): SourceLine[] {
  let cursor = sourceBase;
  return block.text.split(/\r?\n/gu).map((text, index) => {
    const start = cursor;
    cursor += scalars(text) + 1;
    return {
      id: `${block.id || `b${index}`}:l${index}`,
      text,
      bbox: block.bbox,
      sourceStartScalar: start,
      sourceEndScalar: start + scalars(text),
    };
  });
}

function pageBlocks(page: SourcePage): SourceBlock[] {
  if (page.blocks.length) return page.blocks;
  return page.text
    .split(/\n\s*\n/gu)
    .filter((text) => text.trim())
    .map((text, index) => ({ id: `p${page.number}:b${index}`, text }));
}

function orderedBlocks(page: SourcePage): SourceBlock[] {
  const blocks = pageBlocks(page);
  const positioned = blocks.filter((block) => block.bbox?.length === 4);
  if (positioned.length < 4 || !page.width)
    return [...blocks].sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) -
        (b.order ?? Number.MAX_SAFE_INTEGER),
    );

  const narrow = positioned.filter(
    (block) => (block.bbox![2] - block.bbox![0]) / page.width! < 0.62,
  );
  const left = narrow.filter(
    (block) => (block.bbox![0] + block.bbox![2]) / 2 < page.width! * 0.48,
  );
  const right = narrow.filter(
    (block) => (block.bbox![0] + block.bbox![2]) / 2 > page.width! * 0.52,
  );
  const isTwoColumn = left.length >= 2 && right.length >= 2;
  return [...blocks].sort((a, b) => {
    if (!a.bbox || !b.bbox) return (a.order ?? 0) - (b.order ?? 0);
    if (isTwoColumn) {
      const aColumn = (a.bbox[0] + a.bbox[2]) / 2 < page.width! / 2 ? 0 : 1;
      const bColumn = (b.bbox[0] + b.bbox[2]) / 2 < page.width! / 2 ? 0 : 1;
      if (aColumn !== bColumn) return aColumn - bColumn;
    }
    return a.bbox[1] - b.bbox[1] || a.bbox[0] - b.bbox[0];
  });
}

function collectUnits(pages: SourcePage[]): BlockUnit[] {
  const result: BlockUnit[] = [];
  for (const page of [...pages].sort((a, b) => a.number - b.number)) {
    const rawText = page.rawText ?? page.text;
    let utf16Cursor = 0;
    for (const [blockIndex, block] of orderedBlocks(page).entries()) {
      const foundAt = rawText.indexOf(block.text, utf16Cursor);
      const sourceBase = foundAt >= 0 ? scalars(rawText.slice(0, foundAt)) : 0;
      if (foundAt >= 0) utf16Cursor = foundAt + block.text.length;
      const lines = (
        block.lines?.length
          ? block.lines
          : syntheticLines(page, block, sourceBase)
      ).map((line, lineIndex) => ({
        page,
        block,
        line,
        blockIndex,
        lineIndex,
      }));
      result.push({ page, block, lines, globalIndex: result.length });
    }
  }
  return result;
}

function markBoilerplate(units: BlockUnit[], pageCount: number): void {
  const candidates = new Map<
    string,
    Array<{ line: SourceLine; pageNumber: number; edge: "header" | "footer" }>
  >();
  for (const unit of units) {
    for (const entry of unit.lines) {
      const value = entry.line.text.trim();
      if (!value) continue;
      if (isPageNumber(value)) {
        entry.line.excludedReason = "page_number";
        continue;
      }
      const y0 = entry.line.bbox?.[1];
      const y1 = entry.line.bbox?.[3];
      const height = entry.page.height;
      const edge =
        height && y0 !== undefined && y0 <= height * 0.13
          ? "header"
          : height && y1 !== undefined && y1 >= height * 0.87
            ? "footer"
            : entry.lineIndex === 0 && entry.blockIndex === 0
              ? "header"
              : undefined;
      if (!edge || value.length > 160) continue;
      const signature = `${edge}:${normalizedSignature(value)}`;
      if (!signature.endsWith(":")) {
        const values = candidates.get(signature) ?? [];
        values.push({ line: entry.line, pageNumber: entry.page.number, edge });
        candidates.set(signature, values);
      }
    }
  }
  const minimum = Math.max(2, Math.ceil(pageCount * 0.35));
  for (const entries of candidates.values()) {
    const distinctPages = new Set(entries.map((entry) => entry.pageNumber));
    const odd = new Set(
      entries
        .filter((entry) => entry.pageNumber % 2 === 1)
        .map((entry) => entry.pageNumber),
    );
    const even = new Set(
      entries
        .filter((entry) => entry.pageNumber % 2 === 0)
        .map((entry) => entry.pageNumber),
    );
    const parityRepeat = odd.size >= 2 || even.size >= 2;
    if (distinctPages.size < minimum && !parityRepeat) continue;
    for (const entry of entries)
      entry.line.excludedReason =
        entry.edge === "header" ? "repeated_header" : "repeated_footer";
  }
}

function isTocLine(value: string): boolean {
  return /\.{2,}\s*(?:\d+|[ivxlcdm]+)\s*$/iu.test(value.trim());
}

function bodyFontSize(units: BlockUnit[]): number {
  const sizes = units.flatMap((unit) =>
    unit.lines.flatMap((entry) =>
      (entry.line.spans ?? [])
        .filter((span) => scalars(span.text.trim()) >= 3 && span.size)
        .flatMap((span) =>
          Array(Math.min(20, scalars(span.text))).fill(span.size!),
        ),
    ),
  );
  if (!sizes.length) return 0;
  sizes.sort((a, b) => a - b);
  return sizes[Math.floor(sizes.length / 2)] ?? 0;
}

function blockStyle(unit: BlockUnit): {
  maxSize: number;
  bold: boolean;
  text: string;
} {
  const spans = unit.lines.flatMap((line) => line.line.spans ?? []);
  return {
    maxSize: Math.max(0, ...spans.map((span) => span.size ?? 0)),
    bold: spans.some(
      (span) =>
        /bold|black|heavy|semibold/iu.test(span.font ?? "") ||
        Boolean((span.flags ?? 0) & 16),
    ),
    text: unit.lines
      .filter((entry) => !entry.line.excludedReason)
      .map((entry) => entry.line.text.trim())
      .filter(Boolean)
      .join(" "),
  };
}

function headingKind(text: string): HeadingCandidate["kind"] {
  if (PART_WORDS.test(text)) return "part";
  if (HEADING_WORDS.test(text)) return "chapter";
  return "heading";
}

function typographyCandidates(units: BlockUnit[]): HeadingCandidate[] {
  const bodySize = bodyFontSize(units);
  const provisional = units.map((unit) => {
    const style = blockStyle(unit);
    const trimmed = style.text.trim();
    const short = scalars(trimmed) >= 2 && scalars(trimmed) <= 140;
    const lexical = HEADING_WORDS.test(trimmed);
    const large = bodySize > 0 && style.maxSize >= bodySize * 1.22;
    const capitalized =
      trimmed === trimmed.toLocaleUpperCase("und") ||
      /^\p{Lu}[\p{L}\p{M}\d'’“”«»():,\-–— ]+$/u.test(trimmed);
    const standalone =
      unit.lines.filter((line) => line.line.text.trim()).length <= 3;
    const proseLike = TERMINAL_PUNCTUATION.test(trimmed) && !lexical;
    const styleKey = `${Math.round(style.maxSize * 2) / 2}:${style.bold}`;
    return {
      unit,
      style,
      trimmed,
      short,
      lexical,
      large,
      capitalized,
      standalone,
      proseLike,
      styleKey,
    };
  });
  const styleCounts = new Map<string, number>();
  for (const item of provisional)
    if (item.short && item.standalone && (item.large || item.style.bold))
      styleCounts.set(item.styleKey, (styleCounts.get(item.styleKey) ?? 0) + 1);

  return provisional.flatMap((item) => {
    if (
      !item.short ||
      !item.standalone ||
      item.proseLike ||
      isTocLine(item.trimmed)
    )
      return [];
    let score = 0;
    if (item.lexical) score += 0.55;
    if (item.large) score += 0.28;
    if (item.style.bold) score += 0.14;
    if (item.capitalized) score += 0.08;
    if ((styleCounts.get(item.styleKey) ?? 0) >= 2) score += 0.15;
    if (score < 0.5) return [];
    return [
      {
        blockIndex: item.unit.globalIndex,
        title: item.trimmed,
        score: Math.min(1, score),
        kind: headingKind(item.trimmed),
        headingPath: [],
      },
    ];
  });
}

function selectedOutline(outline: PdfOutlineEntry[]): PdfOutlineEntry[] {
  const valid = outline.filter(
    (entry) =>
      entry.pageNumber > 0 && entry.title.trim() && !isTocLine(entry.title),
  );
  if (valid.length <= 1) return valid;
  const counts = new Map<number, number>();
  for (const entry of valid)
    counts.set(entry.level, (counts.get(entry.level) ?? 0) + 1);
  const selectedLevel = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0];
  return selectedLevel
    ? valid.filter((entry) => entry.level === selectedLevel)
    : valid;
}

function outlineCandidates(
  outline: PdfOutlineEntry[],
  units: BlockUnit[],
): HeadingCandidate[] {
  return selectedOutline(outline).flatMap((entry) => {
    const pageUnits = units.filter(
      (unit) => unit.page.number >= entry.pageNumber,
    );
    if (!pageUnits.length) return [];
    const exact = pageUnits.find(
      (unit) =>
        normalizedSignature(blockStyle(unit).text) ===
        normalizedSignature(entry.title),
    );
    return [
      {
        blockIndex: (exact ?? pageUnits[0]!).globalIndex,
        title: entry.title.trim(),
        score: exact ? 1 : 0.9,
        kind: headingKind(entry.title),
        headingPath: outline
          .slice(0, outline.indexOf(entry))
          .filter((parent) => parent.level < entry.level)
          .filter(
            (parent, index, parents) =>
              !parents
                .slice(index + 1)
                .some((later) => later.level <= parent.level),
          )
          .map((parent) => parent.title.trim()),
      },
    ];
  });
}

function anchorForLine(entry: LineUnit): SourceAnchor {
  const textLength = scalars(entry.line.text);
  return {
    pageNumber: entry.page.number,
    sourceStartScalar: entry.line.sourceStartScalar ?? 0,
    sourceEndScalar: entry.line.sourceEndScalar ?? textLength,
    displayStartScalar: 0,
    displayEndScalar: textLength,
    bbox: entry.line.bbox ?? entry.block.bbox,
    blockId: entry.block.id,
    lineId: entry.line.id,
    wordIds: entry.page.words
      ?.filter((word) => word.lineId === entry.line.id)
      .map((word) => word.id),
  };
}

function appendDisplay(
  current: string,
  next: string,
): { text: string; inserted: number; removedFromCurrent: number } {
  const left = current.trimEnd();
  const right = next.trim();
  if (!left) return { text: right, inserted: 0, removedFromCurrent: 0 };
  if (!right) return { text: left, inserted: 0, removedFromCurrent: 0 };
  if (/\p{L}[-\u00ad]$/u.test(left) && /^\p{Ll}/u.test(right))
    return {
      text: `${left.slice(0, -1)}${right}`,
      inserted: 0,
      removedFromCurrent: 1,
    };
  if (/^[,.;:!?…%)\]»]/u.test(right))
    return { text: `${left}${right}`, inserted: 0, removedFromCurrent: 0 };
  return { text: `${left} ${right}`, inserted: 1, removedFromCurrent: 0 };
}

function paragraphFromLines(
  lines: LineUnit[],
  bodySize: number,
): ReconstructedParagraph | null {
  const included = lines.filter(
    (entry) => entry.line.text.trim() && !entry.line.excludedReason,
  );
  if (!included.length) return null;
  let displayText = "";
  const sourceText = included.map((entry) => entry.line.text).join("\n");
  const anchors: SourceAnchor[] = [];
  for (const entry of included) {
    const value = entry.line.text.normalize("NFC").trim();
    if (!value) continue;
    const joined = appendDisplay(displayText, value);
    const start = Math.max(
      0,
      scalars(displayText) - joined.removedFromCurrent + joined.inserted,
    );
    if (joined.removedFromCurrent && anchors.length) {
      const previous = anchors.at(-1)!;
      previous.displayEndScalar = Math.max(
        previous.displayStartScalar,
        previous.displayEndScalar - joined.removedFromCurrent,
      );
    }
    displayText = joined.text;
    const anchor = anchorForLine(entry);
    anchor.displayStartScalar = start;
    anchor.displayEndScalar = scalars(displayText);
    anchors.push(anchor);
  }
  const firstText = included[0]!.line.text.trim();
  const maximumSize = Math.max(0, ...included.map(lineFontSize));
  const nearPageBottom = included.every(
    (entry) =>
      !entry.page.height ||
      !entry.line.bbox ||
      entry.line.bbox[1] >= entry.page.height * 0.72,
  );
  const role =
    bodySize > 0 &&
    maximumSize > 0 &&
    maximumSize <= bodySize * 0.82 &&
    nearPageBottom
      ? "footnote"
      : LIST_START.test(firstText)
        ? "list"
        : DIALOGUE_START.test(firstText)
          ? "dialogue"
          : "body";
  return { sourceText, displayText, anchors, role };
}

function lineFontSize(entry: LineUnit): number {
  return Math.max(0, ...(entry.line.spans ?? []).map((span) => span.size ?? 0));
}

function startsNewParagraph(previous: LineUnit, current: LineUnit): boolean {
  const currentText = current.line.text.trim();
  if (DIALOGUE_START.test(currentText) || LIST_START.test(currentText))
    return true;
  if (previous.line.bbox && current.line.bbox) {
    const previousHeight = Math.max(
      1,
      previous.line.bbox[3] - previous.line.bbox[1],
    );
    const verticalGap = current.line.bbox[1] - previous.line.bbox[3];
    if (verticalGap > previousHeight * 0.75) return true;
    const indent = current.line.bbox[0] - previous.line.bbox[0];
    if (indent > 10 && TERMINAL_PUNCTUATION.test(previous.line.text.trim()))
      return true;
  }
  const previousSize = lineFontSize(previous);
  const currentSize = lineFontSize(current);
  return (
    previousSize > 0 &&
    currentSize > 0 &&
    Math.max(previousSize, currentSize) / Math.min(previousSize, currentSize) >
      1.25
  );
}

function splitBlockParagraphs(unit: BlockUnit): LineUnit[][] {
  const included = unit.lines.filter(
    (entry) => entry.line.text.trim() && !entry.line.excludedReason,
  );
  const groups: LineUnit[][] = [];
  for (const entry of included) {
    const current = groups.at(-1);
    if (current?.length && startsNewParagraph(current.at(-1)!, entry))
      groups.push([entry]);
    else if (current) current.push(entry);
    else groups.push([entry]);
  }
  return groups;
}

function shouldMergeAcrossPage(
  previous: ReconstructedParagraph,
  current: ReconstructedParagraph,
): boolean {
  const previousPage = previous.anchors.at(-1)?.pageNumber;
  const currentPage = current.anchors[0]?.pageNumber;
  if (!previousPage || !currentPage || previousPage === currentPage)
    return false;
  if (TERMINAL_PUNCTUATION.test(previous.displayText)) return false;
  if (
    DIALOGUE_START.test(current.displayText) ||
    LIST_START.test(current.displayText)
  )
    return false;
  return (
    /^\p{Ll}/u.test(current.displayText) ||
    /[-\u00ad]$/u.test(previous.displayText)
  );
}

function mergeParagraphs(
  previous: ReconstructedParagraph,
  current: ReconstructedParagraph,
): ReconstructedParagraph {
  const joined = appendDisplay(previous.displayText, current.displayText);
  const shift =
    scalars(previous.displayText) - joined.removedFromCurrent + joined.inserted;
  const previousAnchors = previous.anchors.map((anchor) => ({ ...anchor }));
  if (joined.removedFromCurrent && previousAnchors.length) {
    const last = previousAnchors.at(-1)!;
    last.displayEndScalar = Math.max(
      last.displayStartScalar,
      last.displayEndScalar - joined.removedFromCurrent,
    );
  }
  return {
    sourceText: `${previous.sourceText}\n${current.sourceText}`,
    displayText: joined.text,
    anchors: [
      ...previousAnchors,
      ...current.anchors.map((anchor) => ({
        ...anchor,
        displayStartScalar: anchor.displayStartScalar + shift,
        displayEndScalar: anchor.displayEndScalar + shift,
      })),
    ],
  };
}

function paragraphsForRange(
  units: BlockUnit[],
  start: number,
  end: number,
  headingIndex?: number,
): ReconstructedParagraph[] {
  const paragraphs: ReconstructedParagraph[] = [];
  const bodySize = bodyFontSize(units);
  for (const unit of units.slice(start, end)) {
    if (unit.globalIndex === headingIndex) continue;
    for (const lines of splitBlockParagraphs(unit)) {
      const paragraph = paragraphFromLines(lines, bodySize);
      if (!paragraph || isTocLine(paragraph.displayText)) continue;
      const previous = paragraphs.at(-1);
      if (previous && shouldMergeAcrossPage(previous, paragraph))
        paragraphs[paragraphs.length - 1] = mergeParagraphs(
          previous,
          paragraph,
        );
      else paragraphs.push(paragraph);
    }
  }
  return paragraphs;
}

function chapterAnchors(paragraphs: ReconstructedParagraph[]): SourceAnchor[] {
  let offset = 0;
  return paragraphs.flatMap((paragraph, index) => {
    const shifted = paragraph.anchors.map((anchor) => ({
      ...anchor,
      displayStartScalar: anchor.displayStartScalar + offset,
      displayEndScalar: anchor.displayEndScalar + offset,
    }));
    offset +=
      scalars(paragraph.displayText) + (index < paragraphs.length - 1 ? 2 : 0);
    return shifted;
  });
}

export function stableSemanticId(
  prefix: "sec" | "par" | "sen" | "occ" | "page" | "anchor",
  ...parts: Array<string | number>
): string {
  const digest = createHash("sha256")
    .update(parts.map(String).join("\u001f"))
    .digest("hex")
    .slice(0, 32);
  return `${prefix}_${digest}`;
}

export function sliceSourceAnchors(
  anchors: SourceAnchor[],
  startScalar: number,
  endScalar: number,
): SourceAnchor[] {
  return anchors.flatMap((anchor) => {
    const start = Math.max(startScalar, anchor.displayStartScalar);
    const end = Math.min(endScalar, anchor.displayEndScalar);
    if (end <= start) return [];
    const displayLength = Math.max(
      1,
      anchor.displayEndScalar - anchor.displayStartScalar,
    );
    const sourceLength = anchor.sourceEndScalar - anchor.sourceStartScalar;
    const relativeStart = start - anchor.displayStartScalar;
    const relativeEnd = end - anchor.displayStartScalar;
    return [
      {
        ...anchor,
        sourceStartScalar:
          anchor.sourceStartScalar +
          Math.floor((relativeStart / displayLength) * sourceLength),
        sourceEndScalar:
          anchor.sourceStartScalar +
          Math.ceil((relativeEnd / displayLength) * sourceLength),
        displayStartScalar: start - startScalar,
        displayEndScalar: end - startScalar,
      },
    ];
  });
}

export function segmentSentences(
  paragraph: ReconstructedParagraph,
  language = "und",
): Array<{
  text: string;
  startScalar: number;
  endScalar: number;
  anchors: SourceAnchor[];
}> {
  const segments: Array<{ segment: string; index: number }> = [];
  try {
    const segmenter = new Intl.Segmenter(language, { granularity: "sentence" });
    for (const item of segmenter.segment(paragraph.displayText))
      segments.push({ segment: item.segment, index: item.index });
  } catch {
    for (const match of paragraph.displayText.matchAll(
      /[^.!?…]+(?:[.!?…]+|$)/gu,
    ))
      segments.push({ segment: match[0], index: match.index });
  }
  return segments
    .filter((item) => item.segment.length > 0)
    .map((item) => {
      const startScalar = scalars(paragraph.displayText.slice(0, item.index));
      const endScalar = startScalar + scalars(item.segment);
      return {
        text: item.segment,
        startScalar,
        endScalar,
        anchors: sliceSourceAnchors(paragraph.anchors, startScalar, endScalar),
      };
    });
}

export function reconstructPdf(
  extraction: PdfExtraction,
): ReconstructedDocument {
  const pages = extraction.pages.map((page) => ({
    ...page,
    blocks: page.blocks.map((block, blockIndex) => ({
      ...block,
      id: block.id || `p${page.number}:b${blockIndex}`,
      lines: block.lines?.map((line, lineIndex) => ({
        ...line,
        id: line.id || `p${page.number}:b${blockIndex}:l${lineIndex}`,
      })),
    })),
  }));
  const units = collectUnits(pages);
  markBoilerplate(units, pages.length);
  for (const unit of units)
    for (const line of unit.lines)
      if (isTocLine(line.line.text)) line.line.excludedReason = "toc";

  const fromOutline = outlineCandidates(extraction.outline, units);
  const detected = fromOutline.length
    ? fromOutline
    : typographyCandidates(units);
  let candidates = detected;
  const hasLeafChapters = candidates.some(
    (candidate) => candidate.kind !== "part",
  );
  if (hasLeafChapters)
    candidates = candidates
      .filter((candidate) => candidate.kind !== "part")
      .map((candidate) => {
        if (candidate.headingPath.length) return candidate;
        const parent = detected
          .filter(
            (entry) =>
              entry.kind === "part" && entry.blockIndex < candidate.blockIndex,
          )
          .at(-1);
        return {
          ...candidate,
          headingPath: parent ? [parent.title] : [],
        };
      });
  candidates = candidates
    .filter(
      (candidate, index, all) =>
        all.findIndex((entry) => entry.blockIndex === candidate.blockIndex) ===
        index,
    )
    .sort((a, b) => a.blockIndex - b.blockIndex);

  const chapters: ExtractedChapter[] = [];
  if (!candidates.length) {
    const paragraphs = paragraphsForRange(units, 0, units.length);
    if (paragraphs.length)
      chapters.push({
        title: "Bölüm 1",
        text: paragraphs.map((paragraph) => paragraph.displayText).join("\n\n"),
        sourceText: paragraphs
          .map((paragraph) => paragraph.sourceText)
          .join("\n\n"),
        role: "body",
        headingPath: [],
        confidence: 0.25,
        paragraphs,
        pages: pages.filter((page) =>
          paragraphs.some((paragraph) =>
            paragraph.anchors.some(
              (anchor) => anchor.pageNumber === page.number,
            ),
          ),
        ),
        anchors: chapterAnchors(paragraphs),
      });
  } else {
    for (const candidate of candidates)
      for (const line of units[candidate.blockIndex]?.lines ?? [])
        if (!line.line.excludedReason)
          line.line.excludedReason = "chapter_heading";
    for (const [index, candidate] of candidates.entries()) {
      const end = candidates[index + 1]?.blockIndex ?? units.length;
      const paragraphs = paragraphsForRange(
        units,
        candidate.blockIndex,
        end,
        candidate.blockIndex,
      );
      if (!paragraphs.length) continue;
      const pageNumbers = new Set(
        paragraphs.flatMap((paragraph) =>
          paragraph.anchors.map((anchor) => anchor.pageNumber),
        ),
      );
      chapters.push({
        title: candidate.title,
        text: paragraphs.map((paragraph) => paragraph.displayText).join("\n\n"),
        sourceText: paragraphs
          .map((paragraph) => paragraph.sourceText)
          .join("\n\n"),
        role: "body",
        headingPath: candidate.headingPath,
        confidence: candidate.score,
        paragraphs,
        pages: pages.filter((page) => pageNumbers.has(page.number)),
        anchors: chapterAnchors(paragraphs),
      });
    }
  }

  const excluded = units
    .flatMap((unit) => unit.lines)
    .map((entry) => entry.line);
  const chapterConfidence = chapters.length
    ? chapters.reduce((sum, chapter) => sum + (chapter.confidence ?? 0), 0) /
      chapters.length
    : 0;
  const quality: ImportQualityReport = {
    pageCount: pages.length,
    nativeGoodPages: pages
      .filter((page) => page.qualityStatus === "native_good")
      .map((page) => page.number),
    suspiciousPages: pages
      .filter((page) => page.qualityStatus === "native_suspicious")
      .map((page) => page.number),
    ocrPages: pages.filter((page) => page.ocr).map((page) => page.number),
    failedPages: pages
      .filter((page) => page.qualityStatus === "failed")
      .map((page) => page.number),
    excludedHeaderFooterLines: excluded.filter((line) =>
      ["repeated_header", "repeated_footer"].includes(
        line.excludedReason ?? "",
      ),
    ).length,
    excludedPageNumbers: excluded.filter(
      (line) => line.excludedReason === "page_number",
    ).length,
    excludedTocLines: excluded.filter((line) => line.excludedReason === "toc")
      .length,
    chapterConfidence,
    warnings: [
      ...(candidates.length ? [] : ["chapter_detection_fallback"]),
      ...(pages.some((page) => page.qualityStatus === "native_suspicious")
        ? ["suspicious_native_pages"]
        : []),
      ...(pages.some((page) => page.qualityStatus === "failed")
        ? ["page_extraction_failures"]
        : []),
    ],
  };
  const configuration = createHash("sha256")
    .update(
      JSON.stringify({
        version: PDF_RECONSTRUCTION_VERSION,
        extraction: extraction.extractor.configuration ?? {},
        headingWords: HEADING_WORDS.source,
        thresholds: { headerRepeat: 0.35, heading: 0.5, fontRatio: 1.22 },
      }),
    )
    .digest("hex");
  return {
    chapters,
    pages,
    metadata: extraction.metadata ?? {},
    quality,
    versions: {
      extraction: `${extraction.extractor.name}@${extraction.extractor.version}`,
      reconstruction: PDF_RECONSTRUCTION_VERSION,
      configuration,
    },
  };
}
