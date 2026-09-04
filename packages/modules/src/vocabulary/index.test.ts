import { describe, expect, it } from "vitest";
import { assertVocabularyState } from "./index";

describe("vocabulary states", () => {
  it("accepts the four learning stages plus Known and Ignore", () => {
    for (const state of [
      "new",
      "recognized",
      "familiar",
      "learned",
      "known",
      "ignored",
    ])
      expect(() => assertVocabularyState(state)).not.toThrow();
  });

  it("rejects the legacy learning bucket", () => {
    expect(() => assertVocabularyState("learning")).toThrow(
      "invalid_vocabulary_state",
    );
  });
});
