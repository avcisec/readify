from __future__ import annotations

import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path

from verify_repo import (
    Failure,
    application_runtime_markers,
    documentation_context_errors,
    migration_directories,
    require_foundation_only,
    skip_foundation_check,
    verification_routing_errors,
)


class FoundationTransitionGuardTests(unittest.TestCase):
    def test_empty_repository_allows_foundation_skip(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)

            self.assertEqual([], application_runtime_markers(root))
            with redirect_stdout(StringIO()):
                skip_foundation_check("typecheck", "no runtime", root)

    def test_manifest_requires_real_application_check(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "package.json").touch()

            with self.assertRaisesRegex(Failure, "package.json"):
                skip_foundation_check("typecheck", "no runtime", root)

            with self.assertRaisesRegex(Failure, "format check"):
                require_foundation_only("format check", root)

    def test_source_root_requires_real_application_check(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "apps").mkdir()

            self.assertEqual(["apps"], application_runtime_markers(root))

    def test_nested_migration_directory_is_detected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            expected = root / "apps" / "api" / "migrations"
            expected.mkdir(parents=True)

            self.assertEqual([expected], migration_directories(root))

    def test_documentation_context_budget_accepts_routed_history(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs/exec-plans/active").mkdir(parents=True)
            (root / "docs/exec-plans/completed").mkdir(parents=True)
            (root / "docs/exec-plans/completed/README.md").write_text(
                "# History\n", encoding="utf-8"
            )
            (root / "AGENTS.md").write_text(
                "# Guide\n## Task routing\nNever bulk-read docs. Read the relevant active plan.\n",
                encoding="utf-8",
            )

            self.assertEqual([], documentation_context_errors(root))

    def test_documentation_context_budget_rejects_plan_sprawl(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            active = root / "docs/exec-plans/active"
            completed = root / "docs/exec-plans/completed"
            active.mkdir(parents=True)
            completed.mkdir(parents=True)
            for index in range(4):
                (active / f"plan-{index}.md").write_text("# Plan\n", encoding="utf-8")
            (completed / "old-plan.md").write_text("# Old\n", encoding="utf-8")
            product = root / "docs/product"
            product.mkdir(parents=True)
            (product / "oversized.md").write_text("line\n" * 501, encoding="utf-8")
            (root / "AGENTS.md").write_text(
                "# Guide\n## Task routing\nNever bulk-read docs. Read the relevant active plan.\n",
                encoding="utf-8",
            )

            errors = documentation_context_errors(root)
            self.assertTrue(any("exceed the context budget" in error for error in errors))
            self.assertTrue(any("historical detail belongs in Git" in error for error in errors))
            self.assertTrue(any("active-document budget" in error for error in errors))

    def test_verification_routing_accepts_separate_gates(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            workflows = root / ".github/workflows"
            workflows.mkdir(parents=True)
            (root / "Makefile").write_text("verify-docs:\n", encoding="utf-8")
            (root / "AGENTS.md").write_text(
                "make verify-docs\nmake verify\nmake e2e\n", encoding="utf-8"
            )
            (workflows / "docs.yml").write_text(
                "pull_request:\npush:\n**/*.md\nmake verify-docs\n", encoding="utf-8"
            )
            (workflows / "verify.yml").write_text(
                "pull_request:\npush:\npaths-ignore:\nmake verify\n", encoding="utf-8"
            )
            (workflows / "browser.yml").write_text(
                "pull_request:\npush:\napps/web/**\npackages/platform/**\ntests/e2e/**\n"
                "docs/product/fixtures/**\nscripts/start_e2e.sh\ncompose.yaml\npnpm-lock.yaml\nmake e2e\n",
                encoding="utf-8",
            )

            self.assertEqual([], verification_routing_errors(root))

    def test_verification_routing_rejects_expensive_docs_and_embedded_browser(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            workflows = root / ".github/workflows"
            workflows.mkdir(parents=True)
            (root / "Makefile").write_text("verify-docs:\n", encoding="utf-8")
            (root / "AGENTS.md").write_text(
                "make verify-docs\nmake verify\nmake e2e\n", encoding="utf-8"
            )
            (workflows / "docs.yml").write_text(
                "pull_request:\npush:\n**/*.md\nmake verify-docs\npnpm install\n",
                encoding="utf-8",
            )
            (workflows / "verify.yml").write_text(
                "pull_request:\npush:\npaths-ignore:\nmake verify\nmake e2e\n",
                encoding="utf-8",
            )
            (workflows / "browser.yml").write_text(
                "pull_request:\npush:\napps/web/**\ntests/e2e/**\nmake e2e\n",
                encoding="utf-8",
            )

            errors = verification_routing_errors(root)
            self.assertTrue(any("must not install" in error for error in errors))
            self.assertTrue(any("belongs in browser.yml" in error for error in errors))
            self.assertTrue(any("packages/platform/**" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
