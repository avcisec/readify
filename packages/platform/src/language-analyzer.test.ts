import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { StanzaProcessAnalyzer } from "./language-analyzer";

const fixture = fileURLToPath(
  new URL("./testing/fake-stanza.mjs", import.meta.url),
);

describe("Stanza process contract", () => {
  it("maps bounded versioned output and scalar offsets", async () => {
    const analyzer = new StanzaProcessAnalyzer(
      process.execPath,
      fixture,
      1_000,
    );
    await expect(
      analyzer.analyze("École", new AbortController().signal),
    ).resolves.toEqual({
      provider: "stanza",
      providerVersion: "test/resources-test",
      tokens: [
        {
          surface: "École",
          lemma: "école",
          partOfSpeech: "noun",
          startScalar: 0,
          endScalar: 5,
        },
      ],
    });
    analyzer.close();
  });

  it("classifies invalid output and deadlines without exposing input", async () => {
    const invalid = new StanzaProcessAnalyzer(process.execPath, fixture, 1_000);
    await expect(
      invalid.analyze("invalid", new AbortController().signal),
    ).rejects.toThrow();
    invalid.close();
    const timeout = new StanzaProcessAnalyzer(process.execPath, fixture, 25);
    await expect(
      timeout.analyze("hang", new AbortController().signal),
    ).rejects.toThrow("language_analyzer_timeout");
    timeout.close();
  });
});
