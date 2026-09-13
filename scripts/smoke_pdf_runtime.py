#!/usr/bin/env python3
"""Exercise the real pinned PyMuPDF/Tesseract process boundary.

This is intentionally a small runtime smoke test, not a reconstruction-quality
benchmark. It proves that a native page stays native and that an image-only page
uses OCR in the same subprocess protocol used by the worker.
"""

from __future__ import annotations

import json
import pathlib
import subprocess
import sys
import tempfile

import fitz


ROOT = pathlib.Path(__file__).resolve().parents[1]
EXTRACTOR = ROOT / "scripts" / "extract_pdf.py"


def build_fixture(path: pathlib.Path) -> None:
    source = fitz.open()
    native = source.new_page(width=595, height=842)
    native.insert_textbox(
        fitz.Rect(72, 72, 523, 770),
        (
            "Chapitre premier\n\n"
            "Bonjour, Élise écoute une histoire française. "
            "Cette page possède une couche de texte native fiable. "
        )
        * 8,
        fontsize=12,
    )

    raster_source = fitz.open()
    raster_page = raster_source.new_page(width=595, height=842)
    raster_page.insert_textbox(
        fitz.Rect(72, 90, 523, 740),
        "Bonjour depuis une page numérisée. Les accents restent visibles: été, forêt, élève.",
        fontsize=20,
    )
    png = raster_page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False).tobytes("png")
    scanned = source.new_page(width=595, height=842)
    scanned.insert_image(scanned.rect, stream=png)
    source.save(path)
    raster_source.close()
    source.close()


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="readify-pdf-smoke-") as directory:
        pdf = pathlib.Path(directory) / "native-and-scanned.pdf"
        build_fixture(pdf)
        completed = subprocess.run(
            [sys.executable, str(EXTRACTOR), str(pdf), "fr"],
            check=False,
            capture_output=True,
            text=True,
            timeout=120,
        )
        if completed.returncode != 0:
            raise SystemExit(f"PDF extractor failed: {completed.stderr.strip()}")
        events = [json.loads(line) for line in completed.stdout.splitlines() if line]
        pages = [event["page"] for event in events if event.get("type") == "page"]
        if len(pages) != 2:
            raise SystemExit(f"expected 2 page events, got {len(pages)}")
        native, scanned = pages
        if native["ocr"] or native["qualityStatus"] != "native_good":
            raise SystemExit("usable native text was unexpectedly sent through OCR")
        if not scanned["ocr"]:
            raise SystemExit("image-only page did not use the OCR fallback")
        if "bonjour" not in scanned["text"].casefold():
            raise SystemExit("OCR fallback did not return readable fixture text")
        print("PDF runtime smoke: native extraction + selective French OCR PASS")


if __name__ == "__main__":
    main()
