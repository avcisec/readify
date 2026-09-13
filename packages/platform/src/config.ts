import { z } from "zod";

export const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://readify:readify@127.0.0.1:55431/readify";

export const environmentSchema = z
  .object({
    APP_ENV: z
      .enum(["local", "test", "preview", "production"])
      .default("local"),
    DATABASE_URL: z.string().url(),
    IDENTITY_ADAPTER: z.enum(["outbox", "managed"]).default("outbox"),
    MEANING_ADAPTER: z.enum(["fixture", "licensed"]).default("fixture"),
    LANGUAGE_ANALYZER_ADAPTER: z
      .enum(["recorded", "stanza"])
      .default("recorded"),
    READIFY_UPLOAD_DIR: z.string().min(1).optional(),
    READIFY_PDF_EXTRACTOR: z.string().min(1).optional(),
    READIFY_OCR_DPI: z.coerce.number().int().min(150).max(600).default(300),
    PYTHON: z.string().min(1).optional(),
    SESSION_COOKIE_NAME: z.string().min(1).default("readify_session"),
  })
  .superRefine((value, context) => {
    if (value.APP_ENV !== "production") return;
    context.addIssue({
      code: "custom",
      message:
        "production rollout is disabled until real identity and meaning adapters are implemented",
    });
    if (value.IDENTITY_ADAPTER === "outbox")
      context.addIssue({
        code: "custom",
        message: "outbox identity adapter is forbidden in production",
      });
    if (value.MEANING_ADAPTER === "fixture")
      context.addIssue({
        code: "custom",
        message: "fixture meaning adapter is forbidden in production",
      });
    if (value.LANGUAGE_ANALYZER_ADAPTER === "recorded")
      context.addIssue({
        code: "custom",
        message: "recorded language adapter is forbidden in production",
      });
  });

export type Environment = z.infer<typeof environmentSchema>;

export function loadEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): Environment {
  return environmentSchema.parse(source);
}
