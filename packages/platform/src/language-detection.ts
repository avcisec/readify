import { franc } from "franc-min";

export type LanguageAssessment = {
  outcome: "french" | "mismatch" | "undetermined";
  detectedLanguage?: string;
};
export interface FrenchLanguageDetector {
  assess(text: string): LanguageAssessment;
}

export class FrancFrenchDetector implements FrenchLanguageDetector {
  assess(text: string): LanguageAssessment {
    if ([...text].length < 80) return { outcome: "undetermined" };
    const detected = franc(text, {
      minLength: 80,
      only: ["fra", "eng", "deu", "spa", "ita", "por", "nld"],
    });
    if (detected === "fra")
      return { outcome: "french", detectedLanguage: "fr" };
    if (detected === "und") return { outcome: "undetermined" };
    const lower = ` ${text.toLocaleLowerCase("en-US")} `;
    const strongEnglishSignals = [
      " the ",
      " and ",
      " is ",
      " are ",
      " with ",
      " this ",
      " that ",
      " from ",
    ];
    if (
      detected === "eng" &&
      strongEnglishSignals.filter((signal) => lower.includes(signal)).length >=
        3
    )
      return { outcome: "mismatch", detectedLanguage: "en" };
    return { outcome: "undetermined" };
  }
}
