from __future__ import annotations

import tempfile
import unittest
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path

from verify_repo import (
    Failure,
    application_runtime_markers,
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


if __name__ == "__main__":
    unittest.main()
