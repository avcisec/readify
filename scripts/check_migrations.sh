#!/usr/bin/env bash
set -euo pipefail

docker compose up -d postgres-test
cleanup() {
  docker compose stop postgres-test >/dev/null
}
trap cleanup EXIT

until docker compose exec -T postgres-test pg_isready -U readify -d readify_test >/dev/null 2>&1; do
  sleep 1
done

export DATABASE_URL="postgresql://readify:readify@127.0.0.1:55432/readify_test"
pnpm --filter @readify/platform migrate:down
pnpm --filter @readify/platform migrate:initial
docker compose exec -T postgres-test psql -U readify -d readify_test -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
insert into users (id, email_normalized, created_at) values ('migration_user', 'migration@example.test', now());
insert into source_revisions (id, owner_id, normalized_text, normalization_version, account_digest, created_at) values ('migration_revision', 'migration_user', 'Bonjour.', 1, 'migration_digest', now());
insert into import_workflows (id, owner_id, source_revision_id, stage, text_capability, word_tools_capability, updated_at) values ('migration_import', 'migration_user', 'migration_revision', 'complete', 'ready', 'ready', now());
insert into library_items (id, owner_id, import_id, source_revision_id, title, source_type, created_at) values ('migration_item', 'migration_user', 'migration_import', 'migration_revision', 'Bonjour', 'pasted_text', now());
insert into sections (id, source_revision_id, ordinal) values ('migration_section', 'migration_revision', 0);
insert into paragraphs (id, section_id, ordinal, text) values ('migration_paragraph', 'migration_section', 0, 'Bonjour.');
insert into sentences (id, paragraph_id, ordinal, start_scalar, end_scalar, text) values ('migration_sentence', 'migration_paragraph', 0, 0, 8, 'Bonjour.');
insert into lemmas (id, language, normalized_lemma, part_of_speech) values ('migration_lemma', 'fr', 'bonjour', 'INTJ');
insert into occurrences (id, paragraph_id, sentence_id, lemma_id, ordinal, surface, start_scalar, end_scalar) values ('migration_occurrence', 'migration_paragraph', 'migration_sentence', 'migration_lemma', 0, 'Bonjour', 0, 7);
insert into vocabulary_items (id, owner_id, language, lemma_id, state, first_occurrence_id, updated_at) values ('migration_vocabulary', 'migration_user', 'fr', 'migration_lemma', 'learning', 'migration_occurrence', now());
insert into vocabulary_changes (id, vocabulary_item_id, previous_state, next_state, resulting_version, created_at) values ('migration_change', 'migration_vocabulary', null, 'learning', 1, now());
SQL
pnpm --filter @readify/platform migrate
mapped_states="$(docker compose exec -T postgres-test psql -U readify -d readify_test -Atc "select v.state::text || '|' || c.next_state::text from vocabulary_items v join vocabulary_changes c on c.vocabulary_item_id=v.id where v.id='migration_vocabulary'")"
test "$mapped_states" = "new|new"
pnpm --filter @readify/platform migrate
echo "migration clean apply, legacy vocabulary mapping, representative upgrade, and idempotent re-run: PASS"
