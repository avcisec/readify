import { describe, expect, it } from "vitest";
import { FrancFrenchDetector } from "./language-detection";

const detector = new FrancFrenchDetector();

describe("French language detection policy", () => {
  it("does not turn short or uncertain text into a mismatch", () => {
    expect(detector.assess("Bonjour !").outcome).toBe("undetermined");
    expect(detector.assess("Casa banana musica ".repeat(8)).outcome).toBe(
      "undetermined",
    );
  });

  it("recognizes policy-qualified French and English", () => {
    expect(
      detector.assess(
        "Camille va au marché avec sa sœur et elle parle avec le vendeur dans la rue. ".repeat(
          3,
        ),
      ).outcome,
    ).toBe("french");
    expect(
      detector.assess(
        "This is the story of a learner and the words that are read with care. ".repeat(
          3,
        ),
      ),
    ).toEqual({ outcome: "mismatch", detectedLanguage: "en" });
  });
});
