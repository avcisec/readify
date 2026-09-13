import { describe, expect, it } from "vitest";
import {
  reconstructPdf,
  segmentSentences,
  stableSemanticId,
  type SourceBlock,
  type SourcePage,
} from "./pdf-reconstruction";

function block(
  id: string,
  text: string,
  y: number,
  options: { size?: number; bold?: boolean; x?: number; width?: number } = {},
): SourceBlock {
  const x = options.x ?? 60;
  const width = options.width ?? 480;
  const lines = text.split("\n").map((line, index) => ({
    id: `${id}:l${index}`,
    text: line,
    bbox: [x, y + index * 16, x + width, y + index * 16 + 14] as [
      number,
      number,
      number,
      number,
    ],
    sourceStartScalar: 0,
    sourceEndScalar: [...line].length,
    spans: [
      {
        id: `${id}:l${index}:s0`,
        text: line,
        size: options.size ?? 11,
        font: options.bold ? "Book-Bold" : "Book-Regular",
      },
    ],
  }));
  return {
    id,
    text,
    bbox: [x, y, x + width, y + Math.max(16, lines.length * 16)],
    lines,
  };
}

function page(number: number, blocks: SourceBlock[]): SourcePage {
  return {
    number,
    width: 600,
    height: 800,
    rawText: blocks.map((entry) => entry.text).join("\n\n"),
    text: blocks.map((entry) => entry.text).join("\n\n"),
    qualityStatus: "native_good",
    qualityScore: 1,
    blocks,
  };
}

