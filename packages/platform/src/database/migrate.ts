import {
  Migrator,
  NO_MIGRATIONS,
  type MigrationProvider,
} from "kysely/migration";
import { createDatabase } from "./client";
import { initialMigration } from "./migrations/001_initial";
import { sliceQueryIndexesMigration } from "./migrations/002_slice_query_indexes";
import { vocabularyLearningStagesMigration } from "./migrations/003_vocabulary_learning_stages";
import { fileSourcesMigration } from "./migrations/004_file_sources";
import { canonicalDocumentModelMigration } from "./migrations/005_canonical_document_model";
import { pdfBookReconstructionMigration } from "./migrations/006_pdf_book_reconstruction";

const provider: MigrationProvider = {
  async getMigrations() {
    return {
      "001_initial": initialMigration,
      "002_slice_query_indexes": sliceQueryIndexesMigration,
      "003_vocabulary_learning_stages": vocabularyLearningStagesMigration,
      "004_file_sources": fileSourcesMigration,
      "005_canonical_document_model": canonicalDocumentModelMigration,
      "006_pdf_book_reconstruction": pdfBookReconstructionMigration,
    };
  },
};

export async function migrate(
  mode: "up" | "reset" | "down" | "initial" = "up",
): Promise<void> {
  const database = createDatabase();
  try {
    const migrator = new Migrator({ db: database, provider });
    if (mode === "reset" || mode === "down") {
      const down = await migrator.migrateTo(NO_MIGRATIONS);
      if (down.error) throw down.error;
    }
    if (mode === "down") return;
    if (mode === "initial") {
      const initial = await migrator.migrateTo("001_initial");
      if (initial.error) throw initial.error;
      return;
    }
    const up = await migrator.migrateToLatest();
    if (up.error) throw up.error;
    for (const result of up.results ?? [])
      console.log(`${result.status}: ${result.migrationName}`);
  } finally {
    await database.destroy();
  }
}
