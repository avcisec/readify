export const API_VERSION = "v1" as const;
export * from "./http";

export type AppEnvironment = "local" | "test" | "preview" | "production";

export interface RequestContext {
  readonly requestId: string;
  readonly now: Date;
  readonly accountId?: string;
}

export type VocabularyState = "learning" | "known" | "ignored";
export type ProcessingCapability = "pending" | "ready" | "failed";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  code: string;
  referenceId: string;
  fieldErrors?: Array<{ field: string; code: string; limit?: number }>;
  detectedLanguage?: string;
}

export interface ProcessingStatus {
  overall: "processing" | "ready" | "ready_degraded" | "failed";
  stage: "queued" | "preparing_text" | "analyzing_language" | "complete";
  capabilities: { text: ProcessingCapability; wordTools: ProcessingCapability };
  progress: null;
  retryableCapabilities: string[];
  error: null | { code: string; referenceId: string };
  version: number;
  updatedAt: string;
}
