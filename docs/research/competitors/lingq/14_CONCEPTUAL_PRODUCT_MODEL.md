# Kavramsal Ürün Modeli

**İnceleme tarihi:** 26 Ağustos 2026

Aşağıdaki model yalnızca arayüzde gözlenen nesne ve ilişkilerden türetilmiştir; LingQ'nun doğrulanmış backend şeması değildir.

```mermaid
erDiagram
  USER ||--|| PROFILE : has
  USER ||--o{ LEARNING_LANGUAGE : studies
  LEARNING_LANGUAGE ||--o{ COURSE : scopes
  COURSE ||--o{ LESSON : contains
  LESSON ||--|| TEXT : presents
  LESSON ||--o| AUDIO : may_have
  AUDIO ||--o{ TRANSCRIPT_SEGMENT : aligns
  TEXT ||--o{ TRANSCRIPT_SEGMENT : represents
  LESSON ||--o{ WORD_LEMMA : exposes
  WORD_LEMMA ||--o{ PHRASE : groups
  WORD_LEMMA ||--o{ MEANING_TRANSLATION : has
  USER ||--o{ VOCABULARY_STATUS : assigns
  WORD_LEMMA ||--o{ VOCABULARY_STATUS : receives
  USER ||--o{ REVIEW_EVENT : performs
  WORD_LEMMA ||--o{ REVIEW_EVENT : reviewed
  USER ||--o{ LEARNING_ACTIVITY : creates
  PROFILE ||--o{ GOAL : targets
  PROFILE ||--o{ STREAK : tracks
  USER ||--o{ CHALLENGE : joins
  USER ||--o{ IMPORT_JOB : starts
  IMPORT_JOB }o--|| LESSON : produces
  USER ||--o{ PLAYLIST : owns
  PLAYLIST }o--o{ LESSON : includes
```

## Gözlenen anlamlar

- `Lesson`, text, audio, course, source snippet, read/listen state ve completion etrafında merkez nesne.
- `Word/lemma`, `Phrase`, meaning ve status reader ile Vocabulary ekranını bağlıyor.
- `Review event` ve `Learning activity`, Profile metriklerinin gözlenen davranışsal karşılığı; gerçek event şeması görülmedi.
- `Import job`, editor'daki üç adımlı akış ve transcription beklentisini temsil eden kavramsal nesne.
- `Goal`, `Streak`, `Challenge`, `Playlist` arayüzde ayrı motivasyon/organizasyon katmanları olarak görünüyor.

## Belirsizlikler

Lemma–çekim birleştirme, timestamp granülerliği, status tarihçesi, SRS scheduler ve import job hata durumları doğrulanmadı. `Profile` metriklerinin hangi eventlerden hesaplandığı yalnız kontrollü deneyle kısmen çıkarılabilir.

## Bizim ürünümüz için sonuç

MVP veri modeli `LearningLanguage → Lesson(Text+Audio+TranscriptSegment) → Word/Phrase → VocabularyStatus → ReviewEvent → LearningActivity` zincirini yalın tutmalı. Goal/Streak/Playlist sonradan eklenebilir; her metriğin kaynak event'i denetlenebilir olmalı.
