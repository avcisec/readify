import { describe, expect, it } from "vitest";
import { fixtureMeaning } from "./index";

describe("fixture meanings", () => {
  it("distinguishes fixture coverage from a retryable provider failure", () => {
    expect(fixtureMeaning("manger")).toMatchObject({
      availability: "available",
      meaning: "yemek",
      source: "readify_cc0_fixture",
    });
    expect(fixtureMeaning("toujours")).toEqual({
      availability: "unavailable",
      source: "readify_cc0_fixture",
      datasetVersion: "1",
      reason: "not_in_fixture",
      retryable: false,
    });
  });
});
