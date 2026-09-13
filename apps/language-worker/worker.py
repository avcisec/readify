#!/usr/bin/env python3
"""Bounded JSON-lines Stanza adapter. Model downloads are an explicit setup step."""

from __future__ import annotations

import json
import os
import sys


MAX_SCALARS = 50_000


def main() -> int:
    try:
        import stanza
    except ImportError:
        sys.stderr.write("stanza is not installed; use the recorded adapter for normal tests\n")
        return 2

    pipelines = {}
    for line in sys.stdin:
        request = json.loads(line)
        text = request.get("text")
        language = request.get("language", "fr")
        if not isinstance(text, str) or len(text) > MAX_SCALARS:
            print(json.dumps({"error": "invalid_input"}), flush=True)
            continue
        if not isinstance(language, str) or not 2 <= len(language) <= 12:
            print(json.dumps({"error": "invalid_language"}), flush=True)
            continue
        if language not in pipelines:
            pipelines[language] = stanza.Pipeline(
                language,
                processors="tokenize,mwt,pos,lemma,depparse",
                download_method=None,
                dir=os.environ.get("STANZA_RESOURCES_DIR"),
                use_gpu=False,
                verbose=False,
            )
        pipeline = pipelines[language]
        document = pipeline(text)
        sentences = []
        for sentence in document.sentences:
            words = []
            for token in sentence.tokens:
                analyses = token.words
                lemma = analyses[0].lemma if len(analyses) == 1 else "+".join(word.lemma for word in analyses)
                part_of_speech = analyses[0].upos if len(analyses) == 1 else "MWT"
                features = analyses[0].feats if len(analyses) == 1 else None
                words.append(
                    {
                        "surface": token.text,
                        "lemma": lemma,
                        "pos": part_of_speech,
                        "upos": part_of_speech,
                        "xpos": analyses[0].xpos if len(analyses) == 1 else None,
                        "morphologicalFeatures": {
                            key: value for key, value in
                            (item.split("=") for item in features.split("|") if "=" in item)
                        } if features else None,
                        "dependencyHead": analyses[0].head if len(analyses) == 1 else None,
                        "dependencyRelation": analyses[0].deprel if len(analyses) == 1 else None,
                        "startScalar": token.start_char,
                        "endScalar": token.end_char,
                    }
                )
            sentences.append({"text": sentence.text, "words": words})
        print(
            json.dumps(
                {"provider": "stanza", "providerVersion": f"{stanza.__version__}/resources-1.14.0", "sentences": sentences},
                ensure_ascii=False,
            ),
            flush=True,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
