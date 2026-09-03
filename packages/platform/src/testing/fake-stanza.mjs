/* global process */
import { createInterface } from "node:readline";

const input = createInterface({ input: process.stdin });
input.on("line", (line) => {
  const request = JSON.parse(line);
  if (request.text === "hang") return;
  if (request.text === "invalid") {
    process.stdout.write('{"provider":"wrong"}\n');
    return;
  }
  process.stdout.write(
    `${JSON.stringify({ provider: "stanza", providerVersion: "test/resources-test", sentences: [{ words: [{ surface: request.text, lemma: request.text.toLowerCase(), pos: "NOUN", startScalar: 0, endScalar: [...request.text].length }] }] })}\n`,
  );
});
