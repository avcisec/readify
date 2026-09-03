import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { createLogger } from "./logging";

describe("structured log redaction", () => {
  it("never emits private content or credentials", () => {
    let output = "";
    const destination = new Writable({
      write(chunk, _encoding, done) {
        output += chunk.toString();
        done();
      },
    });
    createLogger(destination).info({
      event: "test",
      email: "private@example.test",
      text: "secret source",
      token: "secret-token",
      safe: "visible",
    });
    expect(output).not.toContain("private@example.test");
    expect(output).not.toContain("secret source");
    expect(output).not.toContain("secret-token");
    expect(output).toContain("visible");
  });
});
