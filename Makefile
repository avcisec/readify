.PHONY: help verify format-check lint product-check typecheck test integration-test architecture-check migration-check security-check e2e

PYTHON ?= python3

help:
	@$(PYTHON) scripts/verify_repo.py help

verify:
	@$(PYTHON) -m unittest discover -s scripts -p 'test_*.py'
	@pnpm format:check
	@pnpm lint
	@pnpm typecheck
	@pnpm test
	@pnpm test:integration
	@pnpm architecture:check
	@pnpm migrations:check
	@pnpm security:check
	@$(PYTHON) scripts/verify_repo.py product
	@$(PYTHON) scripts/verify_repo.py docs

format-check:
	@pnpm format:check

lint:
	@pnpm lint
	@$(PYTHON) scripts/verify_repo.py docs

product-check:
	@$(PYTHON) scripts/verify_repo.py product

typecheck:
	@pnpm typecheck

test:
	@pnpm test

integration-test:
	@pnpm test:integration

architecture-check:
	@pnpm architecture:check

migration-check:
	@pnpm migrations:check

security-check:
	@pnpm security:check

e2e:
	@pnpm test:e2e
