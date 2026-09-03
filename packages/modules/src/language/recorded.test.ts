import { describe, expect, it } from "vitest";
import { recordedFrenchAnalysis } from "./index";

describe("recorded French analysis", () => {
  it("groups approved fixture inflections by lemma and keeps scalar offsets", () => {
    const text = "🥐 va, allait, ira; mange, mangeaient et parle; parlaient.";
    const tokens = recordedFrenchAnalysis(text);
    expect(tokens.filter((token) => token.lemma === "aller")).toHaveLength(3);
    expect(tokens.filter((token) => token.lemma === "manger")).toHaveLength(2);
    expect(tokens.filter((token) => token.lemma === "parler")).toHaveLength(2);
    for (const token of tokens)
      expect([...text].slice(token.startScalar, token.endScalar).join("")).toBe(
        token.surface,
      );
  });
});
