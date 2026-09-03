# LingQ Derinlemesine Ürün Keşfi — Karar Özeti

**İnceleme tarihi:** 26 Ağustos 2026 · **Platform:** Web, desktop + 717×968 mobil gözlemi · **Dil senaryosu:** Fransızca A2 sonu–B1 başlangıcı

## 1. LingQ bir cümlede nedir?

LingQ, gerçek içerikleri okuyup dinlerken bilinmeyen kelime ve ifadeleri bağlam içinde kaydetme, review etme ve aktiviteyi ölçme üzerine kurulmuş immersion odaklı bir dil öğrenme ürünüdür. [LQ-PUB-001, LQ-PUB-005]

## 2. Temel ürün tezi

Drill yerine anlamlı input: kullanıcı sevdiği kitap/podcast/video/metinle karşılaşır; anlamadığını seçer; kelime/phrase kişisel sözlüğe dönüşür; tekrar ve istatistikler devamlılığı sağlar. Public vaat authenticated reader, player, vocabulary ve profile deneyinde büyük ölçüde görüldü.

## 3. Ana kullanıcı döngüsü

`Library'den uygun içerik seç → oku → bilinmeyen token'a dokun → bağlama uygun anlam/phrase kaydet → aynı metni dinle → kısa recall review → ilerlemeyi kontrol et → yeni input'a devam et.` Reader ve cümle seviyeli listen route'u bu döngüyü somutlaştırıyor. [LQ-AUTH-001, LQ-READ-001, LQ-LISTEN-001, LQ-PROG-002]

## 4. En güçlü 10 özellik

1. Reading ve listening'in aynı lesson etrafında birleşmesi.
2. Token'a tıklayarak bağlamdan kopmadan vocabulary oluşturma.
3. Phrase kaydı (`en voiture`) ve source sentence/snippet.
4. Cümle seviyesinde aktif audio–transcript senkronu ve seek.
5. Page View + Sentence View seçenekleri.
6. Dictionary, related phrases, notes ve tags'ın tek panelde olması.
7. Mini Stories ve seviye kategorileriyle geniş içerik başlangıcı.
8. Vocabulary status 1–4/Known ve SRS yüzeyi.
9. Profile'da detailed stats + change değerleri.
10. Type/paste, link, dosya ve transcription'ı aynı Create akışında toplama vaadi.

## 5. En önemli 10 problem/sürtünme

1. Completion, açık toplu onaydan önce 50 kelimeyi Known yaptı ve Back geri almadı. [LQ-COMP-001]
2. Reader açılışı `Words of Reading` sayacını anlamlı okuma olmadan artırdı.
3. Known/Learned metrikleri büyük ölçüde self-report.
4. Popular Meanings gürültülü ve doğru anlam seçimini kullanıcıya bırakıyor.
5. Ders çevirisi ile premium Sentence Translation aynı adla sunuluyor.
6. Activities ile Progress/Profile ayrımı IA'da belirsiz.
7. Sale/upgrade banner'ı öğrenme alanında kalıcı dikkat çekiyor.
8. SRS neden/schedule açıklaması görünmüyor.
9. Import alignment, hata, confidence ve manuel düzeltme akışı doğrulanamadı.
10. Icon-only player ve renk ağırlıklı status'lar erişilebilirlik riski taşıyor.

## 6. Reading analizi özeti

Reader güçlü bir lexical interaction yüzeyi: mavi unknown, status renkleri, dictionary/meaning, phrase, note/tag, Page/Sentence View. Ancak renkler tek başına açıklayıcı değil; cümle bazlı çeviri paywall'ı ve completion yan etkisi doğal akışı bozuyor. Bizim ürün: tek bağlama uygun anlam, açık status etiketi, undo ve source translation/AI translation ayrımı.

## 7. Listening ve audio-sync özeti

0.5x–2x hız, pause, ±5 saniye, continuous play ve sync-text kontrolleri var. Ayrı Listen route'unda aktif cümle vurgulanıyor ve cümleye tıklamak seek ediyor; word-level karaoke görülmedi. Dinleme sonrası `Hours of Listening 0.02` oldu. [LQ-LISTEN-001, LQ-PROG-002]

## 8. Vocabulary sistemi özeti

Reader'dan dört öğe oluşturuldu: üç kelime + bir phrase. Vocabulary listesi status 1–4/Known, source snippet, filtreler, SRS sekmesi, review kartları ve CSV şeması sunuyor. SRS scheduler ve review paywall'ının alt sınırı doğrulanamadı. [LQ-VOC-001, LQ-VOC-002]

## 9. İlerleme/istatistik özeti

Profile, coin, streak, Known Words, LingQs Created/Learned, read words, listening, study time, completed lesson ve reading speed gösteriyor. Kontrollü deneyde Known 0→51, LingQs 1→4, Lessons Completed 0→1, Coins 19→904, Streak 0→1 oldu. Hacim ve self-report metrikleri gerçek öğrenmeyi olduğundan iyi gösterebilir. [LQ-PROG-001, LQ-PROG-002]

