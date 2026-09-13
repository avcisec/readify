import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  recordedFrenchAnalysis,
  type LanguageAnalyzer,
  type TokenAnalysis,
} from "@readify/modules";
import type { Environment } from "./config";

const responseSchema = z.object({
  provider: z.literal("stanza"),
  providerVersion: z.string().min(1).max(50),
  sentences: z.array(
    z.object({
      words: z.array(
        z.object({
          surface: z.string(),
          lemma: z.string(),
          pos: z.string(),
          startScalar: z.number().int().nonnegative(),
          endScalar: z.number().int().nonnegative(),
          upos: z.string().optional(),
          xpos: z.string().optional(),
          morphologicalFeatures: z.record(z.string(), z.string()).optional(),
          dependencyHead: z.number().int().nullable().optional(),
          dependencyRelation: z.string().optional(),
        }),
      ),
    }),
  ),
});

export class RecordedLanguageAnalyzer implements LanguageAnalyzer {
  async analyze(
    text: string,
    _signal?: AbortSignal,
    _language?: string,
  ): Promise<{
    provider: string;
    providerVersion: string;
    tokens: TokenAnalysis[];
  }> {
    return {
      provider: "recorded",
      providerVersion: "1",
      tokens: recordedFrenchAnalysis(text),
    };
  }
}

type Pending = {
  resolve: (value: {
    provider: string;
    providerVersion: string;
    tokens: TokenAnalysis[];
  }) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
  text: string;
  language: string;
};

export class StanzaProcessAnalyzer implements LanguageAnalyzer {
  private child?: ChildProcessWithoutNullStreams;
  private buffer = "";
  private pending?: Pending;
  constructor(
    private readonly command = process.env.STANZA_PYTHON ?? "python3",
    private readonly script = fileURLToPath(
      new URL("../../../apps/language-worker/worker.py", import.meta.url),
    ),
    private readonly timeoutMs = 30_000,
    private readonly maxResponseBytes = 2 * 1024 * 1024,
  ) {}

  private start(): ChildProcessWithoutNullStreams {
    if (this.child && !this.child.killed) return this.child;
    const child = spawn(this.command, [this.script], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => this.receive(chunk));
    child.stderr.on("data", () => undefined);
    child.on("exit", () => {
      this.child = undefined;
      this.failPending(new Error("language_analyzer_process_exited"));
    });
    this.child = child;
    return child;
  }

  private receive(chunk: string): void {
    this.buffer += chunk;
    if (Buffer.byteLength(this.buffer) > this.maxResponseBytes) {
      this.child?.kill();
      this.failPending(new Error("language_analyzer_response_too_large"));
      return;
    }
    const newline = this.buffer.indexOf("\n");
    if (newline < 0 || !this.pending) return;
    const line = this.buffer.slice(0, newline);
    this.buffer = this.buffer.slice(newline + 1);
    const pending = this.pending;
    this.pending = undefined;
    clearTimeout(pending.timer);
    try {
      const parsed = responseSchema.parse(JSON.parse(line));
      const tokens = parsed.sentences.flatMap((sentence) =>
        sentence.words.map((word) => ({
          surface: word.surface,
          lemma: word.lemma.toLocaleLowerCase(pending.language),
          partOfSpeech: word.pos.toLocaleLowerCase("en-US"),
          startScalar: word.startScalar,
          endScalar: word.endScalar,
          upos: word.upos,
          xpos: word.xpos,
          morphologicalFeatures: word.morphologicalFeatures,
          dependencyHead: word.dependencyHead,
          dependencyRelation: word.dependencyRelation,
        })),
      );
      for (const token of tokens)
        if (
          [...pending.text]
            .slice(token.startScalar, token.endScalar)
            .join("") !== token.surface
        )
          throw new Error("language_analyzer_offset_mismatch");
      pending.resolve({
        provider: parsed.provider,
        providerVersion: parsed.providerVersion,
        tokens,
      });
    } catch (error) {
      pending.reject(
        error instanceof Error
          ? error
          : new Error("language_analyzer_invalid_response"),
      );
    }
  }

  private failPending(error: Error): void {
    if (!this.pending) return;
    clearTimeout(this.pending.timer);
    const pending = this.pending;
    this.pending = undefined;
    pending.reject(error);
  }

  async analyze(
    text: string,
    signal: AbortSignal,
    language = "fr",
  ): Promise<{
    provider: string;
    providerVersion: string;
    tokens: TokenAnalysis[];
  }> {
    if (this.pending) throw new Error("language_analyzer_busy");
    if ([...text].length > 50_000)
      throw new Error("language_analyzer_input_too_large");
    const child = this.start();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.child?.kill();
        this.failPending(new Error("language_analyzer_timeout"));
      }, this.timeoutMs);
      this.pending = { resolve, reject, timer, text, language };
      signal.addEventListener(
        "abort",
        () => {
          this.child?.kill();
          this.failPending(new Error("language_analyzer_cancelled"));
        },
        { once: true },
      );
      child.stdin.write(`${JSON.stringify({ text, language })}\n`);
    });
  }

  close(): void {
    this.child?.kill();
  }
}

export function createLanguageAnalyzer(
  environment: Environment,
): LanguageAnalyzer & { close?: () => void } {
  return environment.LANGUAGE_ANALYZER_ADAPTER === "stanza"
    ? new StanzaProcessAnalyzer()
    : new RecordedLanguageAnalyzer();
}
