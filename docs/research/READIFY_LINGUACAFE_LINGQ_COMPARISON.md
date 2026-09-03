# Readify – LinguaCafe – LingQ kısa karşılaştırması

**Kaynaklar:** [FEATURES.md](../../FEATURES.md), [idea.md](../../idea.md), [LinguaCafe SUMMARY](competitors/linguacafe/SUMMARY.md), [LingQ raporları](competitors/lingq/SUMMARY.md) · **Araştırma tarihi:** 31 Ağustos 2026 · **Pasted-text ürün kararı:** 1 Eylül 2026

## Kısa sonuç

Readify’nin çekirdeği LinguaCafe ve LingQ ile aynıdır: içeriği al, okunabilir input’a dönüştür, kelimeye bağlam içinde dokun, tekrar ettir ve ilerlemeyi göster. Readify’nin asıl farkı; audio-text sync/karaoke, PDF/OCR, YouTube fallback, POS/dependency ve source/cache provenance’ı aynı üründe birleştirmesidir.

## Benzerlikler

| Konu | Readify | LinguaCafe | LingQ |
| --- | --- | --- | --- |
| Ana öğrenme döngüsü | Import → reader → vocabulary → review → progress | Aynı | Aynı temel tez |
| Reader | Kelime tıklama, phrase, Page/Sentence View | Kelime/phrase, continuous reader | Kelime popup, Page/Sentence View |
| Vocabulary | Learning/Known/Ignored, lemma, phrase, flashcard | Stage `New/-7…-1/Known/Ignored`, word/phrase | LingQ/saved/known kelime sistemi |
| Sözlük | Kaynak ve AI çevirisini ayırma planı | Wiktionary/API | Çoklu sözlük/çeviri yaklaşımı |
| Review | SRS, context cloze, Recall Confirmed | Leitner-benzeri review, practice | Review/tekrar akışları |
| Progress | Maruz kalma–beyan–kanıtlanmış hatırlama ayrımı | Read/known/studied/goals | Zengin aktivite, streak ve istatistik |
| Kişiselleştirme | Dil, seviye, içerik uygunluğu, reader ayarları | Reader local settings ve dil | Dil/öğrenme tercihleri |

## Farklılıklar ve mimari sonuçları

| Alan | LinguaCafe | LingQ | Readify planı |
| --- | --- | --- | --- |
| Ürün modeli | Açık kaynak, self-hosted Laravel/Vue + MySQL/Redis/Python | SaaS ve kapalı backend | Self-host uyumlu, servis/job tabanlı ve taşınabilir |
| Import | TXT, EPUB, SRT/ASS, Website, YouTube transcript; PDF/MD/OCR yok | Daha geniş web/audio/video import ekosistemi | Yapıştırılan metin + YouTube + EPUB/PDF/MD, native extraction ve selective OCR |
| YouTube | Transcript’i düz metin yapar; timestamp/video metadata kaybolur | Video/transcript deneyimi daha bütünleşik | Canonical ID, manual→auto caption, align-only→WhisperX, source provenance |
| Audio | Subtitle timestamp ve browser SpeechSynthesis; karaoke yok | Audio içerik ve sync daha görünür | Original audio veya Qwen3-TTS, segment/word timing ve karaoke |
| Linguistic layer | Tokenizer, lemma/base word; POS/dependency yok | Kelime anlamı/phrase odaklı; teknik parser şeması doğrulanmadı | Surface–syntactic token, lemma, POS, morphology, dependency, parent/role |
| Known | Stage 0; Finish reading ile riskli bulk-Known | Known işaretleme güçlü | Lemma-wide ama geri alınabilir; `Recall Confirmed` ayrı |
| Review | Word/phrase stage ve practice/normal | Review ve aktivite sistemi | Context cloze/audio kart, source/type filtresi, kanıtlı mastery |
| İstatistik | Basit goals; review cümlesi readWords’ı şişirebilir | Daha zengin gamification | Exposure, recall ve mastery çakışmadan ölçülür |
| UI yaklaşımı | Temiz, yoğun ama yönetilebilir Vuetify ekranları | Özellik zengin, daha kapsamlı SaaS | LinguaCafe’nin temiz hiyerarşisi + daha sade çekirdek akış |

## Bizim platformda şu anda planlanmayanlar

### LinguaCafe’de olup Readify FEATURES/idea’da olmayan veya ertelenenler

- Admin Languages/Dictionaries/Fonts/API ayarlarının tam yönetim yüzeyi.
- Jellyfin subtitle entegrasyonu.
- Website import’un MVP dışı bırakılması (Readify’de Later).
- Browser-only TTS ve onun voice seçimi; Readify server-side/cache’li ses hedefliyor.
- LinguaCafe’nin mevcut basit stage renk modeli; Readify bunu lemma, ikon, etiket ve geri alma ile genişletiyor.
- LinguaCafe’deki mevcut operasyonel backup/admin akışının kullanıcı ürününde görünür olması.

### LingQ’da olup Readify’de planlanmayanlar

- Tutor marketplace, conversation booking ve writing correction.
- Community, followers/activity feed, public user content ve sosyal mesajlaşma.
- Leaderboard, challenge, badge ve yoğun gamification.
- Geniş public content marketplace ve içerik üretici ekosistemi.
- Abonelik, trial, premium feature gating ve tutor monetization.
- Speaking/writing ürün döngüsünün MVP’ye dahil edilmesi.

Bu özellikler bilinçli olarak plan dışıdır; Readify önce reading–listening–vocabulary çekirdeğini doğrulamayı amaçlar.

## Tasarım açısından alınacaklar

- LinguaCafe’nin az sayıda ana navigasyon öğesi ve temiz Library tablosu.
- Reader’da sabit, küçük bir araç çubuğu; vocabulary panelini metnin önüne geçirmeme.
- Stage renklerini metin/ikon/tooltip ile destekleme.
- Import wizard’da aşamaları ve processing durumunu açık gösterme.
- Mobilde alt navigasyon ve kart tabanlı Library dönüşümü.

Kopyalanmaması gerekenler: boş aria etiketleri, renk bağımlılığı, YouTube hata sınıflarını “No subtitles” diye maskeleme, geri dönüşü zor bulk-Known ve browser-local ayarların cihazlar arası kopukluğu.

## Planlama uyarıları

FEATURES.md’de Qwen3-TTS, word-karaoke, POS/dependency, selective OCR, YouTube/WhisperX ve `.apkg` aynı anda **Core** seviyesinde. Bu kapsam teknik olarak LinguaCafe’den çok daha geniştir. Önerilen sıralama:

1. **Çekirdek doğrulama:** doğrudan yapıştırılan metin + MD/EPUB + güvenilir caption, temiz reader, word/phrase, Known/Learning/Ignored, sentence audio, temel SRS ve CSV export.
2. **Farklılaştırıcı katman:** PDF selective OCR, source fingerprint, POS/dependency, segment audio ve Qwen3-TTS cache.
3. **İleri katman:** WhisperX fallback, word-level karaoke, `.apkg` media packaging, recommendation ve çoklu dil.

## Son karar

Readify, LinguaCafe’nin sadeliğini ve self-host güvenini; LingQ’nun input/vocabulary fikrini almalı. Farklılaşmayı sosyal özelliklerle değil, daha güvenilir import provenance’ı, Fransızca cümle çözümlemesi, ses–metin senkronu ve dürüst ilerleme ile kurmalı.
