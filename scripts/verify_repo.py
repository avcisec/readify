#!/usr/bin/env python3
"""Dependency-free checks for the repository foundation."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FIRST_PARTY_ROOT_FILES = {
    ".editorconfig",
    ".env.example",
    ".gitignore",
    "AGENTS.md",
    "ARCHITECTURE.md",
    "Makefile",
    "README.md",
}
REQUIRED_FILES = {
    "README.md",
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/product/README.md",
    "docs/product/mvp-scope.md",
    "docs/product/user-flows.md",
    "docs/product/screen-inventory.md",
    "docs/product/interaction-model.md",
    "docs/product/wireframes.md",
    "docs/product/ux-decisions.md",
    "docs/product/open-questions.md",
    "docs/product/first-slice-implementation-readiness.md",
    "docs/product/fixtures/README.md",
    "docs/product/fixtures/french-reader-acceptance.txt",
    "docs/architecture/overview.md",
    "docs/architecture/domain-boundaries.md",
    "docs/architecture/data-flow.md",
    "docs/architecture/background-jobs.md",
    "docs/architecture/storage.md",
    "docs/architecture/pasted-text-slice-contracts.md",
    "docs/architecture/scaling.md",
    "docs/decisions/README.md",
    "docs/decisions/0001-modular-monolith-and-workers.md",
    "docs/decisions/0002-technology-baseline.md",
    "docs/decisions/0003-durable-jobs-and-artifacts.md",
    "docs/decisions/0004-atomic-durable-handoff.md",
    "docs/decisions/0005-versioned-json-http-contracts.md",
    "docs/decisions/0006-kysely-and-sql-first-migrations.md",
    "docs/quality/testing-strategy.md",
    "docs/quality/security.md",
    "docs/quality/performance.md",
    "docs/quality/ai-quality-evaluation.md",
    "docs/quality/development-lifecycle.md",
    "docs/quality/accessibility.md",
    "docs/operations/environments.md",
    "docs/operations/observability.md",
    "docs/operations/deployment.md",
    "docs/product-specs/README.md",
    "docs/product-specs/pasted-text-reader-learning-loop.md",
    "docs/exec-plans/README.md",
    "docs/exec-plans/completed/README.md",
}
LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
RUNTIME_MARKER_PATHS = (
    "package.json",
    "pnpm-workspace.yaml",
    "pyproject.toml",
    "Cargo.toml",
    "go.mod",
    "apps",
    "packages",
    "src",
)
MIGRATION_SEARCH_ROOTS = ("migrations", "apps", "packages", "src")
WALK_IGNORES = {".git", ".next", "__pycache__", "docs", "linguacafe", "node_modules"}


class Failure(Exception):
    pass


def application_runtime_markers(root: Path = ROOT) -> list[str]:
    return [relative for relative in RUNTIME_MARKER_PATHS if (root / relative).exists()]


def migration_directories(root: Path = ROOT) -> list[Path]:
    found: list[Path] = []
    direct = root / "migrations"
    if direct.is_dir():
        found.append(direct)
    for relative in MIGRATION_SEARCH_ROOTS[1:]:
        search_root = root / relative
        if not search_root.is_dir():
            continue
        for current, directories, _ in os.walk(search_root, onerror=lambda _: None):
            directories[:] = [name for name in directories if name not in WALK_IGNORES]
            path = Path(current)
            if path.name == "migrations":
                found.append(path)
                directories.clear()
    return sorted(set(found))


def require_foundation_only(name: str, root: Path = ROOT) -> None:
    markers = application_runtime_markers(root)
    if markers:
        rendered = ", ".join(markers)
        raise Failure(
            f"{name} is still foundation-only, but application runtime markers exist: {rendered}. "
            "Wire the corresponding real repository-native check before adding application code."
        )


def skip_foundation_check(name: str, reason: str, root: Path = ROOT) -> None:
    require_foundation_only(name, root)
    skipped(name, reason)


def first_party_files() -> list[Path]:
    files: list[Path] = []
    for name in FIRST_PARTY_ROOT_FILES:
        path = ROOT / name
        if path.is_file():
            files.append(path)
    for directory in (ROOT / "docs", ROOT / "scripts", ROOT / ".github", ROOT / "apps", ROOT / "packages", ROOT / "tests"):
        if not directory.exists():
            continue
        for path in directory.rglob("*"):
            relative = path.relative_to(ROOT).as_posix()
            if path.is_file() and "docs/research" not in relative and not any(part in {".next", "dist", "node_modules"} for part in path.parts):
                files.append(path)
    return sorted(set(files))


def check_format() -> None:
    errors: list[str] = []
    for path in first_party_files():
        if path.suffix not in {".md", ".py", ".yml", ".yaml", ".example", ""} and path.name != ".editorconfig":
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            errors.append(f"{path.relative_to(ROOT)}: not UTF-8")
            continue
        if text and not text.endswith("\n"):
            errors.append(f"{path.relative_to(ROOT)}: missing final newline")
        for line_number, line in enumerate(text.splitlines(), 1):
            if line.rstrip(" \t") != line:
                errors.append(f"{path.relative_to(ROOT)}:{line_number}: trailing whitespace")
    if errors:
        raise Failure("\n".join(errors))


def check_docs() -> None:
    errors: list[str] = []
    markdown_files = sorted((ROOT / "docs").rglob("*.md")) + [
        ROOT / "README.md",
        ROOT / "AGENTS.md",
        ROOT / "ARCHITECTURE.md",
    ]
    for path in markdown_files:
        text = path.read_text(encoding="utf-8")
        for match in LINK_RE.finditer(text):
            target = match.group(1).strip().strip("<>")
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            clean_target = target.split("#", 1)[0]
            if not clean_target:
                continue
            if not (path.parent / clean_target).resolve().exists():
                errors.append(f"{path.relative_to(ROOT)}: missing link target {target}")
    errors.extend(documentation_context_errors())
    if errors:
        raise Failure("\n".join(errors))


def documentation_context_errors(root: Path = ROOT) -> list[str]:
    errors: list[str] = []
    agents = root / "AGENTS.md"
    if agents.is_file():
        text = agents.read_text(encoding="utf-8")
        if len(text.splitlines()) > 80:
            errors.append("AGENTS.md: operational router exceeds 80 lines")
        for marker in ("## Task routing", "Never bulk-read", "relevant active plan"):
            if marker.casefold() not in text.casefold():
                errors.append(f"AGENTS.md: missing context-routing rule {marker}")

    active = root / "docs/exec-plans/active"
    active_plans = sorted(active.glob("*.md")) if active.is_dir() else []
    if len(active_plans) > 3:
        errors.append(
            f"docs/exec-plans/active: {len(active_plans)} plans exceed the context budget of 3"
        )

    completed = root / "docs/exec-plans/completed"
    completed_details = (
        sorted(path for path in completed.glob("*.md") if path.name != "README.md")
        if completed.is_dir()
        else []
    )
    if completed_details:
        rendered = ", ".join(path.name for path in completed_details)
        errors.append(
            "docs/exec-plans/completed: summarize accepted plans in README.md; "
            f"historical detail belongs in Git ({rendered})"
        )

    docs = root / "docs"
    if docs.is_dir():
        for path in docs.rglob("*.md"):
            relative = path.relative_to(docs)
            if relative.parts[0] in {"research"} or relative.as_posix() == "exec-plans/completed/README.md":
                continue
            lines = len(path.read_text(encoding="utf-8").splitlines())
            if lines > 500:
                errors.append(
                    f"docs/{relative.as_posix()}: {lines} lines exceed the active-document budget of 500; split by owning concern"
                )
    return errors


def check_product() -> None:
    required_sections = {
        "docs/product/user-flows.md": ("## Primary product loop", "## Audio and synchronization", "## Review session"),
        "docs/product/screen-inventory.md": ("## 5. Reader", "## Modal/dialog policy"),
        "docs/product/interaction-model.md": ("## Responsive structure", "## Accessibility constraints", "## Backend/API Implications"),
        "docs/product/wireframes.md": ("## Reader Page View", "## Review", "## Progress"),
        "docs/product/ux-decisions.md": ("## Open decisions requiring approval", "**Recommended default:**", "**Impact if changed later:**"),
        "docs/product-specs/pasted-text-reader-learning-loop.md": ("## Outcome", "## In scope", "## Acceptance scenarios", "## Backend/API Implications", "## Implementation readiness and deferred production gates"),
        "docs/product/first-slice-implementation-readiness.md": ("## Blocker test", "## Decision summary", "No unresolved implementation blocker remains", "50,000-scalar", "WCAG 2.2 Level AA", "CC0 1.0"),
        "docs/quality/accessibility.md": ("## Implementation verification baseline", "## Public support matrix deferred", "WCAG 2.2 Level AA"),
    }
    errors: list[str] = []
    for relative, markers in required_sections.items():
        path = ROOT / relative
        if not path.is_file():
            errors.append(f"{relative}: missing product contract")
            continue
        text = path.read_text(encoding="utf-8")
        for marker in markers:
            if marker not in text:
                errors.append(f"{relative}: missing required section/field {marker}")

    pasted_text_contracts = {
        "idea.md": "doğrudan yapıştırdığı düz metni",
        "FEATURES.md": "Düz metin yapıştırma",
        "docs/product/user-flows.md": "large multiline field",
        "docs/product/screen-inventory.md": "large multiline plain-text field",
        "docs/product/wireframes.md": "[Paste text ✓]",
        "docs/product-specs/pasted-text-reader-learning-loop.md": "50,000 Unicode scalar values",
    }
    for relative, marker in pasted_text_contracts.items():
        path = ROOT / relative
        if not path.is_file() or marker not in path.read_text(encoding="utf-8"):
            errors.append(f"{relative}: missing pasted-text product contract {marker}")

    obsolete_spec = ROOT / "docs/product-specs/txt-reader-learning-loop.md"
    if obsolete_spec.exists():
        errors.append("docs/product-specs/txt-reader-learning-loop.md: obsolete TXT upload contract must not exist")

    fixture = ROOT / "docs/product/fixtures/french-reader-acceptance.txt"
    if not fixture.is_file():
        errors.append("docs/product/fixtures/french-reader-acceptance.txt: missing approved fixture")
    else:
        fixture_text = fixture.read_text(encoding="utf-8")
        first_line = fixture_text.splitlines()[0] if fixture_text else ""
        fixture_markers = ("🥐", "<bonjour>", "**important**", "mange", "mangeaient", "parle", "parlaient")
        if len(first_line) <= 80:
            errors.append("docs/product/fixtures/french-reader-acceptance.txt: first line must exercise 80-scalar title truncation")
        for marker in fixture_markers:
            if marker not in fixture_text:
                errors.append(f"docs/product/fixtures/french-reader-acceptance.txt: missing acceptance marker {marker}")
    if errors:
        raise Failure("\n".join(errors))


def check_architecture() -> None:
    missing = sorted(path for path in REQUIRED_FILES if not (ROOT / path).is_file())
    if missing:
        raise Failure("missing required repository contracts:\n" + "\n".join(missing))
    boundaries = (ROOT / "docs/architecture/domain-boundaries.md").read_text(encoding="utf-8")
    for marker in ("Allowed dependency direction", "External provider boundaries", "Extraction criteria"):
        if marker not in boundaries:
            raise Failure(f"domain-boundaries.md is missing section: {marker}")
    slice_contract = (ROOT / "docs/architecture/pasted-text-slice-contracts.md").read_text(encoding="utf-8")
    for marker in (
        "## Shared HTTP conventions",
        "### Transaction boundaries",
        "## Authorization and privacy matrix",
        "## Mechanical verification required during implementation",
        "## Acceptance traceability",
        "## Implementation decisions and deferred rollout gates",
    ):
        if marker not in slice_contract:
            raise Failure(f"pasted-text slice contract is missing section: {marker}")
    agents = (ROOT / "AGENTS.md").read_text(encoding="utf-8")
    for marker in ("make verify", "Migration", "Definition of done", "independent review"):
        if marker.casefold() not in agents.casefold():
            raise Failure(f"AGENTS.md is missing operational rule: {marker}")
    lifecycle = (ROOT / "docs/quality/development-lifecycle.md").read_text(encoding="utf-8")
    for severity in ("BLOCKER", "MAJOR", "MINOR", "PASS"):
        if severity not in lifecycle:
            raise Failure(f"development lifecycle is missing review severity: {severity}")
    adr_errors: list[str] = []
    for path in sorted((ROOT / "docs/decisions").glob("[0-9][0-9][0-9][0-9]-*.md")):
        text = path.read_text(encoding="utf-8")
        for marker in ("- Status:", "- Date:", "## Context", "## Choice", "## Reasons", "## Alternatives", "## Tradeoffs and migration difficulty"):
            if marker not in text:
                adr_errors.append(f"{path.relative_to(ROOT)}: missing ADR field {marker}")
    if adr_errors:
        raise Failure("\n".join(adr_errors))


def check_migrations() -> None:
    policy = ROOT / "docs/architecture/storage.md"
    if not policy.is_file() or "expand/migrate/contract" not in policy.read_text(encoding="utf-8"):
        raise Failure("storage documentation must define the migration policy")
    migration_dirs = migration_directories()
    if migration_dirs:
        rendered = "\n".join(str(path.relative_to(ROOT)) for path in migration_dirs)
        raise Failure(
            "migration directories exist but migration execution is not wired into make migration-check:\n" + rendered
        )
    skipped("application migration execution", "no application schema yet")


def check_security() -> None:
    forbidden_names: list[str] = []
    for path in ROOT.rglob(".env"):
        if "linguacafe" not in path.parts:
            forbidden_names.append(str(path.relative_to(ROOT)))
    if forbidden_names:
        raise Failure("unignored environment files found:\n" + "\n".join(forbidden_names))
    private_key = "-----BEGIN " + "PRIVATE KEY-----"
    for path in first_party_files():
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if private_key in text:
            raise Failure(f"possible private key in {path.relative_to(ROOT)}")
    gitignore = (ROOT / ".gitignore").read_text(encoding="utf-8")
    if not re.search(r"(?m)^\.env$", gitignore) or "!.env.example" not in gitignore:
        raise Failure(".gitignore must ignore .env while allowing .env.example")


def skipped(name: str, reason: str) -> None:
    print(f"  SKIP {name} ({reason})")


CHECKS = {
    "format": check_format,
    "docs": check_docs,
    "product": check_product,
    "architecture": check_architecture,
    "migrations": check_migrations,
    "security": check_security,
}


def run(name: str) -> None:
    if name in CHECKS:
        print(f"[verify] {name}")
        CHECKS[name]()
        print(f"  PASS {name}")
    elif name == "typecheck":
        skip_foundation_check("typecheck", "application runtime intentionally not initialized")
    elif name == "test":
        skip_foundation_check("unit/domain tests", "no application code exists")
    elif name == "integration":
        skip_foundation_check("integration/API tests", "no application or test services exist")
    elif name == "e2e":
        skip_foundation_check("E2E checks", "no application runtime exists")
    else:
        raise Failure(f"unknown check: {name}")


def main() -> int:
    command = sys.argv[1] if len(sys.argv) > 1 else "all"
    if command == "help":
        print("make verify            Run every repository check")
        print("make format-check      Check text formatting")
        print("make lint              Validate local documentation links")
        print("make product-check     Validate product-flow and UX contracts")
        print("make typecheck         Run or report application type checks")
        print("make test              Run or report unit/domain tests")
        print("make integration-test  Run or report integration/API tests")
        print("make architecture-check Validate required architecture contracts")
        print("make migration-check   Validate migration policy/schema when present")
        print("make security-check    Check baseline secret hygiene")
        print("make e2e               Run or report end-to-end checks")
        return 0
    names = ["format", "docs", "product", "architecture", "migrations", "security", "typecheck", "test", "integration"] if command == "all" else [command]
    try:
        for name in names:
            run(name)
    except Failure as error:
        print(f"  FAIL {error}", file=sys.stderr)
        return 1
    print("[verify] repository verification complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
