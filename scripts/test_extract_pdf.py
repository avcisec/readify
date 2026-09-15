import importlib.util
import pathlib
import unittest


SCRIPT = pathlib.Path(__file__).with_name("extract_pdf.py")
SPEC = importlib.util.spec_from_file_location("readify_extract_pdf", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class PdfExtractionPolicyTest(unittest.TestCase):
    def test_good_native_text_does_not_request_ocr(self):
        text = "Élise ouvre la porte et commence une longue histoire. " * 4
        status, score, warnings = MODULE.quality(text, 36, 0.0)
        self.assertEqual(status, "native_good")
        self.assertGreaterEqual(score, 0.65)
        self.assertNotIn("insufficient_native_text", warnings)

    def test_scanned_image_page_requests_ocr(self):
        status, score, warnings = MODULE.quality("", 0, 0.95)
        self.assertEqual(status, "ocr_required")
        self.assertLess(score, 0.2)
        self.assertIn("insufficient_native_text", warnings)

    def test_short_native_page_is_flagged_without_forcing_ocr(self):
        status, _, warnings = MODULE.quality("Avant-propos", 1, 0.0)
        self.assertEqual(status, "native_suspicious")
        self.assertIn("low_text_density", warnings)


if __name__ == "__main__":
    unittest.main()
