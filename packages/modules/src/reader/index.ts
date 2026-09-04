export type MeaningResult =
  | {
      availability: "available";
      meaning: string;
      source: string;
      datasetVersion: string;
    }
  | {
      availability: "unavailable";
      source: string;
      datasetVersion: string;
      reason: "not_in_fixture" | "temporarily_unavailable";
      retryable: boolean;
    };

const FIXTURE_MEANINGS: Record<string, string> = {
  aller: "gitmek",
  bonjour: "merhaba",
  choisir: "seçmek",
  manger: "yemek",
  parler: "konuşmak",
  marché: "pazar",
  pomme: "elma",
};

export function fixtureMeaning(lemma: string): MeaningResult {
  const meaning = FIXTURE_MEANINGS[lemma];
  return meaning
    ? {
        availability: "available",
        meaning,
        source: "readify_cc0_fixture",
        datasetVersion: "1",
      }
    : {
        availability: "unavailable",
        source: "readify_cc0_fixture",
        datasetVersion: "1",
        reason: "not_in_fixture",
        retryable: false,
      };
}
