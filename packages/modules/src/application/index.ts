import type { ProcessingStatus, VocabularyState } from "@readify/contracts";
import type { MeaningResult } from "../reader/index";

export type SessionIdentity = { userId: string; email: string };
export type LearningProfile = {
  targetLanguage: "fr";
  startingLevel: string;
};
export type LibraryItemView = {
  id: string;
  title: string;
  sourceType: "pasted_text" | "pdf" | "epub";
  readerAvailable: boolean;
  hasSavedPosition: boolean;
  processing: ProcessingStatus;
};
export type BookIndexView = LibraryItemView & {
  chapters: Array<{
    id: string;
    ordinal: number;
    title: string;
    completed: boolean;
    readerAvailable: boolean;
  }>;
};
export type ImportCommandResult = {
  status: number;
  body: {
    outcome: "created" | "duplicate";
    libraryItem: LibraryItemView;
  };
};
export type ReaderPositionInput = {
  sourceRevisionId: string;
  sectionId: string;
  paragraphId: string;
  sentenceId?: string | null;
};
export type ReaderPositionView = ReaderPositionInput & {
  resolution: "exact";
  version: number;
};
export type ReaderView = {
  libraryItem: { id: string; title: string };
  sourceRevisionId: string;
  processing: ProcessingStatus;
  section: { id: string; ordinal: number; completed: boolean };
  paragraphs: Array<{
    id: string;
    ordinal: number;
    text: string;
    sentences: Array<{
      id: string;
      ordinal: number;
      startScalar: number;
      endScalar: number;
    }>;
    occurrences: Array<{
      id: string;
      sentenceId: string;
      lemmaId: string;
      surface: string;
      startScalar: number;
      endScalar: number;
      vocabularyState: VocabularyState | null;
    }>;
  }>;
  savedPosition: null | {
    sourceRevisionId: string;
    anchor: {
      sectionId: string;
      paragraphId: string;
      sentenceId: string | null;
    };
    resolution: "exact";
    version: number;
  };
  previousCursor: string | null;
  nextCursor: string | null;
};
export type VocabularyMutationView = {
  vocabularyItem: null | {
    id: string;
    state: VocabularyState;
    version: number;
  };
  stateChangeId: string;
};
export type OccurrenceContextView = {
  occurrence: {
    id: string;
    surface: string;
    lemmaId: string;
    lemma: string;
    partOfSpeech: string;
  };
  sentence: string;
  vocabulary: null | {
    id: string;
    state: VocabularyState;
    version: number;
  };
  meaning: MeaningResult;
};
export type VocabularyListView = {
  items: Array<{
    id: string;
    state: VocabularyState;
    version: number;
    lemmaId: string;
    lemma: string;
    partOfSpeech: string;
    firstSurface: string;
    firstOccurrenceId: string;
    firstSentence: string;
    occurrenceCount: number;
    source: { libraryItemId: string; occurrenceId: string };
    meaning: MeaningResult;
  }>;
  nextCursor: null;
};
export type ProgressSummaryView = {
  completedSections: number;
  vocabulary: { learning: number; known: number; ignored: number };
  computedAt: string;
  disclaimer: "self_reported_states";
};

export interface IdentityApplication {
  requestEmailProof(
    email: string,
    returnPath: string,
  ): Promise<{ proof: string; expiresAt: string }>;
  consumeEmailProof(proof: string): Promise<{
    sessionToken: string;
    returnPath: string;
    identity: SessionIdentity;
  }>;
  authenticate(sessionToken: string | undefined): Promise<SessionIdentity>;
  signOut(sessionToken: string): Promise<void>;
}

export interface LearningProfileApplication {
  getProfile(userId: string): Promise<LearningProfile | null>;
  putProfile(
    userId: string,
    targetLanguage: string,
    startingLevel: string,
  ): Promise<LearningProfile>;
}

export interface ImportApplication {
  createPastedImport(
    userId: string,
    text: string,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<ImportCommandResult>;
  retryCapability(
    userId: string,
    itemId: string,
    capability: string,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<{ accepted: true }>;
}

export interface LibraryApplication {
  listLibrary(
    userId: string,
  ): Promise<{ items: LibraryItemView[]; nextCursor: null }>;
  getLibraryItem(userId: string, itemId: string): Promise<LibraryItemView>;
  getBookIndex(userId: string, itemId: string): Promise<BookIndexView>;
}

export interface ReaderApplication {
  getReader(
    userId: string,
    itemId: string,
    sectionId?: string,
    cursor?: string,
  ): Promise<ReaderView>;
  saveReaderPosition(
    userId: string,
    itemId: string,
    locator: ReaderPositionInput,
  ): Promise<ReaderPositionView>;
  completeSection(
    userId: string,
    itemId: string,
    sectionId: string,
    correlationId: string,
  ): Promise<{ sectionId: string; completed: true }>;
  getOccurrenceContext(
    userId: string,
    itemId: string,
    occurrenceId: string,
  ): Promise<OccurrenceContextView>;
}

export interface VocabularyApplication {
  changeVocabularyState(
    userId: string,
    occurrenceId: string,
    nextState: VocabularyState,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<VocabularyMutationView>;
  undoVocabularyChange(
    userId: string,
    changeId: string,
    idempotencyKey: string,
    correlationId: string,
  ): Promise<VocabularyMutationView>;
  listVocabulary(userId: string): Promise<VocabularyListView>;
}

export interface LearningApplication {
  getProgress(userId: string): Promise<ProgressSummaryView>;
}

export interface SliceApplication
  extends
    IdentityApplication,
    LearningProfileApplication,
    ImportApplication,
    LibraryApplication,
    ReaderApplication,
    VocabularyApplication,
    LearningApplication {}
