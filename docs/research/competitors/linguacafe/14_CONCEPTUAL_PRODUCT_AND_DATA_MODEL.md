# Kavramsal ürün ve veri modeli

Bu diyagram gözlenen UI, model ve service ilişkilerinden çıkarılmış kavramsal modeldir; LinguaCafe’nin resmi backend şeması değildir.

```mermaid
erDiagram
 USER ||--o{ PROFILE : has
 USER ||--o{ LEARNING_LANGUAGE : studies
 LEARNING_LANGUAGE ||--o{ COURSE : scopes
 COURSE ||--o{ LESSON : contains
 LESSON ||--o{ TEXT : presents
 TEXT ||--o| AUDIO : may_have
 AUDIO ||--o{ TRANSCRIPT_SEGMENT : aligns
 TRANSCRIPT_SEGMENT ||--o{ WORD : contains
 WORD }o--|| LEMMA : normalizes
 WORD }o--o{ PHRASE : participates
 WORD }o--o{ MEANING_TRANSLATION : has
 USER ||--o{ VOCABULARY_STATUS : owns
 VOCABULARY_STATUS }o--|| WORD : tracks
 USER ||--o{ REVIEW_EVENT : records
 USER ||--o{ LEARNING_ACTIVITY : logs
 USER ||--o{ GOAL : sets
 GOAL ||--o{ STREAK : produces
 USER ||--o{ CHALLENGE : joins
 USER ||--o{ IMPORT_JOB : submits
 USER ||--o{ PLAYLIST : owns
 PLAYLIST }o--o{ LESSON : queues
```

Gelecekte POS/dependency, page/paragraph locator, audio provenance ve cache fingerprint bu modele eklenmelidir.

## Bizim ürünümüz için sonuç

Surface word, lemma, phrase ve sentence-role ayrı varlıklar olmalı; vocabulary stage tek başına “öğrenildi” anlamına gelmemeli. Source locator ve timestamp, aynı içeriğin yeniden kullanımını mümkün kılar.
