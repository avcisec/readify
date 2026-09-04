import { z } from "zod";

export const emailLinkRequestSchema = z
  .object({
    email: z.string().email().max(320),
    returnPath: z.string().max(200).default("/library"),
  })
  .strict();

export const emailLinkSessionSchema = z
  .object({ proof: z.string().min(20).max(200) })
  .strict();

export const learningProfileSchema = z
  .object({
    targetLanguage: z.literal("fr"),
    startingLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  })
  .strict();

export const pastedTextImportSchema = z
  .object({
    text: z.string(),
  })
  .strict();

export const processingRetrySchema = z
  .object({ capability: z.literal("word_tools") })
  .strict();

export const readerPositionSchema = z
  .object({
    sourceRevisionId: z.string().min(1).max(100),
    anchor: z
      .object({
        sectionId: z.string().min(1).max(100),
        paragraphId: z.string().min(1).max(100),
        sentenceId: z.string().min(1).max(100).nullable().optional(),
      })
      .strict(),
  })
  .strict();

export const vocabularyChangeSchema = z
  .object({
    occurrenceId: z.string().min(1).max(100),
    state: z.enum(["learning", "known", "ignored"]),
  })
  .strict();

export type EmailLinkRequest = z.infer<typeof emailLinkRequestSchema>;
export type LearningProfileInput = z.infer<typeof learningProfileSchema>;
export type PastedTextImportInput = z.infer<typeof pastedTextImportSchema>;
export type ReaderPositionInput = z.infer<typeof readerPositionSchema>;
export type VocabularyChangeInput = z.infer<typeof vocabularyChangeSchema>;
