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
pnpm --filter @readify/platform migrate:reset
pnpm vitest run packages/platform/src/service.integration.test.ts
