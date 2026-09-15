import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

export const fileSourcesMigration: Migration = {
  async up(db: Kysely<unknown>) {
    await sql`alter table source_revisions add column if not exists section_titles jsonb not null default '[]'::jsonb`.execute(
      db,
    );
    await sql`alter table sections add column if not exists title text not null default ''`.execute(
      db,
    );
    await sql`alter table library_items drop constraint if exists library_items_source_type_check`.execute(
      db,
    );
    await sql`alter table library_items add constraint library_items_source_type_check check (source_type in ('pasted_text','pdf','epub'))`.execute(
      db,
    );
    await sql`alter table import_workflows drop constraint if exists import_workflows_stage_check`.execute(
      db,
    );
    await sql`alter table import_workflows add constraint import_workflows_stage_check check (stage in ('queued','extracting','preparing_text','analyzing_language','complete'))`.execute(
      db,
    );
  },
  async down(db: Kysely<unknown>) {
    await sql`delete from library_items where source_type in ('pdf','epub')`.execute(
      db,
    );
    await sql`alter table source_revisions drop column if exists section_titles`.execute(
      db,
    );
    await sql`alter table sections drop column if exists title`.execute(db);
    await sql`alter table library_items drop constraint if exists library_items_source_type_check`.execute(
      db,
    );
    await sql`alter table library_items add constraint library_items_source_type_check check (source_type = 'pasted_text')`.execute(
      db,
    );
    await sql`alter table import_workflows drop constraint if exists import_workflows_stage_check`.execute(
      db,
    );
    await sql`alter table import_workflows add constraint import_workflows_stage_check check (stage in ('queued','preparing_text','analyzing_language','complete'))`.execute(
      db,
    );
  },
};
