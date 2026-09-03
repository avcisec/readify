# YouTube, ASR, Qwen3-TTS ve OCR boşlukları

| Özellik | Mevcut durum | Kanıt | Entegrasyon noktası | Yeni kabiliyet | Zorluk | Risk | Öncelik |
| --- | --- | --- | --- | --- | --- | --- | --- |
| YouTube fingerprint | video metadata yok | E007 | ImportController/Service | canonical ID + source hash | Orta | ToS/telif | P0 |
| Caption provenance | manual/generated ayrımı yok | E007 | Python endpoint | track type, language, confidence | Orta | yanlış kalite | P0 |
| Segment timestamp | YouTube text’e kayboluyor | E007 | import DTO/Chapter | TranscriptSegment | Orta | model migration | P0 |
| WhisperX fallback | yok | source/log | queue | caption yoksa ASR; kötü timing align-only | Yüksek | GPU/maliyet | P1 |
| Qwen3-TTS | yalnız browser SpeechSynthesis | E008 | ProcessChapter sonrası job | paragraph audio + forced alignment | Yüksek | GPU/telif/voice | P1 |
| Karaoke | word timing yok | E009 | reader/audio player | word timestamps + confidence | Yüksek | senkron hatası | P1 |
| PDF/OCR | UI yok | source/UI | ImportService | native text-first + selective OCR | Orta-yüksek | OCR hata/maliyet | P1 |
| Markdown | UI yok | source/UI | normalizer | MD → paragraphs/links | Düşük | formatting | P0 |
| Dedup cache | doğrulanmadı | çıkarım düşük | ImportService/job | source fingerprint, model fingerprint | Orta | stale cache | P0 |

## Maliyet politikası

Önce mevcut caption ve cache; sonra align-only; en son full ASR. TTS yalnız text-only veya kullanıcı açıkça istediğinde, section bazlı lazy üretimle çalışmalı. Her GPU job idempotent, iptal edilebilir ve kota görünür olmalı. Qwen3-TTS output model/voice sürümüyle imzalanmalı.

## Bizim ürünümüz için sonuç

En büyük farklılaşma audio-text doğruluğudur; bunu pahalı varsayılan değil, kalite eşiği aşıldığında tetiklenen pipeline yap.