describe("PDF structural normalization", () => {
  it("uses repeated typographic story titles as chapters without language keywords", () => {
    const result = reconstructPdf({
      pages: [
        page(1, [
          block("p1:b0", "Le jardin secret", 80, { size: 20, bold: true }),
          block("p1:b1", "Élise ouvrit doucement la porte.", 160),
        ]),
        page(2, [
          block("p2:b0", "La dernière lettre", 80, { size: 20, bold: true }),
          block("p2:b1", "— Tu reviendras ? demanda-t-elle.", 160),
        ]),
      ],
      outline: [],
      extractor: { name: "fixture", version: "1" },
    });
    expect(result.chapters.map((chapter) => chapter.title)).toEqual([
      "Le jardin secret",
      "La dernière lettre",
    ]);
    expect(result.chapters[1]?.text).toContain("— Tu reviendras ?");
  });

  it("prefers leaf-level PDF outline entries and flattens parts", () => {
    const result = reconstructPdf({
      pages: [
        page(1, [
          block("p1:b0", "Première partie", 70, { size: 22, bold: true }),
          block("p1:b1", "Chapitre un", 130, { size: 18, bold: true }),
          block("p1:b2", "Un matin, Amélie partit.", 190),
        ]),
        page(2, [
          block("p2:b0", "Chapitre deux", 80, { size: 18, bold: true }),
          block("p2:b1", "Elle revint le soir.", 150),
        ]),
      ],
      outline: [
        { level: 1, title: "Première partie", pageNumber: 1 },
        { level: 2, title: "Chapitre un", pageNumber: 1 },
        { level: 2, title: "Chapitre deux", pageNumber: 2 },
      ],
      extractor: { name: "fixture", version: "1" },
    });
    expect(result.chapters.map((chapter) => chapter.title)).toEqual([
      "Chapitre un",
      "Chapitre deux",
    ]);
    expect(result.chapters[0]?.headingPath).toEqual(["Première partie"]);
  });

  it("reconstructs a hyphenated paragraph across a page boundary", () => {
    const result = reconstructPdf({
      pages: [
        page(1, [block("p1:b0", "Cette histoire extra-", 700)]),
        page(2, [block("p2:b0", "ordinaire continue ici.", 90)]),
      ],
      outline: [],
      extractor: { name: "fixture", version: "1" },
    });
    expect(result.chapters[0]?.paragraphs?.[0]?.displayText).toBe(
      "Cette histoire extraordinaire continue ici.",
    );
    expect(
      result.chapters[0]?.paragraphs?.[0]?.anchors.map(
        (anchor) => anchor.pageNumber,
      ),
    ).toEqual([1, 2]);
  });

  it("removes alternating repeated headers and page numbers but preserves provenance", () => {
    const pages = [1, 2, 3, 4].map((number) =>
      page(number, [
        block(
          `p${number}:header`,
          number % 2 ? "Histoires faciles" : "Marie Dupont",
          20,
        ),
        block(`p${number}:body`, `Texte de la page ${number}.`, 150),
        block(`p${number}:number`, String(number), 760),
      ]),
    );
    const result = reconstructPdf({
      pages,
      outline: [],
      extractor: { name: "fixture", version: "1" },
    });
    expect(result.chapters[0]?.text).not.toContain("Histoires faciles");
    expect(result.chapters[0]?.text).not.toContain("Marie Dupont");
    expect(result.quality.excludedHeaderFooterLines).toBe(4);
    expect(result.quality.excludedPageNumbers).toBe(4);
    expect(result.pages[0]?.blocks[0]?.lines?.[0]?.excludedReason).toBe(
      "repeated_header",
    );
  });

  it("orders two-column blocks down the left column before the right", () => {
    const result = reconstructPdf({
      pages: [
        page(1, [
          block("right-top", "Droite un.", 100, { x: 330, width: 200 }),
          block("left-bottom", "Gauche deux.", 300, { x: 50, width: 200 }),
          block("right-bottom", "Droite deux.", 300, { x: 330, width: 200 }),
          block("left-top", "Gauche un.", 100, { x: 50, width: 200 }),
        ]),
      ],
      outline: [],
      extractor: { name: "fixture", version: "1" },
    });
    expect(result.chapters[0]?.text).toBe(
      "Gauche un.\n\nGauche deux.\n\nDroite un.\n\nDroite deux.",
    );
  });

  it("keeps exact source anchors while sentence segmentation uses display offsets", () => {
    const result = reconstructPdf({
      pages: [page(1, [block("p1:b0", "« Où vas-tu ? »\nÀ l'école.", 120)])],
      outline: [],
      extractor: { name: "fixture", version: "1" },
    });
    const paragraph = result.chapters[0]!.paragraphs![0]!;
    const sentences = segmentSentences(paragraph, "fr");
    expect(paragraph.sourceText).toBe("« Où vas-tu ? »\nÀ l'école.");
    expect(paragraph.displayText).toBe("« Où vas-tu ? » À l'école.");
    expect(sentences).toHaveLength(2);
    expect(sentences.every((sentence) => sentence.anchors.length > 0)).toBe(
      true,
    );
    expect(paragraph.anchors[0]?.bbox).toEqual([60, 120, 540, 134]);
    expect(paragraph.anchors[0]).toMatchObject({
      pageNumber: 1,
      blockId: "p1:b0",
      lineId: "p1:b0:l0",
    });
  });

  it("keeps repeated dialogue and list items as separate paragraphs", () => {
    const dialogue = block(
      "p1:b0",
      "— Bonjour, dit Élise.\n— Bonjour, répondit André.",
      120,
    );
    const list = block("p1:b1", "1. Premier récit\n2. Deuxième récit", 220);
    const result = reconstructPdf({
      pages: [page(1, [dialogue, list])],
      outline: [],
      extractor: { name: "fixture", version: "1" },
    });
    expect(
      result.chapters[0]?.paragraphs?.map((paragraph) => paragraph.displayText),
    ).toEqual([
      "— Bonjour, dit Élise.",
      "— Bonjour, répondit André.",
      "1. Premier récit",
      "2. Deuxième récit",
    ]);
  });

  it("classifies small bottom-of-page notes separately from body prose", () => {
    const result = reconstructPdf({
      pages: [
        page(1, [
          block(
            "p1:body",
            "Le texte principal continue avec une phrase suffisamment longue.",
            180,
            { size: 11 },
          ),
          block("p1:note", "1 Une note de l’éditeur.", 700, { size: 8 }),
        ]),
      ],
      outline: [],
      extractor: { name: "fixture", version: "1" },
    });
    expect(result.chapters[0]?.paragraphs?.map((entry) => entry.role)).toEqual([
      "body",
      "footnote",
    ]);
  });

  it("produces stable semantic IDs", () => {
    expect(stableSemanticId("par", "revision", 0, "Bonjour")).toBe(
      stableSemanticId("par", "revision", 0, "Bonjour"),
    );
    expect(stableSemanticId("par", "revision", 0, "Bonjour")).not.toBe(
      stableSemanticId("par", "revision", 1, "Bonjour"),
    );
  });

  it("reports mixed native, OCR, suspicious and failed pages without dropping the book", () => {
    const native = page(1, [block("p1:b0", "Un texte français lisible.", 100)]);
    const ocr = {
      ...page(2, [block("p2:b0", "Texte reconnu par OCR.", 100)]),
      qualityStatus: "ocr_required" as const,
      ocr: true,
    };
    const suspicious = {
      ...page(3, [block("p3:b0", "Fin.", 100)]),
      qualityStatus: "native_suspicious" as const,
    };
    const failed: SourcePage = {
      number: 4,
      width: 600,
      height: 800,
      rawText: "",
      text: "",
      blocks: [],
      qualityStatus: "failed",
      warnings: ["ocr_unavailable"],
    };
    const result = reconstructPdf({
      pages: [native, ocr, suspicious, failed],
      outline: [],
      extractor: { name: "fixture", version: "1" },
    });
    expect(result.chapters).toHaveLength(1);
    expect(result.quality).toMatchObject({
      nativeGoodPages: [1],
      suspiciousPages: [3],
      ocrPages: [2],
      failedPages: [4],
    });
    expect(result.quality.warnings).toContain("page_extraction_failures");
  });
});
