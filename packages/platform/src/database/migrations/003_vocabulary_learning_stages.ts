import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

export const vocabularyLearningStagesMigration: Migration = {
  async up(db: Kysely<unknown>) {
    await sql`create type vocabulary_state_next as enum ('new', 'recognized', 'familiar', 'learned', 'known', 'ignored')`.execute(
      db,
    );
    await sql`alter table vocabulary_items alter column state type vocabulary_state_next using (case when state::text = 'learning' then 'new' else state::text end)::vocabulary_state_next`.execute(
      db,
    );
    await sql`alter table vocabulary_changes alter column previous_state type vocabulary_state_next using (case when previous_state::text = 'learning' then 'new' else previous_state::text end)::vocabulary_state_next`.execute(
      db,
    );
    await sql`alter table vocabulary_changes alter column next_state type vocabulary_state_next using (case when next_state::text = 'learning' then 'new' else next_state::text end)::vocabulary_state_next`.execute(
      db,
    );
    await sql`drop type vocabulary_state`.execute(db);
    await sql`alter type vocabulary_state_next rename to vocabulary_state`.execute(
      db,
    );
  },
  async down(db: Kysely<unknown>) {
    await sql`create type vocabulary_state_previous as enum ('learning', 'known', 'ignored')`.execute(
      db,
    );
    await sql`alter table vocabulary_items alter column state type vocabulary_state_previous using (case when state::text in ('new', 'recognized', 'familiar', 'learned') then 'learning' else state::text end)::vocabulary_state_previous`.execute(
      db,
    );
    await sql`alter table vocabulary_changes alter column previous_state type vocabulary_state_previous using (case when previous_state::text in ('new', 'recognized', 'familiar', 'learned') then 'learning' else previous_state::text end)::vocabulary_state_previous`.execute(
      db,
    );
    await sql`alter table vocabulary_changes alter column next_state type vocabulary_state_previous using (case when next_state::text in ('new', 'recognized', 'familiar', 'learned') then 'learning' else next_state::text end)::vocabulary_state_previous`.execute(
      db,
    );
    await sql`drop type vocabulary_state`.execute(db);
    await sql`alter type vocabulary_state_previous rename to vocabulary_state`.execute(
      db,
    );
  },
};
