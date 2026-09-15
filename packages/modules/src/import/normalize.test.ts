import { describe, expect, it } from "vitest";
import {
  MAX_FILE_TEXT_SCALARS,
  MAX_TEXT_SCALARS,
  TextValidationError,
  normalizePastedText,
  scalarLength,
} from "./index";

describe("pasted-text normalization v1", () => {
  it("normalizes line endings and removes only outer blank lines", () => {
    expect(normalizePastedText(" \r\nBonjour  \r\n\r\n monde\r\n\t").text).toBe(
      "Bonjour  \n\n monde",
    );
  });

  it("counts Unicode scalar values, including combining marks", () => {
    expect(scalarLength("🥐e\u0301")).toBe(3);
    expect(normalizePastedText("🥐e\u0301").scalarCount).toBe(3);
  });

  it("preserves markup-looking input as literal text", () => {
    expect(normalizePastedText("<bonjour> **important**").text).toBe(
      "<bonjour> **important**",
    );
  });

  it("rejects over-limit and ill-formed values", () => {
    expect(() => normalizePastedText("a".repeat(MAX_TEXT_SCALARS + 1))).toThrow(
      TextValidationError,
    );
    expect(() => normalizePastedText("\ud800")).toThrow("ill_formed_unicode");
  });

  it("accepts the larger extracted-file text limit", () => {
    expect(
      normalizePastedText("a".repeat(50_001), MAX_FILE_TEXT_SCALARS)
        .scalarCount,
    ).toBe(50_001);
    expect(() =>
      normalizePastedText(
        "a".repeat(MAX_FILE_TEXT_SCALARS + 1),
        MAX_FILE_TEXT_SCALARS,
      ),
    ).toThrow(TextValidationError);
  });

  it("truncates the title at 80 scalar values", () => {
    expect(
      scalarLength(normalizePastedText(`${"🥐".repeat(81)}\nbody`).title),
    ).toBe(80);
  });
});
