# Product acceptance fixtures

## French pasted-text Reader fixture

[french-reader-acceptance.txt](french-reader-acceptance.txt) is repository-authored synthetic test prose. It does not quote or adapt a third-party passage. To the extent copyright or related rights exist, the fixture is dedicated under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). It contains no personal or production data.

The fixture deliberately provides:

- multiple paragraphs and a first line longer than the 80-scalar title limit;
- repeated/inflected forms for `aller`, `choisir`, `manger`, and `parler`;
- ASCII and typographic apostrophes/elision;
- the non-BMP character `🥐` for browser/server scalar-offset agreement;
- literal HTML- and Markdown-looking text that must remain escaped plain text.

After normalization v1, the expected generated title is the first 80 scalar values:

```text
Une matinée tranquille au marché du quartier où chacun prend le temps de choisir
```

Tests may derive CRLF and outer-blank-line variants from this LF canonical file. They must not edit the canonical fixture at runtime.

Deterministic test meanings belong to the fake meaning adapter, not to a production dictionary license:

| Lemma | Fake Turkish meaning |
| --- | --- |
| `aller` | `gitmek` |
| `choisir` | `seçmek` |
| `manger` | `yemek` |
| `parler` | `konuşmak` |

These values test contract behavior and provenance fields. They are not a quality benchmark or permission to copy a provider dataset.
