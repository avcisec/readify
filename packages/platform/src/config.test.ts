import { describe, expect, it } from "vitest";
import { environmentSchema } from "./config";

const base = { DATABASE_URL: "postgresql://readify:readify@localhost/readify" };

describe("environment gates", () => {
  it("permits deterministic adapters outside production", () => {
    expect(environmentSchema.parse({ ...base, APP_ENV: "test" }).APP_ENV).toBe(
      "test",
    );
  });

  it("fails closed when any deterministic adapter is selected in production", () => {
    expect(() =>
      environmentSchema.parse({
        ...base,
        APP_ENV: "production",
        IDENTITY_ADAPTER: "outbox",
        MEANING_ADAPTER: "fixture",
        LANGUAGE_ANALYZER_ADAPTER: "recorded",
      }),
    ).toThrow(/forbidden in production/u);
  });

  it("does not accept placeholder production adapter names", () => {
    expect(() =>
      environmentSchema.parse({
        ...base,
        APP_ENV: "production",
        IDENTITY_ADAPTER: "managed",
        MEANING_ADAPTER: "licensed",
        LANGUAGE_ANALYZER_ADAPTER: "stanza",
      }),
    ).toThrow(/production rollout is disabled/u);
  });

  it("bounds the CPU OCR resolution", () => {
    expect(
      environmentSchema.parse({ ...base, READIFY_OCR_DPI: "300" })
        .READIFY_OCR_DPI,
    ).toBe(300);
    expect(() =>
      environmentSchema.parse({ ...base, READIFY_OCR_DPI: "1200" }),
    ).toThrow();
  });
});
