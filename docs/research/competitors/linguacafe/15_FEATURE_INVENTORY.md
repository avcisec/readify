# Feature inventory

| Alan | Özellik | Kullanıcı amacı | Giriş noktası | Nasıl çalışıyor | Veri/model | Runtime bileşeni | Güçlü yön | Sorun | Kanıt | Bizim kararımız |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Library | Plain text import | Kendi metnini çalışmak | `/books` | wizard, 3000-char chunk | Book/Chapter | ImportService/ProcessChapter | hızlı | metadata yok | E009 | Adopt |
| Library | EPUB/TXT | kitap/metin eklemek | Import | `.epub`/`.txt` validator | Book/Chapter | Python tokenizer | basit | PDF/MD yok | source/UI | Adapt |
| Library | YouTube transcript | caption’ı metne almak | Import | transcript list → text | Chapter | Python API | düşük giriş maliyeti | timestamp/video yok; 500 maskeli | E007, log | Experiment |
| Reader | Word highlight | bilinmeyeni ayırt etmek | chapter read | stage renkleri | EncounteredWord | Vue TextBlockGroup | doğrudan bağlam | renk bağımlı | E009 | Adopt |
| Reader | Phrase save | çok sözcüklü kalıp | sürükleme | phrase index + stage | Phrase | ProcessChapter | phrase bağlamı | seçme keşfi zayıf | E009 | Adapt |
| Vocabulary | Dictionary | anlam bulmak | word panel | French Wiktionary | Dictionary | API/cache | örnekler | sonuç otomatik kaydedilmez | E009 | Adopt |
| Review | Practice/normal | recall | `/review` | Reveal, Again, Correct | ReviewService | Leitner | practice güvenli | metrikler karışabilir | E009 | Adapt |
| Progress | goals/stats | alışkanlığı görmek | Home | read/review/new counters | Goal/DailyAchievement | StatisticsService | görünür | readWords review’i sayar | E012 | Adapt |
| Audio | browser TTS | telaffuz dinlemek | reader/review `v` | SpeechSynthesis | local voice | browser | ücretsiz | voice yok, timing yok | E008 | Later |
| Export | CSV/AnkiConnect | veriyi taşımak | Vocabulary/Admin API | CSV veya connector | vocabulary | AnkiApiService | portability | Connect kurulum bağımlı | source | Experiment |
| Admin | backup | self-host güvenliği | Admin | SQL backup | database | Artisan | kontrol | operasyonel sorumluluk | E006 | Adopt |
| Settings | local reader prefs | kişiselleştirme | reader settings | localStorage | browser | Vue service | esnek | cihazlar arası kopuk | E009 | Adapt |

## Bizim ürünümüz için sonuç

Inventory’de Adopt/Adapt kararları çekirdek input–vocabulary–review döngüsünü öncelemeli; pahalı audio/AI özellikleri kalite eşiği ve cache ile Experiment/Later kalmalıdır.
