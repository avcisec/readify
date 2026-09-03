#!/usr/bin/env bash
set -euo pipefail

docker compose up -d postgres-test
until docker compose exec -T postgres-test pg_isready -U readify -d readify_test >/dev/null 2>&1; do
  sleep 1
done

export APP_ENV=test
export DATABASE_URL="postgresql://readify:readify@127.0.0.1:55432/readify_test"
export IDENTITY_ADAPTER=outbox
export MEANING_ADAPTER=fixture
export LANGUAGE_ANALYZER_ADAPTER=recorded
export WORKER_HEALTH_PORT=3101
pnpm --filter @readify/platform migrate:reset

pnpm --filter @readify/web dev --hostname 127.0.0.1 --port 3100 &
web_pid=$!
pnpm --filter @readify/worker dev &
worker_pid=$!

cleanup() {
  kill "$web_pid" "$worker_pid" 2>/dev/null || true
  docker compose stop postgres-test >/dev/null
}
trap cleanup EXIT INT TERM
wait -n "$web_pid" "$worker_pid"
