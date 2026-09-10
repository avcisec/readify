export const NORMALIZATION_VERSION = 1;
export const MAX_TEXT_SCALARS = 50_000;
export const MAX_FILE_TEXT_SCALARS = 1_000_000;
export const MAX_TITLE_SCALARS = 80;

export type NormalizedText = {
  text: string;
  scalarCount: number;
  title: string;
};

export class TextValidationError extends Error {
  constructor(
    readonly code: "empty_text" | "text_too_long" | "ill_formed_unicode",
  ) {
    super(code);
  }
}

function isWellFormedUnicode(value: string): boolean {
  return value.isWellFormed();
}

export function scalarLength(value: string): number {
  return [...value].length;
}

export function truncateScalars(value: string, maximum: number): string {
  return [...value].slice(0, maximum).join("");
}

export function normalizePastedText(
  input: string,
  maximum = MAX_TEXT_SCALARS,
): NormalizedText {
  if (!isWellFormedUnicode(input))
    throw new TextValidationError("ill_formed_unicode");
  const lines = input.replace(/\r\n?/gu, "\n").split("\n");
  while (lines.length > 0 && /^\s*$/u.test(lines[0] ?? "")) lines.shift();
  while (lines.length > 0 && /^\s*$/u.test(lines.at(-1) ?? "")) lines.pop();
  const text = lines.join("\n");
  if (!text || /^\s*$/u.test(text)) throw new TextValidationError("empty_text");
  const scalarCount = scalarLength(text);
  if (scalarCount > maximum) throw new TextValidationError("text_too_long");
  const firstVisibleLine = lines.find((line) => /\S/u.test(line));
  const displayTitle = (firstVisibleLine ?? "").replace(/\s+/gu, " ").trim();
  return {
    text,
    scalarCount,
    title: truncateScalars(displayTitle || "İsimsiz metin", MAX_TITLE_SCALARS),
  };
}

export type LanguageAssessment = {
  outcome: "french" | "mismatch" | "undetermined";
  detectedLanguage?: string;
};

export function assessFrenchLanguage(input: string): LanguageAssessment {
  if (scalarLength(input) < 80) return { outcome: "undetermined" };
  const lower = ` ${input.toLocaleLowerCase("fr")} `;
  const frenchSignals = [
    " le ",
    " la ",
    " les ",
    " de ",
    " des ",
    " une ",
    " et ",
    " est ",
    " avec ",
    " au ",
  ];
  const englishSignals = [
    " the ",
    " and ",
    " is ",
    " with ",
    " this ",
    " that ",
  ];
  const french = frenchSignals.filter((signal) =>
    lower.includes(signal),
  ).length;
  const english = englishSignals.filter((signal) =>
    lower.includes(signal),
  ).length;
  if (english >= 3 && english > french * 2)
    return { outcome: "mismatch", detectedLanguage: "en" };
  if (french >= 3) return { outcome: "french", detectedLanguage: "fr" };
  return { outcome: "undetermined" };
}
