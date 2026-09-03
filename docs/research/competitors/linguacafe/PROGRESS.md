# LinguaCafe Araştırma İlerlemesi

**İnceleme tarihi:** 31 Ağustos 2026  
**Son güncelleme:** 31 Ağustos 2026  
**Durum:** Planlanan araştırma teslimatı tamamlandı; başarılı YouTube transcript sonucu dış bağımlılık hatası nedeniyle doğrulanamadı.

## Güvenlik ve hazırlık

- [x] Repository ve `AGENTS.md` kontrol edildi; geçerli proje talimatı bulunmadı.
- [x] README, compose ve secret üretim yaklaşımı incelendi.
- [x] Dört Docker servisinin healthy olduğu doğrulandı.
- [x] Portların yalnız localhost'a bağlı olduğu doğrulandı.
- [x] Araştırma öncesi uygulama yedeği oluşturuldu.
- [x] Kullanıcı tarayıcıya kendisi giriş yaptı; kimlik bilgileri görülmedi/kaydedilmedi.
- [x] Mevcut kitap içeriğine dokunmama sınırı kaydedildi.

## Ürün incelemesi

- [x] Login ekranı
- [x] Home/Calendar başlangıç görünümü ve baseline metrikler
- [x] Ana menünün ilk haritası
- [x] Library liste görünümü ve import giriş noktası
- [x] Admin settings ve language yapısı
- [x] User settings ve browser-local ayarlar
- [x] Import türlerinin bütün ekranları (yükleme yapılmadan)
- [x] Sentetik Fransızca kitap importu
- [x] Reader ve hotkeys
- [x] En fazla beş vocabulary varlığı
- [x] Practice ve normal review
- [x] Completion ve deney sonrası metrikler
- [x] YouTube transcript listeleme (UI hata state’i ve Python 500 gözlendi; başarılı liste doğrulanamadı)
- [x] Browser TTS (mevcut T3 ortamında French voice bulunmadı; source ile doğrulandı, çalıştırma doğrulanamadı)
- [x] Desktop/tablet/telefon responsive kontrolü

## Teknik inceleme

- [x] Runtime stack ve OCI kaynak durumu
- [x] Laravel route envanteri
- [x] Controller/service/model/job/frontend üst düzey haritası
- [x] YouTube transcript implementasyonunun ilk doğrulaması
- [x] Browser SpeechSynthesis tabanlı TTS'nin ilk doğrulaması
- [ ] Migration ve ilişki modeli
- [x] Vocabulary/review/statistics state transition'ları
- [x] Subtitle timestamp veri akışı
- [x] Import parser ve format matrisi
- [x] Test kapsamı ve teknik borç (kaynak taraması; test suite çalıştırılmadı)
- [x] YouTube/ASR/Qwen3-TTS/OCR entegrasyon boşlukları

## Teslimatlar

- [x] `00_SCOPE_AND_METHOD.md`
- [x] `01_EXECUTIVE_SUMMARY.md`
- [x] `02_RUNTIME_DEPLOYMENT_AND_SECURITY.md`
- [x] `03_INFORMATION_ARCHITECTURE.md`
- [x] `04_SETUP_PROFILE_LANGUAGE_ADMIN.md`
- [x] `05_CORE_LEARNING_LOOP.md`
- [x] `06_READING_EXPERIENCE.md`
- [x] `07_VOCABULARY_REVIEW_AND_ANKI.md`
- [x] `08_PROGRESS_STATS_AND_GOALS.md`
- [x] `09_LIBRARY_AND_CONTENT_MANAGEMENT.md`
- [x] `10_IMPORT_AND_CONTENT_CREATION.md`
- [x] `11_AUDIO_TTS_AND_SUBTITLE_SYNC.md`
- [x] `12_UX_RESPONSIVE_ACCESSIBILITY.md`
- [x] `13_SOURCE_ARCHITECTURE.md`
- [x] `14_CONCEPTUAL_PRODUCT_AND_DATA_MODEL.md`
- [x] `15_FEATURE_INVENTORY.md`
- [x] `16_LINGQ_COMPARISON.md`
- [x] `17_EXTENSION_GAPS_YOUTUBE_ASR_TTS_OCR.md`
- [x] `18_ADOPTION_AND_MVP_RECOMMENDATION.md`
- [x] `19_OPEN_QUESTIONS_AND_FOLLOWUPS.md`
- [x] `ACCOUNT_CHANGES.md`
- [x] `EVIDENCE_INDEX.md`
- [x] `PROGRESS.md`
- [x] `SUMMARY.md`

## Kontrollü deney sonucu

- [x] İzole kitap id `3`, chapter id `432`, 200 kelime, processing `processed`.
- [x] Beş vocabulary varlığı sınırı korundu; mevcut kullanıcı kitabı açılmadı.
- [x] Auto-Known başlangıçta `false`; completion sonrası diğer yeni kelimeler Known yapılmadı.
- [x] Reader local `plain-text-mode` geçici olarak açılıp `false` değerine döndürüldü.
- [x] Sentetik recording `evidence/LC-E009-controlled-learning-flow.mp4` olarak kaydedildi.
- [x] YouTube transcript hesaba import edilmedi.
- [x] Readify `FEATURES.md`/`idea.md` ile LinguaCafe ve LingQ kısa karşılaştırması oluşturuldu (`docs/research/READIFY_LINGUACAFE_LINGQ_COMPARISON.md`).

## İlk doğrulamalar

- Mevcut YouTube özelliği video importu değil, transcript metni alma akışıdır.
- Seçilen YouTube transcript'i `text` import yoluna gider; YouTube timestamp'leri korunmaz.
- Subtitle file/Jellyfin yolu ayrı `subtitle` akışıdır ve timestamp saklayabilir.
- Mevcut TTS server-side üretim değil, browser `SpeechSynthesis` API'sidir.
- PDF import bileşeni kodda yorum satırındadır; çalışan UI özelliği değildir.
