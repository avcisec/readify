import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

/** Index non-leading foreign keys traversed when a source revision is deleted. */
export const contentDeletionIndexesMigration: Migration = {
  async up(db: Kysely<unknown>) {
    for (const statement of [
      "create index if not exists occurrences_sentence_id_idx on occurrences(sentence_id)",
      "create index if not exists reader_positions_library_item_id_idx on reader_positions(library_item_id)",
      "create index if not exists reader_positions_source_revision_id_idx on reader_positions(source_revision_id)",
      "create index if not exists reader_positions_section_id_idx on reader_positions(section_id)",
      "create index if not exists reader_positions_paragraph_id_idx on reader_positions(paragraph_id)",
      "create index if not exists reader_positions_sentence_id_idx on reader_positions(sentence_id)",
      "create index if not exists section_completions_section_id_idx on section_completions(section_id)",
      "create index if not exists vocabulary_items_first_occurrence_id_idx on vocabulary_items(first_occurrence_id)",
      "create index if not exists vocabulary_occurrences_occurrence_id_idx on vocabulary_occurrences(occurrence_id)",
    ])
      await sql.raw(statement).execute(db);
  },

  async down(db: Kysely<unknown>) {
    for (const index of [
      "vocabulary_occurrences_occurrence_id_idx",
      "vocabulary_items_first_occurrence_id_idx",
      "section_completions_section_id_idx",
      "reader_positions_sentence_id_idx",
      "reader_positions_paragraph_id_idx",
      "reader_positions_section_id_idx",
      "reader_positions_source_revision_id_idx",
      "reader_positions_library_item_id_idx",
      "occurrences_sentence_id_idx",
    ])
      await sql.raw(`drop index if exists ${index}`).execute(db);
  },
};
