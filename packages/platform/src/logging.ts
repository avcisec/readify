import pino from "pino";
import type { DestinationStream } from "pino";

export function createLogger(destination?: DestinationStream) {
  return pino(
    {
      base: undefined,
      redact: {
        paths: [
          "email",
          "text",
          "meaning",
          "token",
          "proof",
          "cookie",
          "req.headers.cookie",
          "req.headers.authorization",
          "response.body",
        ],
        censor: "[REDACTED]",
      },
    },
    destination,
  );
}

export const logger = createLogger();

export type SafeLogContext = {
  correlationId: string;
  event: string;
  outcome?: string;
  durationMs?: number;
  attempt?: number;
  stage?: string;
};

export function logEvent(context: SafeLogContext): void {
  logger.info(context);
}
