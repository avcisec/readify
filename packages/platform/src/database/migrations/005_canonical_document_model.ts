import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

/** Additive document/provenance fields. Existing Reader rows remain readable. */
export const canonicalDocumentModelMigration: Migration = {
  async up(db: Kysely<unknown>) {
    await sql`create table if not exists source_assets (
      id text primary key,
      source_revision_id text not null references source_revisions(id) on delete cascade,
      asset_type text not null check (asset_type in ('pdf','epub','audio')),
      object_key text not null,
      byte_size bigint not null check (byte_size >= 0),
      checksum text not null,
      mime_type text not null,
      created_at timestamptz not null,
      unique(source_revision_id, asset_type)
    )`.execute(db);
    await sql`create table if not exists source_pages (
      id text primary key,
      source_asset_id text not null references source_assets(id) on delete cascade,
      page_number integer not null check (page_number > 0),
      extracted_text text not null default '',
      extraction_status text not null check (extraction_status in ('native','ocr','unusable')),
      metadata jsonb not null default '{}'::jsonb,
      unique(source_asset_id, page_number)
    )`.execute(db);
    await sql`alter table source_revisions add column if not exists section_page_ranges jsonb not null default '[]'::jsonb`.execute(
      db,
    );
    await sql`alter table sections add column if not exists source_page_start integer check (source_page_start is null or source_page_start > 0)`.execute(
      db,
    );
    await sql`alter table sections add column if not exists source_page_end integer check (source_page_end is null or source_page_end > 0)`.execute(
      db,
    );
    await sql`alter table paragraphs add column if not exists source_page_start integer check (source_page_start is null or source_page_start > 0)`.execute(
      db,
    );
    await sql`alter table paragraphs add column if not exists source_page_end integer check (source_page_end is null or source_page_end > 0)`.execute(
      db,
    );
    await sql`alter table paragraphs add column if not exists source_start_scalar integer check (source_start_scalar is null or source_start_scalar >= 0)`.execute(
      db,
    );
    await sql`alter table paragraphs add column if not exists source_end_scalar integer check (source_end_scalar is null or source_end_scalar >= source_start_scalar)`.execute(
      db,
    );
    await sql`alter table sentences add column if not exists source_page_start integer check (source_page_start is null or source_page_start > 0)`.execute(
      db,
    );
    await sql`alter table sentences add column if not exists source_page_end integer check (source_page_end is null or source_page_end > 0)`.execute(
      db,
    );
    await sql`alter table occurrences add column if not exists normalized_form text`.execute(
      db,
    );
    await sql`alter table occurrences add column if not exists upos text`.execute(
      db,
    );
    await sql`alter table occurrences add column if not exists xpos text`.execute(
      db,
    );
    await sql`alter table occurrences add column if not exists morphological_features jsonb`.execute(
      db,
    );
    await sql`alter table occurrences add column if not exists dependency_head_ordinal integer`.execute(
      db,
    );
    await sql`alter table occurrences add column if not exists dependency_relation text`.execute(
      db,
    );
    await sql`alter table lemmas drop constraint if exists lemmas_language_check`.execute(
      db,
    );
    await sql`alter table vocabulary_items drop constraint if exists vocabulary_items_language_check`.execute(
      db,
    );
  },
  async down(db: Kysely<unknown>) {
    await sql`alter table vocabulary_items add constraint vocabulary_items_language_check check (language = 'fr')`.execute(
      db,
    );
    await sql`alter table lemmas add constraint lemmas_language_check check (language = 'fr')`.execute(
      db,
    );
    for (const column of [
      "dependency_relation",
      "dependency_head_ordinal",
      "morphological_features",
      "xpos",
      "upos",
      "normalized_form",
    ])
      await sql
        .raw(`alter table occurrences drop column if exists ${column}`)
        .execute(db);
    for (const column of ["source_page_start", "source_page_end"])
      await sql
        .raw(`alter table sentences drop column if exists ${column}`)
        .execute(db);
    for (const column of [
      "source_page_start",
      "source_page_end",
      "source_start_scalar",
      "source_end_scalar",
    ])
      await sql
        .raw(`alter table paragraphs drop column if exists ${column}`)
        .execute(db);
    await sql`drop table if exists source_pages`.execute(db);
    await sql`drop table if exists source_assets`.execute(db);
    await sql`alter table sections drop column if exists source_page_start`.execute(
      db,
    );
    await sql`alter table sections drop column if exists source_page_end`.execute(
      db,
    );
    await sql`alter table source_revisions drop column if exists section_page_ranges`.execute(
      db,
    );
  },
};
