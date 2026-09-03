import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

export const sliceQueryIndexesMigration: Migration = {
  async up(db: Kysely<unknown>) {
    await sql`create index vocabulary_owner_state_idx on vocabulary_items(owner_id, active, updated_at desc)`.execute(
      db,
    );
    await sql`create index occurrences_lemma_idx on occurrences(lemma_id)`.execute(
      db,
    );
  },
  async down(db: Kysely<unknown>) {
    await sql`drop index if exists occurrences_lemma_idx`.execute(db);
    await sql`drop index if exists vocabulary_owner_state_idx`.execute(db);
  },
};
