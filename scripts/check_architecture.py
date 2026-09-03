#!/usr/bin/env python3
"""Small dependency guard for the slice; deliberately not a framework."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []

for path in (ROOT / "packages" / "modules").rglob("*.ts"):
    source = path.read_text(encoding="utf-8")
    for forbidden in ("next/", "kysely", "pg", "@readify/platform", "stanza"):
        if re.search(rf"(?:from|import\()\s*['\"]{re.escape(forbidden)}", source):
            errors.append(f"{path.relative_to(ROOT)} imports forbidden boundary {forbidden}")

for path in (ROOT / "packages").rglob("*.ts"):
    if "node_modules" in path.parts:
        continue
    source = path.read_text(encoding="utf-8")
    if re.search(r"from\s+['\"]@readify/[^'\"]+/src/", source):
        errors.append(f"{path.relative_to(ROOT)} imports another package's internals")

for package, forbidden in {
    "contracts": ("@readify/modules", "@readify/platform", "next/", "kysely", "pg"),
    "modules": ("@readify/platform", "next/", "kysely", "pg"),
}.items():
    for path in (ROOT / "packages" / package).rglob("*.ts"):
        source = path.read_text(encoding="utf-8")
        for dependency in forbidden:
            if dependency in source:
                errors.append(f"{path.relative_to(ROOT)} violates inward dependency direction with {dependency}")

for path in (ROOT / "apps" / "web").rglob("*.ts"):
    if any(part in {".next", "node_modules"} for part in path.parts):
        continue
    source = path.read_text(encoding="utf-8")
    if 'from "kysely"' in source or 'from "pg"' in source:
        errors.append(f"{path.relative_to(ROOT)} bypasses the application/platform boundary")

service = (ROOT / "packages/platform/src/service.ts").read_text(encoding="utf-8")
if "implements SliceApplication" not in service:
    errors.append("packages/platform/src/service.ts must mechanically implement the public slice application contract")

application_contract = (ROOT / "packages/modules/src/application/index.ts").read_text(encoding="utf-8")
if "Promise<unknown>" in application_contract:
    errors.append("public slice application results must be concrete types, not Promise<unknown>")

for path in (ROOT / "apps/web/app/api/v1").rglob("route.ts"):
    source = path.read_text(encoding="utf-8")
    if "jsonBody<" in source:
        errors.append(f"{path.relative_to(ROOT)} bypasses the repository-owned request schemas")

if errors:
    print("\n".join(errors), file=sys.stderr)
    raise SystemExit(1)

print("architecture boundaries: PASS")
