import type { VocabularyState } from "@readify/contracts";

export function assertVocabularyState(
  value: string,
): asserts value is VocabularyState {
  if (value !== "learning" && value !== "known" && value !== "ignored")
    throw new Error("invalid_vocabulary_state");
}

export function canUndo(
  changeVersion: number,
  currentVersion: number,
  alreadyUndone: boolean,
): boolean {
  return !alreadyUndone && changeVersion === currentVersion;
}
