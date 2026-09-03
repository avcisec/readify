import type { TokenAnalysis } from "../language/index";

export interface LanguageAnalyzer {
  analyze(
    text: string,
    signal: AbortSignal,
  ): Promise<{
    provider: string;
    providerVersion: string;
    tokens: TokenAnalysis[];
  }>;
}
