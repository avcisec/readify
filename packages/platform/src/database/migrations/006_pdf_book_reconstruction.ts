import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

/** Additive provenance and processor metadata for deterministic PDF reconstruction. */
export const pdfBookReconstructionMigration: Migration = {
  async up(db: Kysely<unknown>) {
    await sql`alter table source_revisions add column if not exists language_code text not null default 'fr'`.execute(
      db,
    );
    await sql`alter table source_revisions add column if not exists extraction_version text`.execute(
      db,
    );
    await sql`alter table source_revisions add column if not exists reconstruction_version text`.execute(
      db,
    );
    await sql`alter table source_revisions add column if not exists pipeline_config_hash text`.execute(
      db,
    );
    await sql`alter table source_revisions add column if not exists document_structure jsonb`.execute(
      db,
    );
    await sql`alter table source_revisions add column if not exists document_metadata jsonb not null default '{}'::jsonb`.execute(
      db,
    );
    await sql`alter table source_revisions add column if not exists import_quality_report jsonb not null default '{}'::jsonb`.execute(
      db,
    );

    await sql`alter table source_pages add column if not exists stable_key text`.execute(
      db,
    );
    await sql`alter table source_pages add column if not exists raw_text text`.execute(
      db,
    );
    await sql`alter table source_pages add column if not exists quality_status text`.execute(
      db,
    );
    await sql`alter table source_pages add column if not exists quality_score double precision`.execute(
      db,
    );
    await sql`alter table source_pages add column if not exists warnings jsonb not null default '[]'::jsonb`.execute(
      db,
    );
    await sql`create unique index if not exists source_pages_asset_stable_key_idx on source_pages(source_asset_id, stable_key) where stable_key is not null`.execute(
      db,
    );
    await sql`alter table source_pages drop constraint if exists source_pages_quality_status_check`.execute(
      db,
    );
    await sql`alter table source_pages add constraint source_pages_quality_status_check check (quality_status is null or quality_status in ('native_good','native_suspicious','ocr_required','failed'))`.execute(
      db,
    );

    await sql`alter table sections add column if not exists stable_key text`.execute(
      db,
    );
    await sql`alter table sections add column if not exists role text not null default 'body'`.execute(
      db,
    );
    await sql`alter table sections add column if not exists heading_path jsonb not null default '[]'::jsonb`.execute(
      db,
    );
    await sql`alter table sections add column if not exists detection_confidence double precision`.execute(
      db,
    );
    await sql`alter table sections add column if not exists source_text text`.execute(
      db,
    );
    await sql`create unique index if not exists sections_revision_stable_key_idx on sections(source_revision_id, stable_key) where stable_key is not null`.execute(
      db,
    );
    await sql`alter table sections drop constraint if exists sections_role_check`.execute(
      db,
    );
    await sql`alter table sections add constraint sections_role_check check (role in ('body','front_matter','back_matter'))`.execute(
      db,
    );

    await sql`alter table paragraphs add column if not exists stable_key text`.execute(
      db,
    );
    await sql`alter table paragraphs add column if not exists source_text text`.execute(
      db,
    );
    await sql`alter table paragraphs add column if not exists role text not null default 'body'`.execute(
      db,
    );
    await sql`alter table paragraphs drop constraint if exists paragraphs_role_check`.execute(
      db,
    );
    await sql`alter table paragraphs add constraint paragraphs_role_check check (role in ('body','dialogue','list','footnote'))`.execute(
      db,
    );
    await sql`create unique index if not exists paragraphs_section_stable_key_idx on paragraphs(section_id, stable_key) where stable_key is not null`.execute(
      db,
    );
    await sql`alter table sentences add column if not exists stable_key text`.execute(
      db,
    );
    await sql`alter table sentences add column if not exists source_text text`.execute(
      db,
    );
    await sql`create unique index if not exists sentences_paragraph_stable_key_idx on sentences(paragraph_id, stable_key) where stable_key is not null`.execute(
      db,
    );
    await sql`alter table occurrences add column if not exists stable_key text`.execute(
      db,
    );
    await sql`create unique index if not exists occurrences_paragraph_stable_key_idx on occurrences(paragraph_id, stable_key) where stable_key is not null`.execute(
      db,
    );

    await sql`create table if not exists content_source_anchors (
      id text primary key,
      entity_type text not null check (entity_type in ('section','paragraph','sentence','occurrence')),
      entity_id text not null,
      ordinal integer not null check (ordinal >= 0),
      source_page_id text not null references source_pages(id) on delete cascade,
      source_start_scalar integer not null check (source_start_scalar >= 0),
      source_end_scalar integer not null check (source_end_scalar >= source_start_scalar),
      display_start_scalar integer not null check (display_start_scalar >= 0),
      display_end_scalar integer not null check (display_end_scalar >= display_start_scalar),
      bbox jsonb,
      block_id text,
      line_id text,
      word_ids jsonb not null default '[]'::jsonb,
      unique(entity_type, entity_id, ordinal)
    )`.execute(db);
    await sql`create index if not exists content_source_anchors_page_idx on content_source_anchors(source_page_id, entity_type)`.execute(
      db,
    );
  },

  async down(db: Kysely<unknown>) {
    await sql`drop table if exists content_source_anchors`.execute(db);
    await sql`drop index if exists occurrences_paragraph_stable_key_idx`.execute(
      db,
    );
    await sql`drop index if exists sentences_paragraph_stable_key_idx`.execute(
      db,
    );
    await sql`drop index if exists paragraphs_section_stable_key_idx`.execute(
      db,
    );
    await sql`drop index if exists sections_revision_stable_key_idx`.execute(
      db,
    );
    await sql`drop index if exists source_pages_asset_stable_key_idx`.execute(
      db,
    );
    for (const column of ["stable_key"])
      await sql
        .raw(`alter table occurrences drop column if exists ${column}`)
        .execute(db);
    await sql`alter table paragraphs drop constraint if exists paragraphs_role_check`.execute(
      db,
    );
    for (const column of ["source_text", "stable_key"])
      await sql
        .raw(`alter table sentences drop column if exists ${column}`)
        .execute(db);
    for (const column of ["role", "source_text", "stable_key"])
      await sql
        .raw(`alter table paragraphs drop column if exists ${column}`)
        .execute(db);
    for (const column of [
      "source_text",
      "detection_confidence",
      "heading_path",
      "role",
      "stable_key",
    ])
      await sql
        .raw(`alter table sections drop column if exists ${column}`)
        .execute(db);
    await sql`alter table source_pages drop constraint if exists source_pages_quality_status_check`.execute(
      db,
    );
    for (const column of [
      "warnings",
      "quality_score",
      "quality_status",
      "raw_text",
      "stable_key",
    ])
      await sql
        .raw(`alter table source_pages drop column if exists ${column}`)
        .execute(db);
    for (const column of [
      "import_quality_report",
      "document_structure",
      "document_metadata",
      "pipeline_config_hash",
      "reconstruction_version",
      "extraction_version",
      "language_code",
    ])
      await sql
        .raw(`alter table source_revisions drop column if exists ${column}`)
        .execute(db);
  },
};
