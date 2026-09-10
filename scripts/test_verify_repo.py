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


if __name__ == "__main__":
    unittest.main()
