export type TokenAnalysis = {
  surface: string;
  lemma: string;
  partOfSpeech: string;
  startScalar: number;
  endScalar: number;
  /** Universal Dependencies-compatible annotations, when provider supplies them. */
  upos?: string;
  xpos?: string;
  morphologicalFeatures?: Record<string, string>;
  dependencyHead?: number | null;
  dependencyRelation?: string;
};

const LEMMAS: Record<string, string> = {
  va: "aller",
  allait: "aller",
  ira: "aller",
  mange: "manger",
  manger: "manger",
  mangeaient: "manger",
  parle: "parler",
  parlent: "parler",
  parlaient: "parler",
  parler: "parler",
  choisit: "choisir",
  choisir: "choisir",
  choisira: "choisir",
};

export function recordedFrenchAnalysis(text: string): TokenAnalysis[] {
  const scalars = [...text];
  const result: TokenAnalysis[] = [];
  const pattern = /[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*/gu;
  for (const match of text.matchAll(pattern)) {
    const utf16Start = match.index;
    const startScalar = [...text.slice(0, utf16Start)].length;
    const surface = match[0];
    const normalized = surface.toLocaleLowerCase("fr");
    result.push({
      surface,
      lemma: LEMMAS[normalized] ?? normalized,
      partOfSpeech: "x",
      startScalar,
      endScalar: startScalar + [...surface].length,
    });
  }
  if (result.some((token) => token.endScalar > scalars.length))
    throw new Error("analysis_offset_out_of_bounds");
  return result;
}