## 10. Import sistemi özeti

Create editor `Select Source → Add Content → Review & Import` akışında paste, web link, text/ebook, audio transcription, scan ve streaming/social kaynakları sunuyor. Telifli dosya/URL gönderilmedi; otomatik transcript/alignment, hata ve public/private davranışı doğrulanamadı. Vocabulary için CSV import şeması açık. [LQ-IMP-001, LQ-VOC-002]

## 11. Monetization özeti

Public EUR Premium €14,99 aylık / €119,99 yıllık; Premium Plus €26,99 aylık / €239,99 yıllık (bölge ve kampanyaya göre değişebilir). Free'de 20 saved word/phrase, 5 import, 1 playlist; authenticated matriste stats, offline, full-sentence translation, karaoke ve AI lookup kilitli; audio transcription 600/3.600 dk kotalı. [LQ-PRICE-001, LQ-PRICE-002, LQ-PRICE-003]

## 12. Bizim ürün için alınabilecek fikirler

Bağlam içi token/phrase etkileşimi, cümle segmentli player, Mini Story benzeri kısa seri, source sentence, change tablosu ve “next suitable input” akışı. Özellikle reading–listening–vocabulary tek lesson kimliğinde tutulmalı.

## 13. Birebir alınmaması gereken fikirler

Onaysız bulk Known completion, yalnız renkle status, gürültülü çok dilli meaning listesi, açıklamasız SRS, erken 20-item duvarı, kalıcı sale banner'ı ve öğrenmeyi başarı gibi gösteren coins/read-word ağırlığı.

## 14. Farklılaşma fırsatları

Üç öncelik: (a) exposure/known/recall metriklerini dürüst ayırmak, (b) A2/B1 için bilinmeyen oranı ve öneri nedenini açıklamak, (c) sync confidence + kolay manuel düzeltmeyle güvenilir audio-text ilişkisi kurmak. [16_OPPORTUNITIES_AND_DIFFERENTIATION.md](16_OPPORTUNITIES_AND_DIFFERENTIATION.md)

## 15. Önerilen MVP

Fransızca text+audio lesson, token/phrase seçimi, source sentence, cümle segmentli player, geri alınabilir status, kısa recall review, dürüst progress ve uygun yeni input önerisi. Private type/paste import, CSV, TTS fallback ve mobil polish MVP Plus; community, tutor, streaming import, word karaoke, AI chat ve offline Post-MVP. [17_MVP_RECOMMENDATION.md](17_MVP_RECOMMENDATION.md)

## 16. En riskli teknik konular

Transcript/audio alignment; lemma–çekim ve phrase çözümleme; anlam önerisinin bağlama uygunluğu; SRS scheduler; active listening ölçümü; telif ve üçüncü taraf stream erişimi.

## 17. Cevaplanmamış sorular

21. vocabulary paywall'ı, onboarding'in gerçek sırası, çoklu dil progress'i, import hata/limitleri, mobile background audio, challenge/leaderboard, subscription cancellation/export ve alignment düzenleme akışı açık kaldı. [18_OPEN_QUESTIONS_AND_FOLLOWUPS.md](18_OPEN_QUESTIONS_AND_FOLLOWUPS.md)

## 18. Sonraki araştırılması gereken rakipler/testler

Önce ayrı test hesabıyla paywall sınırları ve telifsiz küçük import; sonra A2/B1 kullanıcılarla 5 görevlik usability testi. Rakip tarafında aynı döngüyü kıyaslamak için Readlang, Language Reactor, FluentU ve Migaku incelenebilir; seçim ve güncel ürün durumu ayrıca araştırılmalı.

## Karar listeleri

### Kesinlikle yap

- Cümle seviyesinde text+audio ve bağlam içi kelime/phrase kaydı.
- Geri alınabilir vocabulary status ve source sentence.
- Exposure, confirmed known ve recall'ı ayrı gösteren progress.
- A2/B1 uygun input açıklaması.
- Private-first import ve erişilebilir player.

### Deneyerek karar ver

- TTS fallback ve AI anlam yardımı.
- SRS aralığı, review kartı yoğunluğu ve streak.
- Phrase otomatik önerisi ve kelime düzeyi karaoke.
- CSV import/export ve geniş içerik önerileri.

### Şimdilik yapma

- Tutor marketplace, public community, leaderboard.
- Streaming/YouTube otomasyonu ve geniş telifli katalog.
- AI chat/grammar paketi ve çoklu ses sağlayıcısı.
- Onaysız completion bulk işlemleri veya coins'i ana başarı metriği yapmak.

**Kanıt politikası:** Bu karar özeti T3 Browser gözlemleri ve kontrollü tek kısa ders deneyine dayanır. Ekran görüntüsü dosyası üretilemedi; tüm referanslar [EVIDENCE_INDEX.md](EVIDENCE_INDEX.md)'de metinsel kanıt olarak listelendi. Kişisel veri, ödeme, trial, booking, public paylaşım ve yıkıcı hesap işlemi yapılmadı.
