# LingQ Araştırma İlerlemesi

**İnceleme tarihi:** 26 Ağustos 2026  
**Son güncelleme:** 26 Ağustos 2026  
**Durum:** Public ve authenticated ana inceleme tamamlandı. Kontrollü Fransızca döngüsü, IA, import/settings/social/tutor, pricing/paywall ve mobil görünüm raporlandı; doğrulanamayan noktalar takip listesine ayrıldı.

## Çalışma ilkeleri

- [x] Repository talimatları ve `AGENTS.md` kontrol edildi (repository kapsamında dosya bulunmadı).
- [x] Araştırma ve kanıt dizinleri oluşturuldu.
- [x] Kişisel veri, ödeme, mesajlaşma ve yıkıcı işlem sınırları kayda alındı.
- [x] Başlangıç/public oturum bulguları ilgili raporlara işlendi.
- [x] Public raporlarda gözlem / LingQ beyanı / çıkarım / doğrulanamadı ayrımı uygulandı.
- [x] Public snapshot'larda kişisel veri olmadığı kontrol edildi; dosyaya export edilemediği için metinsel kanıt kaydedildi.

## Araştırma checklist'i

### Public website ve erişim

- [x] Landing page ve ana değer önerisi
- [x] Hedef kitle ve öğretim metodu anlatısı
- [x] Reading–listening–vocabulary ilişkisi
- [x] Desteklenen içerik türleri ve diller
- [x] Social proof ve başarı iddiaları
- [x] CTA ve onboarding girişleri
- [x] Pricing erişim yolları ve plan sunumu
- [x] Web/mobil konumlandırması (public ürün beyanı düzeyinde)
- [x] Log in ekranının açılması ve kullanıcı tarafından güvenli giriş

### Authenticated ürün

