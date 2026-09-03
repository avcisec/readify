# Kaynak mimarisi

**Kaynak kodda doğrulandı:** çalışan OCI imajı, 31 Ağustos 2026.

Laravel routes/controllers HTTP sınırını; ImportService, VocabularyService, ReviewService, StatisticsService, GoalService iş mantığını taşır. Eloquent `Book`, `Chapter`, `EncounteredWord`, `Phrase`, `ExampleSentence`, `Goal`, `DailyAchievement`, `Dictionary` modelleriyle MySQL kullanılır. `ProcessChapter` queue job’ı Python tokenizer sonrası phrase indexing ve chapter state güncellemesi yapar. Redis/Horizon kuyruk, Reverb websocket bildirimleri için kullanılır.

Frontend Vue router/Vuex ve Vuetify bileşenlerinden oluşur: `ImportTypeSelection.vue`, `ImportDialog.vue`, `ImportYoutubeSubtitleSource.vue`, `TextReader.vue`, `TextBlockGroup.vue`, `TextToSpeechService.js`. Browser-local settings `LocalStorageManagerService` ile saklanır. AnkiConnect dış API adapter, Jellyfin ayrı entegrasyondur.

Test kapsamı bu keşifte tam çalıştırılmadı; eski Vue 2 stack, sağlayıcı contract’ları ve import failure path’leri teknik borç adayıdır.

## Bizim ürünümüz için sonuç

Import, alignment, TTS ve OCR ayrı idempotent job’lar olmalı. Domain event’leri (`sourceImported`, `segmentAligned`, `wordReviewed`) istatistikleri doğrudan UI’dan bağımsız ve denetlenebilir kılar.
