# Benimseme ve MVP önerisi

## MVP Core

| Özellik | Değer | Teknik/maliyet | Neden şimdi |
| --- | --- | --- | --- |
| Yapıştırılan metin + MD/EPUB import | kendi input’u | düşük-orta | çekirdek döngü; TXT dosya yolu güncel ürün kararıyla kaldırıldı |
| YouTube caption import + fingerprint | video içeriği | orta | ana kullanım senaryosu |
| paragraph/sentence text model | bağlam | orta | reader temeli |
| word/lemma/POS/dependency | anlaşılabilirlik | orta-yüksek | kullanıcı isteği, Fransızca kalite |
| renkli reader + Known/Learning/Ignored | anlık kontrol | orta | LingQ tezi |
| context flashcard + SRS | hatırlama | orta | öğrenme kanıtı |
| audio player + segment timing | listening | orta | ürün vaadi |
| dürüst progress | devamlılık | orta | retention güveni |

## MVP Plus

Caption yoksa WhisperX fallback (kota ile), text-only Qwen3-TTS ilk paragraph eager, karaoke sentence highlight, Anki `.apkg`/CSV export, selective OCR, duplicate reuse UI.

## Post-MVP

Full video player, word-level karaoke, speaker diarization, auto translation, tutor/community, leaderboards, cloud sync, AnkiConnect, bulk edit, advanced recommendation model.

Maliyet ilkesi: ASR/TTS opt-in veya kalite eşiğine bağlı; ortak içerik cache, model/voice fingerprint, GPU queue telemetry. Gizlilikte raw audio/transcript retention seçilebilir; telifli kaynağın public paylaşımı varsayılan kapalı.

## Bizim ürünümüz için sonuç

MVP LinguaCafe’nin bütün özelliklerini kopyalamamalı: bir kaliteli source-to-reader-to-review loop, ölçülebilir sync ve portable vocabulary yeterli ilk doğrulamadır.