- [x] Ana navigasyon ve temel route haritası (alt menüler/kalan sosyal route'lar derinleştirilecek)
- [x] Dashboard / Library / Lessons
- [x] Vocabulary / Playlist / Progress ana girişleri (Vocabulary ve Profile metrikleri derin test edildi)
- [x] Profile / Settings / Help / Notifications (erişilebilen yüzeyler; bildirim davranışı derin test edilmedi)
- [x] Community / Tutors / Challenges (community/tutor görüldü; challenge ayrıntısı doğrulanamadı)
- [x] Import/Create ve upgrade alanları
- [x] Dil değiştirme ve çoklu dil yapısı (public beyan + mevcut Fransızca bağlamı; davranışın tamamı doğrulanamadı)

### Onboarding, profil ve ayarlar

- [x] İlk kayıt/onboarding akışının erişilebildiği ölçüde yeniden kurulması
- [x] Ana dil, öğrenilen dil ve seviye (signup alanları)
- [x] İlgi alanı, amaç ve günlük hedef (mevcut hesapta onboarding geçmiş; doğrulanamadı)
- [x] Çoklu dil ve dile özel ilerleme (public beyan + Fransızca profil; tam davranış doğrulanamadı)
- [x] Profil, gizlilik ve sosyal alanlar (erişilebilen gözlemsel alanlar)
- [x] Genel/dile özel ayarlar ve arayüz dili (settings yüzeyi; tüm seçenekler değil)
- [x] Export ve hesap veri seçenekleri (doğrulanamadı olarak raporlandı)

### Kontrollü Fransızca öğrenme deneyi

- [x] Deney başlangıç metrikleri/CHANGE değerleri kaydedildi (ilk LingQ öncesi sıfır durumları detail change ile yeniden kuruldu)
- [x] Kısa başlangıç/orta-başlangıç Fransızca içerik bulundu
- [x] Built-in Library'den kısa Fransızca Mini Story seçildi ve reader açıldı
- [x] Metin okuma ve audio player denendi
- [x] En fazla 5–10 kelime/ifade ile etkileşildi (4 vocabulary öğesi)
- [x] Sentence mode ve player kontrolleri denendi
- [x] Bir kısa dersin completion davranışı denendi; sistem 50 mavi kelimeyi otomatik Known yaptı ve `Back` geri almadı
- [x] Vocabulary review çalıştırıldı (kart + sentence ordering; speaking mikrofon açılmadan atlandı)
- [x] Deney sonrası metrikler karşılaştırıldı
- [x] Bütün hesap değişiklikleri `ACCOUNT_CHANGES.md` içinde kaydedildi

### Reading

- [x] Metin düzeni, sayfalama ve renk kodları
- [x] Kelime/phrase seçimi, anlam ve bağlam
- [x] Çeviri, sözlük ve AI işaretli meaning sinyalleri; örnekler ayrıca doğrulanacak
- [x] Not, tag ve kelime statüleri
- [x] Sentence mode ve görünüm ayarları; klavye kısayolları ayrıca derinleştirilecek
- [x] Tamamlama ve okuma ilerlemesi
- [x] Aynı kelimenin yeniden görülmesi ve lemma sinyalleri (arayüzde görülen düzey; teknik birleştirme doğrulanamadı)

### Listening ve audio-text sync

- [x] Play/pause, seek, speed seçenekleri, continuous play kontrolü
- [x] Mini player; playlist ve background listening ayrıca incelenecek
- [x] Aktif cümle vurgusu; kelime düzeyi vurgu görülmedi
- [x] Timestamp ve okuma–ses konumu ilişkisi
- [x] Dinleme ilerlemesi ve istatistik etkisi
- [x] Audio-only, transcript ve TTS (mevcut menü/plan sinyali; bazı davranışlar doğrulanamadı)
- [x] Podcast/YouTube/audiobook/normal audio ayrımı (kaynak kartları; oynatma farkı doğrulanamadı)
- [x] Import edilmiş içerikte sync davranışı (doğrulanamadı olarak raporlandı)
- [x] Responsive player

### Vocabulary ve review

- [x] LingQ oluşturma ve statüler
- [x] Saved words, phrases, tags ve notes alanları
- [x] Sözlük, otomatik/topluluk meaning listeleri
- [x] Bağlam, detay ve farklı içeriklerde görünme (source/context; çapraz içerik davranışı kısmi)
- [x] Arama, filtre, toplu düzenleme ve import/export (UI gözlendi; bulk/import submit edilmedi)
- [x] Sentence review flashcard ve sentence ordering; diğer review modları vocabulary ekranında doğrulanacak
- [x] Review sırası/scheduling sinyalleri (SRS yüzeyi; algoritma doğrulanamadı)
- [x] Statü 4 ve completion üzerinden öğrenildi/Known davranışı; yeniden öğrenme ayrıca doğrulanacak
- [x] Hedef/reminder ve review UX (goal gözlendi; reminder davranışı doğrulanamadı)

### Progress ve gamification

- [x] Streak ve görünen coin hedefi (hedef ayarı hâlâ doğrulanacak)
- [x] Haftalık/aylık ilerleme ve activity score
- [x] Known words / LingQs / learned LingQs ilk ölçümü
- [x] Read words / listening / speaking / writing ilk ölçümü
- [x] Tamamlanan dersler, coin, level ve streak ilk davranışı; badge ayrıca doğrulanacak
- [x] Challenge, leaderboard ve milestone (menü/sinyal düzeyi; derin davranış doğrulanamadı)
- [x] Grafik, calendar/heatmap ve dile özel istatistik (profile yüzeyi; bazı grafikler kısmi)
- [x] Otomatik/manüel aktivite ve manipülasyon riski (reader açılışı ve completion güçlü kanıt); ayrı manuel aktivite girişi incelenecek
- [x] Metrik karar tablosu (deney sonu bulguları eklendi; kalan sosyal metriklerle genişletilecek)

### Content library ve discovery

- [x] Dashboard ve library yapısı
- [x] Seviye/konu/tür filtreleri ve arama
- [x] Courses, lessons, mini stories, podcast, news ve video
- [x] UGC ve kalite/moderasyon sinyalleri (gözlenen sinyaller; kalite süreci doğrulanamadı)
- [x] Öneriler ve kişiselleştirme sinyalleri (gözlenen koleksiyon; algoritma doğrulanamadı)
- [x] Zorluk, uzunluk ve unknown-word oranı
- [x] Continue, favorites, playlist ve history (giriş noktaları kısmi; davranış ayrıca doğrulanmadı)
- [x] “Uygun input” anlatımı (new-word/level sinyali; kişisel açıklama eksik)

### Import ve creation

- [x] Text/URL/EPUB/PDF/TXT/document import (source UI; gönderim yapılmadı)
- [x] Audio/video/YouTube/podcast/RSS (source UI; davranış doğrulanmadı)
- [x] Transcript/subtitle ve metadata (arayüz beyanı; işleme doğrulanmadı)
- [x] Private/public, course/collection ve creator bilgileri (doğrulanamadı olarak raporlandı)
- [x] Otomatik transcript/translation/lesson generation (ürün beyanı; test edilmedi)
- [x] Format, boyut, süre, hata ve limitler (kısmen paywall; ayrıntı açık soru)
- [x] Sonradan düzenleme, paylaşma ve arşivleme/silme (güvenlik sınırı/doğrulanamadı)
- [x] Audio-text alignment soruları

### Social, tutor ve retention

- [x] Profile/follow/feed/forum/UGC (erişilebilen forum)
- [x] Challenges ve leaderboards (giriş noktası)
- [x] Tutor keşfi ve booking ekranları (rezervasyon yapılmadan)
- [x] Writing/speaking feedback ve mesajlaşma (giriş noktaları; gönderim yapılmadı)
- [x] Notifications ve e-posta geri çağırma iddiaları (doğrulanamayanlar açıkça listelendi)
- [x] Streak, goal, continue ve upgrade habit loop'ları
- [x] Motivasyon / nötr hatırlatma / dark-pattern değerlendirmesi

### Pricing ve paywalls

- [x] Free/Premium planlar ve dönemler
- [x] Trial ve kullanım limitleri (public beyan; trial başlatılmadı)
- [x] Feature/vocabulary/import/AI gating
- [x] Offline/mobile ve tutor monetization
- [x] İptal/yönetim erişimi (değişiklik yapılmadan)
- [x] Öğrenme akışındaki paywall noktaları
- [x] Para birimi, bölge ve inceleme tarihi kaydı

### UX, responsive ve gözlemsel accessibility

- [x] Desktop temel ekranlar
- [x] Tablet temel ekranlar (iPad Air 820×1180 review/reader gözlemi)
- [x] Telefon genişliği temel ekranlar
- [x] Hiyerarşi, yoğunluk, tutarlılık ve navigasyon
- [x] Tooltip, loading, empty ve error states (gözlenen yüzeyler)
- [x] Klavye/focus, kontrast ve renk körlüğü sinyalleri (gözlemsel)
- [x] Font, screen reader sinyalleri ve mobil kullanım (gözlemsel)
- [x] Uzun metin performansı ve player ergonomisi (kısmi; performans ölçümü değil)

### Teslimatlar

- [x] `00_SCOPE_AND_METHOD.md`
- [x] `01_EXECUTIVE_SUMMARY.md`
- [x] `02_INFORMATION_ARCHITECTURE.md`
- [x] `03_ONBOARDING_PROFILE_SETTINGS.md`
- [x] `04_CORE_LEARNING_LOOP.md`
- [x] `05_READING_EXPERIENCE.md`
- [x] `06_LISTENING_AND_AUDIO_SYNC.md`
- [x] `07_VOCABULARY_AND_REVIEW.md`
- [x] `08_PROGRESS_STATS_GAMIFICATION.md`
- [x] `09_CONTENT_LIBRARY_AND_DISCOVERY.md`
- [x] `10_IMPORT_AND_CONTENT_CREATION.md`
- [x] `11_SOCIAL_TUTORS_RETENTION.md`
- [x] `12_PRICING_AND_PAYWALLS.md`
- [x] `13_UX_RESPONSIVE_ACCESSIBILITY.md`
- [x] `14_CONCEPTUAL_PRODUCT_MODEL.md`
- [x] `15_FEATURE_INVENTORY.md`
- [x] `16_OPPORTUNITIES_AND_DIFFERENTIATION.md`
- [x] `17_MVP_RECOMMENDATION.md`
- [x] `18_OPEN_QUESTIONS_AND_FOLLOWUPS.md`
- [x] `ACCOUNT_CHANGES.md` oluşturuldu
- [x] `EVIDENCE_INDEX.md` oluşturuldu
- [x] `PROGRESS.md` oluşturuldu
- [x] `SUMMARY.md`

## Oturum günlüğü

### 26 Ağustos 2026 — Başlangıç

- Repository kapsamı kontrol edildi; geçerli `AGENTS.md` yok.
- `docs/research/competitors/lingq/evidence/` çalışma alanı oluşturuldu.
- T3 Browser ile `/en/` landing page desktop görünümünde incelendi.
- LingQ Method, 52 dil, içerik türleri, importer/AI beyanları, social proof ve FAQ kayıt altına alındı.
- `/en/signup/` public pricing sayfasında Premium ve Premium Plus sekmeleri incelendi; EUR fiyatlar ve Free limitleri kaydedildi. Hiçbir satın alma/trial/abonelik aksiyonu yapılmadı.
- `/en/accounts/new/` public signup başlangıcı incelendi; dil/seviye listeleri açıldı fakat hiçbir form alanı doldurulmadı veya gönderilmedi.
- Bulgular `01_EXECUTIVE_SUMMARY.md`, `03_ONBOARDING_PROFILE_SETTINGS.md`, `12_PRICING_AND_PAYWALLS.md` ve `EVIDENCE_INDEX.md` dosyalarına kaydedildi.

### 26 Ağustos 2026 — Authenticated öğrenme deneyi

- Fransızca Library ve Mini Stories yapısı incelendi; `1a - Michel est cuisinier, partie 1` reader'ı açıldı.
- Page View, Sentence View, inline translation, Premium Sentence Translation paywall'ı, audio player ve ayrı synchronized listening route'u denendi.
- `histoire`, `déjeune`, `voiture` ve `en voiture` ile sınırlı dört vocabulary öğesi oluşturuldu; statü 1 ve statü 4 davranışları karşılaştırıldı.
- Sentence review'da flashcard ve cümle sıralama tamamlandı; mikrofon gerektiren speaking adımı atlandı.
- Completion işaretine basınca kalan 50 mavi kelimenin ara onaydan önce Known yapılması ve `Back` ile geri alınmaması kaydedildi.
- Profile deney sonu metrikleri yalnız seçici DOM alanlarından, kimlik verisi alınmadan kaydedildi.

### 26 Ağustos 2026 — Sentez ve teslimat

- Authenticated Library/IA, profile/settings, community/tutor, Create editor ve subscription matrisi metinsel kanıtlarla tamamlandı.
- Vocabulary list/review, import şeması ve iPad Air 820×1180 responsive kontrolü kanıt indeksine eklendi.
- 00–18 raporları, `SUMMARY.md`, `ACCOUNT_CHANGES.md` ve `EVIDENCE_INDEX.md` tamamlandı.
- Açık kalan paywall, import alignment, SRS ve onboarding ayrıntıları `18_OPEN_QUESTIONS_AND_FOLLOWUPS.md` içinde ayrı tutuldu.

## Yarım kalan / doğrulanamayan

- Onboarding mevcut hesap tarafından geçilmişse yalnızca erişilebilen ekran ve yardım içeriğiyle yeniden yapılandırılacak.
- Paywall arkasındaki veya ödeme onayı gerektiren davranışlar son adıma geçmeden kaydedilecek.
- Public T3 snapshot PNG'si repository dosyası olarak dışa aktarılamadı; kişisel verisiz metinsel kanıt kayıtları oluşturuldu.
- Completion eyleminin otomatik Known etkisi için güvenli toplu geri alma doğrulanamadı; ek toplu kelime işlemi yapılmayacak.
