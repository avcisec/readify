# Readify

Readify is an AI-assisted language-learning platform that turns user-selected text and media into a synchronized reading, listening, vocabulary, and review experience. The initial quality target is French for learners around late A2 to early B1.

This repository contains the executable first vertical slice: deterministic non-production passwordless entry, a French learning profile, pasted-text import, durable PostgreSQL processing, Page Reader, explicit vocabulary state/Undo, semantic resume, and honest minimal Progress. It is suitable for local/test/synthetic preview validation, **not production launch**: managed identity/email and a licensed French→Turkish meaning source remain production gates. [idea.md](idea.md) and [FEATURES.md](FEATURES.md) remain product truth.

## Start here

1. Read [AGENTS.md](AGENTS.md) for the operational repository map.
2. Read the relevant product spec and [open questions](docs/product/open-questions.md).
3. Read [ARCHITECTURE.md](ARCHITECTURE.md) and the relevant domain boundary.
4. For a non-trivial change, create an execution plan in `docs/exec-plans/active/`.
5. Run `make verify` before handoff.

## Repository map

| Path | Purpose |
| --- | --- |
| `docs/product/` | Product interpretation, MVP boundary, flows, and uncertainties |
| `docs/product-specs/` | Acceptance-ready specs written before feature work |
| `docs/architecture/` | System shape, dependencies, data/jobs/storage, and scaling |
| `docs/decisions/` | Architecture Decision Records (ADRs) |
| `docs/quality/` | Testing, security, performance, AI quality, and lifecycle rules |
| `docs/operations/` | Environment, observability, and deployment contracts |
| `docs/exec-plans/` | Active and completed plans for non-trivial work |
| `docs/research/` | Evidence and competitor analysis; not requirements by itself |
| `scripts/` | Dependency-free repository checks |
| `linguacafe/` | Ignored local competitor snapshot; not Readify application code |

## Verification

```bash
make verify-docs # documentation and execution-plan-only changes
make verify
make e2e        # additionally, when browser/user-flow behavior is affected
```

`make verify-docs` is the fast text/product-contract gate. `make verify` runs formatting, lint, type checks, unit/domain tests, real-PostgreSQL integration evidence, architecture rules, clean/idempotent migrations, dependency audit, secret hygiene, and product/document checks. `make e2e` separately runs the critical flow and responsive/accessibility assertions on Chromium, Firefox, and WebKit. Choose the required tier from the [testing strategy](docs/quality/testing-strategy.md); mixed or ambiguous changes use every applicable broader gate.

On a fresh Linux machine, install the browser engines and their OS libraries once before E2E:

```bash
pnpm exec playwright install --with-deps chromium firefox webkit
```

CI performs this step explicitly; missing host libraries must not be mistaken for an application-test failure.

The disposable test database uses loopback port `55432` by default. When that port is unavailable, run verification with an explicit free port, for example `READIFY_TEST_DB_PORT=55433 make e2e`; the same override works with `make verify`.

## Local development

Prerequisites are the pinned Node version, Corepack, Docker, and Python 3.12. Then:

```bash
corepack enable
pnpm install --frozen-lockfile
docker compose up -d postgres
pnpm --filter @readify/platform migrate
pnpm dev
```

The local PostgreSQL container binds only to `127.0.0.1:55431` to avoid a typical system PostgreSQL collision. Migration, web, and worker share this safe local default; set `DATABASE_URL` only when overriding it.

In a second terminal run `pnpm dev:worker`. Open `http://localhost:3000/sign-in`; local/test mode exposes a clearly labeled local proof link instead of sending real email. Copy `.env.example` to an untracked `.env` only when overriding defaults. The application and worker expose `/health/live` and `/health/ready` (worker defaults to port 3001).

PDF import additionally needs the pinned CPU extractor. OCR is optional and is used only for pages without usable native text:

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements-pdf.txt
# Debian/Ubuntu, for scanned French pages:
sudo apt-get install tesseract-ocr tesseract-ocr-fra
export PYTHON="$PWD/.venv/bin/python"
pnpm dev:worker
```

See the [PDF reconstruction contract](docs/architecture/pdf-import-contract.md) for quality states and limitations.

## Current technical direction

Readify is a modular monolith with a separately runnable asynchronous worker and PostgreSQL as both source of truth and durable queue. Pasted text stays transactionally in PostgreSQL; PDF files currently use bounded local storage and must move to shared object storage before multi-host workers. External provider choices stay behind contracts and deterministic adapters fail closed in production. See [Architecture](ARCHITECTURE.md), the [slice contracts](docs/architecture/), and [ADRs](docs/decisions/README.md).
