# Audio, TTS ve subtitle sync

Subtitle dosyası start/end timestamp taşısa da reader bunu sentence-range vurgusu ve timestamp etiketi olarak kullanır; word-level karaoke veya audio player doğrulanmadı. YouTube transcript düz metne dönüştürüldüğünden timestamp kaybolur. Mevcut TTS `window.speechSynthesis` tarayıcı seslerine bağlıdır; T3 ortamında French voice listesi boş kaldı, ses üretimi çalıştırılamadı. Üretilmiş audio asset, server TTS, autoplay/loop veya playback progress yoktur.

## Maliyet optimizasyonu önerisi

1. Caption güvenilir ve timestamp’li ise ASR/TTS kullanma; yalnız alignment doğrula.
2. Caption metni iyi ama zamanlama bozuksa WhisperX align-only çalıştır.
3. Caption yoksa/kalitesi düşükse WhisperX full transcription; confidence düşük segmentleri yeniden işle.
4. Text-only EPUB/PDF için Qwen3-TTS’i paragraf/section bazında üret; ilk bölüm eager, devamı lazy/prefetch.
5. Audio cache anahtarı `source_fingerprint + language + model + voice + text_hash`; GPU kuyruğu ve quota telemetry ekle.
6. Karaoke için word timestamps forced-alignment ile çıkar; TTS üretiminin kendisinden gelen yaklaşık süreyi gerçek sync olarak kabul etme.

## Bizim ürünümüz için sonuç

Tarayıcı TTS yalnız ücretsiz preview/fallback; kalıcı öğrenme deneyimi server audio + segment/word timestamp ile kurulmalı. Cache ve seçici işleme GPU maliyetini düşürür; kullanıcıya “caption reused / ASR / TTS generated” provenance gösterilir.
