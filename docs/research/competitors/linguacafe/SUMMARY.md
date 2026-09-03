# LinguaCafe — karar özeti

**İnceleme tarihi:** 31 Ağustos 2026 · Ayrıntılı kanıt: [EVIDENCE_INDEX.md](EVIDENCE_INDEX.md)

## 1. LinguaCafe bir cümlede nedir?

Kullanıcının kendi metin ve altyazılarını kelime stage’leri, sözlük ve SRS review ile çalıştığı self-hosted bir reading platformudur.

## 2. Temel ürün tezi

Anlaşılabilir input’u kişisel vocabulary etkileşimiyle sürekli öğrenme döngüsüne çevirmek.

## 3. Ana kullanıcı döngüsü

Import → tokenize/process → oku → kelime/phrase seç → stage/çeviri → review → completion → goal/progress.

## 4–5. En güçlü 10 özellik / en önemli 10 sürtünme

Güçlüler: açık kaynak/self-host, plain-text import, EPUB, subtitle timestamp, renkli stage, phrase kaydı, dictionary, practice review, normal Leitner review, CSV/Anki entegrasyonu.

Sürtünmeler: PDF/MD yok, YouTube 500 hatası maskeli, transcript timestamp kaybı, browser TTS voice bağımlılığı, karaoke yok, POS/dependency yok, apostrof spacing kusuru, ikon aria adları boş, review readWords şişmesi, local ayarların cihazlar arası kopması.

## 6–11. Sistem özeti

Reading güçlü ve kelime merkezli; Listening subtitle bloklarıyla sınırlı, audio sync doğrulanmadı. Vocabulary word/phrase ve lemma (`reviendrai→revenir`) destekliyor; stage ilerlemesi gerçek. Progress okunmuş kelimeyi faydalı ama exposure ağırlıklı sayıyor; review örnek cümlesi metriği şişirebiliyor. Import `.txt/.epub/.srt/.ass`, website ve YouTube transcript ile sınırlı; PDF/MD/OCR yok. Monetization yerine self-host operasyon maliyeti var.

## 12–14. Bizim ürün için fikirler

Source fingerprint + provenance, caption/ASR/align ayrımı, paragraph audio, forced word alignment, Qwen3-TTS cache, selective OCR, POS/dependency ve sentence-role etiketleri alınabilir. Finish reading gibi geri dönüşü zor bulk-Known, renge aşırı bağımlı stage ve caption hata maskelemesi birebir alınmamalı.

## 15. Önerilen MVP

Doğrudan yapıştırılan metin + MD/EPUB + güvenilir YouTube caption importu; sentence/paragraph reader; kelime/lemma/POS; Known/Learning/Ignored; bağlam flashcard ve SRS; segment audio player; dürüst progress; CSV/Anki export. Bu önerideki eski TXT dosya yolu güncel ürün kararıyla kaldırılmıştır. WhisperX ve Qwen3-TTS yalnız kalite eşiği, kullanıcı talebi veya cache yokluğunda çalışsın.

## 16. En riskli teknik konular

Word-level forced alignment, GPU kuyruk/maliyet, OCR doğruluğu, YouTube ToS/sağlayıcı kırılganlığı, Fransızca elision/POS, ortak cache gizliliği ve telif.

## 17. Cevaplanmamış sorular

Maliyet/latency bütçeleri, caption kalite eşiği, raw audio retention, Anki formatı ve mastery değerlendirme protokolü [19_OPEN_QUESTIONS_AND_FOLLOWUPS.md](19_OPEN_QUESTIONS_AND_FOLLOWUPS.md)’de.

## 18. Sonraki rakipler/testler

Readlang, Lute, Language Reactor ve LingQ ile aynı içerik/task benchmark’ı; telifsiz audio+OCR alignment testleri.

### Kesinlikle yap

- Source fingerprint ve idempotent import.
- Segment/word timestamp’i birinci sınıf veri yap.
- Bağlam flashcard + portable export.
- Exposure, review ve mastery metriklerini ayır.

### Deneyerek karar ver

- WhisperX fallback ve selective OCR.
- Qwen3-TTS eager/lazy üretim oranı.
- POS/dependency’nin A2–B1 faydası.
- Karaoke’nin retention katkısı.

### Şimdilik yapma

- Tutor/community/leaderboard.
- Full video sosyal platformu.
- Her importta otomatik GPU TTS/ASR.
- Geri alınamayan bulk-Known.

## Bizim ürünümüz için sonuç

LinguaCafe incelemesi, küçük ve güvenilir bir reading–listening–vocabulary çekirdeğinin; geniş sosyal ve AI kapsamından önce doğrulanması gerektiğini gösteriyor.
