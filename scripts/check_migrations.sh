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
pnpm --filter @readify/platform migrate
pnpm --filter @readify/platform migrate
echo "migration clean apply, representative upgrade, and idempotent re-run: PASS"
