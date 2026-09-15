#!/usr/bin/env python3
"""Bounded CPU-only PyMuPDF adapter for Readify.

The adapter preserves source geometry and typography. It performs OCR only for
pages whose native text layer is unusable; semantic reconstruction remains in
the TypeScript Content boundary.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from typing import Any


LANGUAGE_TO_TESSERACT = {
    "ar": "ara", "de": "deu", "en": "eng", "es": "spa", "fr": "fra",
    "it": "ita", "nl": "nld", "pl": "pol", "pt": "por", "tr": "tur",
}


def bbox(value: Any) -> list[float] | None:
    if not isinstance(value, (list, tuple)) or len(value) != 4:
        return None
    return [round(float(item), 3) for item in value]


def safe_metadata(value: Any, limit: int) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = re.sub(r"[\x00-\x1f\x7f]", " ", value)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned[:limit] or None


def tesseract_version() -> str | None:
    command = shutil.which("tesseract")
    if not command:
        return None
    try:
        completed = subprocess.run(
            [command, "--version"], capture_output=True, text=True, timeout=2, check=False
        )
        first_line = completed.stdout.splitlines()[0] if completed.stdout else ""
        return safe_metadata(first_line, 80)
    except Exception:
        return None


def quality(text: str, word_count: int, image_ratio: float) -> tuple[str, float, list[str]]:
    visible = len(re.sub(r"\s", "", text))
    replacement_ratio = text.count("\ufffd") / max(1, len(text))
    controls = len(re.findall(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", text))
    warnings: list[str] = []
    if replacement_ratio > 0.02:
        warnings.append("high_replacement_character_ratio")
    if controls:
        warnings.append("unexpected_control_characters")
    if visible < 20 and image_ratio >= 0.25:
        return "ocr_required", 0.1, warnings + ["insufficient_native_text"]
    if visible == 0:
        return "ocr_required", 0.0, warnings + ["empty_native_text"]
    score = 1.0
    if visible < 80:
        score -= 0.25
        warnings.append("low_text_density")
    if word_count == 0 or visible / max(1, word_count) > 35:
        score -= 0.25
        warnings.append("suspicious_word_geometry")
    score -= min(0.5, replacement_ratio * 10)
    if controls:
        score -= 0.2
    return ("native_good" if score >= 0.8 else "native_suspicious"), max(0.0, score), warnings


def image_area_ratio(page: Any) -> float:
    page_area = max(1.0, float(page.rect.width * page.rect.height))
    area = 0.0
    try:
        for image in page.get_image_info():
            box = image.get("bbox")
            if box and len(box) == 4:
                area += max(0.0, box[2] - box[0]) * max(0.0, box[3] - box[1])
    except Exception:
        return 0.0
    return min(1.0, area / page_area)


def extract_page_structure(page: Any, text_page: Any | None = None) -> dict[str, Any]:
    kwargs = {"sort": False}
    if text_page is not None:
        kwargs["textpage"] = text_page
    data = page.get_text("dict", **kwargs)
    raw_parts: list[str] = []
    blocks: list[dict[str, Any]] = []
    scalar_cursor = 0
    line_lookup: dict[tuple[int, int], str] = {}

    for block_number, raw_block in enumerate(data.get("blocks", [])):
        if raw_block.get("type") != 0:
            continue
        lines: list[dict[str, Any]] = []
        block_text_parts: list[str] = []
        for line_number, raw_line in enumerate(raw_block.get("lines", [])):
            line_id = f"p{page.number + 1}:b{block_number}:l{line_number}"
            spans: list[dict[str, Any]] = []
            line_text = "".join(span.get("text", "") for span in raw_line.get("spans", []))
            line_start = scalar_cursor
            span_cursor = line_start
            for span_number, raw_span in enumerate(raw_line.get("spans", [])):
                span_text = raw_span.get("text", "")
                span_end = span_cursor + len(span_text)
                spans.append({
                    "id": f"{line_id}:s{span_number}", "text": span_text,
                    "bbox": bbox(raw_span.get("bbox")), "font": raw_span.get("font"),
                    "size": raw_span.get("size"), "flags": raw_span.get("flags"),
                    "sourceStartScalar": span_cursor, "sourceEndScalar": span_end,
                })
                span_cursor = span_end
            line_end = line_start + len(line_text)
            lines.append({
                "id": line_id, "text": line_text, "bbox": bbox(raw_line.get("bbox")),
                "sourceStartScalar": line_start, "sourceEndScalar": line_end,
                "spans": spans,
            })
            line_lookup[(block_number, line_number)] = line_id
            block_text_parts.append(line_text)
            raw_parts.extend([line_text, "\n"])
            scalar_cursor = line_end + 1
        if lines:
            block_id = f"p{page.number + 1}:b{block_number}"
            blocks.append({
                "id": block_id, "text": "\n".join(block_text_parts),
                "bbox": bbox(raw_block.get("bbox")), "order": len(blocks), "lines": lines,
            })
            raw_parts.append("\n")
            scalar_cursor += 1

    word_kwargs = {"sort": False}
    if text_page is not None:
        word_kwargs["textpage"] = text_page
    words: list[dict[str, Any]] = []
    for order, word in enumerate(page.get_text("words", **word_kwargs)):
        if len(word) < 8:
            continue
        block_number, line_number, word_number = int(word[5]), int(word[6]), int(word[7])
        words.append({
            "id": f"p{page.number + 1}:b{block_number}:l{line_number}:w{word_number}",
            "text": word[4], "bbox": bbox(word[:4]),
            "blockId": f"p{page.number + 1}:b{block_number}",
            "lineId": line_lookup.get((block_number, line_number)), "order": order,
        })
    raw_text = "".join(raw_parts).rstrip("\n")
    return {"rawText": raw_text, "text": raw_text, "blocks": blocks, "words": words}


def page_payload(page: Any, language: str) -> dict[str, Any]:
    try:
        structure = extract_page_structure(page)
        status, score, warnings = quality(
            structure["text"], len(structure["words"]), image_area_ratio(page)
        )
        used_ocr = False
        if status == "ocr_required":
            tesseract_language = LANGUAGE_TO_TESSERACT.get(language, language)
            try:
                text_page = page.get_textpage_ocr(
                    language=tesseract_language,
                    dpi=int(os.environ.get("READIFY_OCR_DPI", "300")), full=True,
                )
                ocr_structure = extract_page_structure(page, text_page)
                if ocr_structure["text"].strip():
                    structure, used_ocr, score = ocr_structure, True, 0.7
                    warnings = [item for item in warnings if item != "empty_native_text"]
                else:
                    warnings.append("ocr_returned_empty_text")
            except Exception as exc:
                warnings.append(f"ocr_unavailable:{type(exc).__name__}")
        if not structure["text"].strip() and not used_ocr:
            status, score = "failed", 0.0
        return {
            "number": page.number + 1, "width": round(float(page.rect.width), 3),
            "height": round(float(page.rect.height), 3), "rotation": int(page.rotation),
            **structure, "ocr": used_ocr, "qualityStatus": status,
            "qualityScore": score, "warnings": warnings,
        }
    except Exception as exc:
        return {
            "number": page.number + 1, "width": round(float(page.rect.width), 3),
            "height": round(float(page.rect.height), 3), "rotation": int(page.rotation),
            "rawText": "", "text": "", "blocks": [], "words": [], "ocr": False,
            "qualityStatus": "failed", "qualityScore": 0.0,
            "warnings": [f"page_extraction_failed:{type(exc).__name__}"],
        }


def main(path: str, language: str, skipped_pages: set[int]) -> None:
    try:
        import fitz
    except ModuleNotFoundError as exc:
        raise SystemExit(f"No module named 'fitz': {exc}")

    document = fitz.open(path)
    if document.needs_pass:
        raise SystemExit("pdf_password_required")
    outline = []
    for entry in document.get_toc(simple=True)[:10_000]:
        title = safe_metadata(entry[1], 300) if len(entry) >= 2 else None
        if len(entry) >= 3 and title and int(entry[2]) > 0:
            outline.append({
                "level": max(1, min(20, int(entry[0]))),
                "title": title,
                "pageNumber": int(entry[2]),
            })
    print(json.dumps({
        "type": "document", "outline": outline,
        "metadata": {
            "title": safe_metadata((document.metadata or {}).get("title"), 200),
            "author": safe_metadata((document.metadata or {}).get("author"), 300),
        },
        "extractor": {
            "name": "pymupdf", "version": fitz.VersionBind,
            "ocrEngine": {"name": "tesseract", "version": tesseract_version()},
            "configuration": {
                "language": language,
                "tesseractLanguage": LANGUAGE_TO_TESSERACT.get(language, language),
                "ocrDpi": int(os.environ.get("READIFY_OCR_DPI", "300")),
            },
        },
    }, ensure_ascii=False, separators=(",", ":")), flush=True)
    for page in document:
        if page.number + 1 in skipped_pages:
            continue
        print(json.dumps(
            {"type": "page", "page": page_payload(page, language)},
            ensure_ascii=False, separators=(",", ":")
        ), flush=True)
    print('{"type":"complete"}', flush=True)


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3, 4):
        raise SystemExit("usage: extract_pdf.py PATH [BCP47_LANGUAGE] [SKIP_PAGES_CSV]")
    skipped = {
        int(value) for value in (sys.argv[3].split(",") if len(sys.argv) == 4 else [])
        if value.isdigit() and int(value) > 0
    }
    main(sys.argv[1], sys.argv[2] if len(sys.argv) >= 3 else "und", skipped)
