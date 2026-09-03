import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

const statements = [
  `CREATE TYPE processing_overall AS ENUM ('processing','ready','ready_degraded','failed')`,
  `CREATE TYPE job_status AS ENUM ('queued','running','succeeded','failed')`,
  `CREATE TYPE vocabulary_state AS ENUM ('learning','known','ignored')`,
  `CREATE TABLE users (id text PRIMARY KEY, email_normalized text NOT NULL UNIQUE, created_at timestamptz NOT NULL)`,
  `CREATE TABLE auth_proofs (id text PRIMARY KEY, email_normalized text NOT NULL, proof_hash text NOT NULL UNIQUE, return_path text NOT NULL, expires_at timestamptz NOT NULL, consumed_at timestamptz, created_at timestamptz NOT NULL)`,
  `CREATE TABLE sessions (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, revoked_at timestamptz, created_at timestamptz NOT NULL)`,
  `CREATE TABLE learning_profiles (user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, target_language text NOT NULL CHECK (target_language = 'fr'), starting_level text NOT NULL CHECK (starting_level IN ('A1','A2','B1','B2','C1','C2')), created_at timestamptz NOT NULL)`,
  `CREATE TABLE source_revisions (id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, normalized_text text NOT NULL, normalization_version integer NOT NULL CHECK (normalization_version = 1), account_digest text NOT NULL, language_mismatch_accepted boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL, UNIQUE(owner_id, account_digest))`,
  `CREATE TABLE import_workflows (id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, source_revision_id text NOT NULL UNIQUE REFERENCES source_revisions(id) ON DELETE CASCADE, overall processing_overall NOT NULL DEFAULT 'processing', stage text NOT NULL CHECK (stage IN ('queued','preparing_text','analyzing_language','complete')), text_capability text NOT NULL CHECK (text_capability IN ('pending','ready','failed')), word_tools_capability text NOT NULL CHECK (word_tools_capability IN ('pending','ready','failed')), retryable_capabilities text[] NOT NULL DEFAULT '{}', error_code text, error_reference_id text, version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL)`,
  `CREATE TABLE library_items (id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, import_id text NOT NULL UNIQUE REFERENCES import_workflows(id) ON DELETE CASCADE, source_revision_id text NOT NULL UNIQUE REFERENCES source_revisions(id) ON DELETE CASCADE, title text NOT NULL, source_type text NOT NULL CHECK (source_type = 'pasted_text'), created_at timestamptz NOT NULL)`,
  `CREATE INDEX library_owner_created_idx ON library_items(owner_id, created_at DESC, id DESC)`,
  `CREATE TABLE jobs (id text PRIMARY KEY, kind text NOT NULL, owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, subject_id text NOT NULL, correlation_id text NOT NULL, payload jsonb NOT NULL DEFAULT '{}', status job_status NOT NULL DEFAULT 'queued', attempt integer NOT NULL DEFAULT 0, max_attempts integer NOT NULL DEFAULT 3, available_at timestamptz NOT NULL, lease_until timestamptz, heartbeat_at timestamptz, last_error_code text, created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL)`,
  `CREATE INDEX jobs_claim_idx ON jobs(status, available_at, created_at)`,
  `CREATE TABLE sections (id text PRIMARY KEY, source_revision_id text NOT NULL REFERENCES source_revisions(id) ON DELETE CASCADE, ordinal integer NOT NULL CHECK (ordinal >= 0), UNIQUE(source_revision_id, ordinal))`,
  `CREATE TABLE paragraphs (id text PRIMARY KEY, section_id text NOT NULL REFERENCES sections(id) ON DELETE CASCADE, ordinal integer NOT NULL CHECK (ordinal >= 0), text text NOT NULL, UNIQUE(section_id, ordinal))`,
  `CREATE TABLE sentences (id text PRIMARY KEY, paragraph_id text NOT NULL REFERENCES paragraphs(id) ON DELETE CASCADE, ordinal integer NOT NULL CHECK (ordinal >= 0), start_scalar integer NOT NULL CHECK (start_scalar >= 0), end_scalar integer NOT NULL CHECK (end_scalar >= start_scalar), text text NOT NULL, UNIQUE(paragraph_id, ordinal))`,
  `CREATE TABLE lemmas (id text PRIMARY KEY, language text NOT NULL CHECK (language = 'fr'), normalized_lemma text NOT NULL, part_of_speech text NOT NULL, policy_version integer NOT NULL DEFAULT 1, UNIQUE(language, normalized_lemma, part_of_speech, policy_version))`,
  `CREATE TABLE occurrences (id text PRIMARY KEY, paragraph_id text NOT NULL REFERENCES paragraphs(id) ON DELETE CASCADE, sentence_id text NOT NULL REFERENCES sentences(id) ON DELETE CASCADE, lemma_id text REFERENCES lemmas(id), ordinal integer NOT NULL CHECK (ordinal >= 0), surface text NOT NULL, start_scalar integer NOT NULL CHECK (start_scalar >= 0), end_scalar integer NOT NULL CHECK (end_scalar >= start_scalar), UNIQUE(paragraph_id, ordinal))`,
  `CREATE TABLE language_analyses (id text PRIMARY KEY, source_revision_id text NOT NULL UNIQUE REFERENCES source_revisions(id) ON DELETE CASCADE, provider text NOT NULL, provider_version text NOT NULL, policy_version integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL)`,
  `CREATE TABLE reader_positions (owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, library_item_id text NOT NULL REFERENCES library_items(id) ON DELETE CASCADE, source_revision_id text NOT NULL REFERENCES source_revisions(id), section_id text NOT NULL REFERENCES sections(id), paragraph_id text NOT NULL REFERENCES paragraphs(id), sentence_id text REFERENCES sentences(id), version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL, PRIMARY KEY(owner_id, library_item_id))`,
  `CREATE TABLE section_completions (owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, section_id text NOT NULL REFERENCES sections(id) ON DELETE CASCADE, completed_at timestamptz NOT NULL, PRIMARY KEY(owner_id, section_id))`,
  `CREATE TABLE vocabulary_items (id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, language text NOT NULL CHECK (language = 'fr'), lemma_id text NOT NULL REFERENCES lemmas(id), state vocabulary_state NOT NULL, active boolean NOT NULL DEFAULT true, version integer NOT NULL DEFAULT 1, first_occurrence_id text NOT NULL REFERENCES occurrences(id), updated_at timestamptz NOT NULL, UNIQUE(owner_id, language, lemma_id))`,
  `CREATE TABLE vocabulary_occurrences (vocabulary_item_id text NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE, occurrence_id text NOT NULL REFERENCES occurrences(id) ON DELETE CASCADE, PRIMARY KEY(vocabulary_item_id, occurrence_id))`,
  `CREATE TABLE vocabulary_changes (id text PRIMARY KEY, vocabulary_item_id text NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE, previous_state vocabulary_state, next_state vocabulary_state NOT NULL, resulting_version integer NOT NULL, undone_by_change_id text UNIQUE REFERENCES vocabulary_changes(id), created_at timestamptz NOT NULL)`,
  `CREATE TABLE learning_events (id text PRIMARY KEY, owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, kind text NOT NULL, dedupe_key text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL, projected_at timestamptz, UNIQUE(owner_id, dedupe_key))`,
  `CREATE TABLE progress_summaries (owner_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, completed_sections integer NOT NULL DEFAULT 0, learning_count integer NOT NULL DEFAULT 0, known_count integer NOT NULL DEFAULT 0, ignored_count integer NOT NULL DEFAULT 0, computed_at timestamptz NOT NULL)`,
  `CREATE TABLE idempotency_records (owner_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, operation text NOT NULL, key text NOT NULL, request_hash text NOT NULL, status integer NOT NULL, response jsonb NOT NULL, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL, PRIMARY KEY(owner_id, operation, key))`,
];

export const initialMigration: Migration = {
  async up(db: Kysely<unknown>) {
    for (const statement of statements) await sql.raw(statement).execute(db);
  },
  async down(db: Kysely<unknown>) {
    for (const table of [
      "idempotency_records",
      "progress_summaries",
      "learning_events",
      "vocabulary_changes",
      "vocabulary_occurrences",
      "vocabulary_items",
      "section_completions",
      "reader_positions",
      "language_analyses",
      "occurrences",
      "lemmas",
      "sentences",
      "paragraphs",
      "sections",
      "jobs",
      "library_items",
      "import_workflows",
      "source_revisions",
      "learning_profiles",
      "sessions",
      "auth_proofs",
      "users",
    ]) {
      await sql.raw(`DROP TABLE IF EXISTS ${table} CASCADE`).execute(db);
    }
    await sql.raw("DROP TYPE IF EXISTS vocabulary_state").execute(db);
    await sql.raw("DROP TYPE IF EXISTS job_status").execute(db);
    await sql.raw("DROP TYPE IF EXISTS processing_overall").execute(db);
  },
};
