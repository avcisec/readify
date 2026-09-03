# LinguaCafe Kanıt İndeksi

**İnceleme tarihi:** 31 Ağustos 2026

| ID | Tür/dosya | Ekran veya kaynak | Tarih | Desteklediği bulgu | Kişisel veri kontrolü |
| --- | --- | --- | --- | --- | --- |
| LC-E001 | Metinsel T3 gözlemi | `/login` | 31 Ağustos 2026 | Login formu yalnız e-posta/parola ve tema kontrolü sunuyor | Temiz; alanlar boştu |
| LC-E002 | Metinsel T3 gözlemi | `/` Home | 31 Ağustos 2026 | Calendar, üç daily goal ve beş all-time statistics metriği var | Yalnız anonim sayısal metrikler kaydedildi |
| LC-E003 | Metinsel T3 gözlemi | `/books` | 31 Ağustos 2026 | Library list/table, Create book ve Import girişleri var | Mevcut kitap adı evidence dosyasına alınmadı |
| LC-E004 | Metinsel T3 gözlemi | More navigation | 31 Ağustos 2026 | Home, Library, Vocabulary, Review, User settings, User manual ve Admin settings IA'sı | Kimlik alanı görünmedi |
| LC-E005 | Runtime komut çıktısı | `docker compose ps`, localhost portları | 31 Ağustos 2026 | Dört servis healthy; HTTP/WS yalnız localhost | Secret yok |
| LC-E006 | Runtime komut çıktısı | Uygulama backup komutu | 31 Ağustos 2026 | Araştırma öncesi SQL yedeği üretildi | Yedek içeriği açılmadı |
| LC-E007 | Kaynak kod | `ImportTypeSelection.vue`, `ImportService.php`, Python tokenizer | 31 Ağustos 2026 | YouTube transcript, subtitle, e-book, text ve website import sınırları | Kullanıcı verisi yok |
| LC-E008 | Kaynak kod/manual | `TextToSpeechService.js`, `Usage and features.md` | 31 Ağustos 2026 | TTS browser SpeechSynthesis kullanıyor | Kullanıcı verisi yok |
| LC-E009 | `evidence/LC-E009-controlled-learning-flow.mp4` | `/chapters/read/432`, `/review/...`, `/` | 31 Ağustos 2026 | Sentetik reader, word/phrase durumları, settings, hotkeys, practice/normal review, completion ve son metrikler | Yalnız özgün sentetik metin ve anonim sayısal metrikler; kişisel alan yok |
| LC-E010 | Metinsel T3 + veri modeli doğrulaması | `/books/3`, sentetik chapter | 31 Ağustos 2026 | 200 total, 143 unique, 141 new; processing `processed`; `read_count` 0→1 | Yalnız sentetik kayıt sorgulandı; kullanıcı kimliği çıktı alınmadı |
| LC-E011 | Metinsel T3 + model doğrulaması | Reader vocabulary paneli | 31 Ağustos 2026 | `New=2`, öğrenme `-7…-1`, Known `0`, Ignored `1`; phrase ve `reviendrai→revenir` bağlantısı | Yalnız beş kontrollü vocabulary varlığı |
| LC-E012 | Metinsel T3 | Home, deney öncesi/sonrası | 31 Ağustos 2026 | Reading 382→417→617; Known 0→1; studied 5→7; review 2→4; new-word goal 0→4 | Anonim toplulaştırılmış metrikler |
| LC-E013 | Metinsel T3 | Import wizard, Source adımları | 31 Ağustos 2026 | Aktif tipler ve format validator’ları: TXT, EPUB, SRT/ASS, Website, YouTube; PDF/MD görünmüyor | Kişisel/telifli içerik yok; yükleme yapılmadı |
| LC-E014 | Metinsel T3 | `/books`, iPad Air ve iPhone 12 Pro viewport | 31 Ağustos 2026 | Tablet tablo, telefonda kart/dikey Library ve alt navigasyon dönüşümü | Başlık yalnız sentetik test kitabı; mevcut kitap adı kayda geçirilmedi |
| LC-E015 | Python log | `/tokenizer/get-youtube-subtitle-list` | 31 Ağustos 2026 | İki caption’lı olduğu belirtilen public video denemesinde XML ParseError → HTTP 500; UI “No subtitles found” | Transcript içeriği kaydedilmedi |

## Not

T3 snapshot'ları görsel doğrulama için kullanılır. Repository'ye yalnız kişisel/telifli veri içermeyen recording veya frame export edilebilirse dosya olarak alınır; aksi halde route ve gözlem metinsel kanıt olarak tutulur.
