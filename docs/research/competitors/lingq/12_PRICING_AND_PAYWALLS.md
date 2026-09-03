# LingQ Pricing, Paywall ve Monetization

**İnceleme tarihi:** 26 Ağustos 2026  
**Para birimi:** EUR  
**Bağlam:** Giriş yapılmamış public pricing, Europe/Paris oturumu. Fiyatlar bölgeye, hesaba, kampanyaya ve tarihe göre değişebilir.

## Erişim yolu

- Landing footer `Pricing` → `/en/signup/`
- Header `Summer Sale / Special Offer / Save up to 45%` banner'ı da kampanyalı acquisition yüzeyidir; hedefi ayrıca authenticated aşamada kontrol edilecek.
- Hiçbir `Sign up` düğmesine basılmadı; ödeme, trial veya abonelik başlatılmadı.

## Premium fiyatları

**Doğrudan gözlemlendi — 26 Ağustos 2026:** [LQ-PRICE-001]

| Dönem | Gösterilen aylık karşılık | Peşin gösterilen toplam | İndirim etiketi | Not |
| --- | ---: | ---: | ---: | --- |
| 1 ay | €14,99/ay | €14,99 | — | Aylık seçenek |
| 12 ay | €10,00/ay | €119,99 / 12 ay | %33 | `Most Popular` |
| 24 ay | €8,99/ay | €215,76 / 24 ay | %40 | `Best Value` |

Sayfa seçilen dönemin tamamının peşin tahsil edildiğini ve üyeliğin iptal edilene kadar tekrar eden biçimde yenilendiğini belirtiyor.

## Premium Plus fiyatları

**Doğrudan gözlemlendi — 26 Ağustos 2026:** [LQ-PRICE-002]

| Dönem | Gösterilen aylık karşılık | Peşin gösterilen toplam | İndirim etiketi | Not |
| --- | ---: | ---: | ---: | --- |
| 1 ay | €26,99/ay | €26,99 | — | Aylık seçenek |
| 12 ay | €20,00/ay | €239,99 / 12 ay | %26 | `Most Popular` |

**LingQ tarafından belirtiliyor:** Premium Plus, Premium'daki her şeye ek olarak `6x Audio Transcription`, `AI Voices`, `Advanced Lynx Chat` ve `AI Simplified Lessons` sunuyor. `6x` ifadesinin baz limiti ve süre birimi public görünümde açıklanmadı.

## Free ve Premium feature gating

Public karşılaştırma matrisi şu sınırları ve kilitleri gösteriyor: [LQ-PRICE-001]

| Özellik | Free | Premium | Gözlem notu |
| --- | --- | --- | --- |
| Audio + transcript kütüphanesi | Var | Var | “Thousands of hours” ürün beyanı |
| Save words & phrases | 20 | Unlimited | Free çekirdek vocabulary duvarı |
| Imported content ile lesson oluşturma | 5 | Unlimited | Limitin toplam mı dönemsel mi olduğu yazmıyor |
| Audio playlists | 1 | Daha geniş/limitsiz | Premium değeri olarak sunuluyor; tam limit metni görünmedi |
| Flashcard quizzes | Kilitli | Var | Review özelliği gating |
| Full Sentence Translations | Kilitli | Var | Reading bağlam desteği gating |
| Imported lesson için auto-generated audio | Kilitli | Var | Import + listening gating |
| Statistic tracking | Kilitli | Var | Progress görünürlüğü gating |
| Language learning challenges | Kilitli | Var | Gamification/retention gating |
| Offline access | Kilitli | Var | Mobil/offline değer gating |

Matristeki ikonlar metin snapshot'ına tam yansımadığı için “Premium'da sınırsız audio playlist” gibi miktarı açıkça yazmayan ayrıntılar authenticated paywall ile yeniden doğrulanmalıdır.

## Authenticated hesapta görülen plan matrisi ve gerçek paywall'lar

**Doğrudan gözlemlendi — 26 Ağustos 2026:** [LQ-PRICE-003]

Giriş yapılmış ücretsiz hesapta `/en/accounts/subscription/?source=topNav` açıldı; hiçbir upgrade CTA'sı onaylanmadı. Yıllık kartlar Premium için **€10/ay, €119,99 yıllık, Save 33%**, Premium Plus için **€20/ay, €239,99 yıllık, Save 26%** gösterdi. Karşılaştırma tablosunda şu ayrımlar görünüyordu:

| Özellik | Free görünümü | Premium | Premium Plus | Ürün etkisi |
| --- | --- | --- | --- | --- |
| Word & Phrase Lookup | 20 LingQ limiti | Unlimited | Unlimited | Çekirdek kelime etkileşimi erken sınırlanıyor |
| Imported lesson | 5 | Daha yüksek/limitsiz olarak sunuluyor | Daha yüksek/limitsiz olarak sunuluyor | Import kapasitesi gelir duvarı |
| Lynx AI | Tek seferlik küçük kredi | Orta recharge | 5x | Kota ve model maliyeti ayrıştırılıyor |
| Audio Transcription | — | 600 dk/ay | 3.600 dk/ay (6x) | Açık, ölçülebilir maliyet kotası |
| TTS | Standard | InWorld | ElevenLabs | Ses kalitesi kademeli paketleniyor |
| Lesson Playlists | 1 | — | — | Free organizasyon limiti |
| Learning Progress Stats | — | Var | Var | Free kullanıcı öğrenme geri bildirimini kaybediyor |
| Offline Lesson Access | — | Var | Var | Offline paywall |
| Full-Sentence Translations | — | Var | Var | Reader içinde premium kırılması |
| Karaoke Mode | — | Var | Var | Ses-metne ileri etkileşim premium |
| AI Vocab & Grammar Lookup | — | Var | Var | AI sözlük paywall'ı |

Reader deneyinde önemli bir ayrım gözlendi: Page View'daki **Show Translation**, dersin mevcut satır içi İngilizce çevirisini ücretsiz gösterdi; Sentence View'daki aynı isimli eylem ise **Premium Feature — Sentence Translation** modalını açtı. Bu nedenle public matristeki `Full-Sentence Translations −` işaretini, ders kaynaklı çevirinin tamamının yokluğu değil, cümle bazında üretilen/etkileşimli çeviri özelliğinin kilidi olarak yorumlamak gerekir (**çıkarım, orta güven**).

## Points ve tutor monetization

**LingQ tarafından belirtiliyor:** Pricing FAQ'ya göre points; writing correction, live conversation ve premium lessons için kullanılıyor. Points satın alınabiliyor veya tutoring, referral ve Library'ye lesson paylaşma ile kazanılabiliyor. [LQ-PRICE-001]

**Doğrulanamadı:** Point paket fiyatı, tutor komisyonu, booking akışı ve refund koşulları bu aşamada test edilmedi.

## İptal ve üyelik yönetimi

- **LingQ tarafından belirtiliyor:** Login sonrası Account sayfasından membership level değiştirilebilir; değişiklik “right away”, ücret yeni membership için sonraki billing date'te alınır. Ayrıntının proration davranışı net değil. [LQ-PRICE-001]
- **LingQ tarafından belirtiliyor:** Landing FAQ, subscription auto-renewal veya free trial'ın her zaman iptal edilebildiğini söylüyor. [LQ-PUB-005]
- **LingQ tarafından belirtiliyor:** Pricing FAQ'daki farklı bir soru `Cancel your account` bağlantısının hesabı hemen iptal edip bütün veriyi sileceğini söylüyor. Bu abonelik yenilemesini durdurma ile hesabı/veriyi silme arasında yüksek riskli bir ayrım yaratıyor. [LQ-PRICE-001]
- **Doğrulanamadı:** Authenticated Account sayfasındaki etiketler, uyarılar, grace period, export fırsatı ve subscription-only cancel yolu kullanıcı güvenlik sınırları içinde gözlenecek; hiçbir iptal işlemi yapılmayacak.

## Pazarlama ve fiyat netliği

### Güçlü yönler

- 1/12/24 aylık Premium toplamları ve aylık eşdeğerleri aynı kartta görünüyor.
- Recurring ve upfront charge metni pricing sayfasında açıkça yer alıyor.
- Free limitlerinin çekirdek ürün özellikleriyle karşılaştırılması ücretli değeri anlaşılır kılıyor.
- Premium Plus'ın AI ağırlıklı değer paketi Premium'dan ayrılıyor.

### Sürtünmeler ve riskler

- Header “Save up to 45%” diyor; görünür Premium kartlarındaki en yüksek indirim %40, Premium Plus'ta %26. %45 koşulu ilk pricing görünümünde açıklanmadı.
- `Pricing` route'unun `/signup/` olması fiyat araştırmasını kayıt/acquisition terminolojisiyle karıştırıyor.
- `Premium Plus` adı, 6x transkripsiyonun baz kotasını ve AI özelliklerinin kullanım limitlerini açıklamıyor.
- Free 20 word/phrase sınırı, kullanıcının reader→vocabulary→review değerini anlaması için fazla erken bitebilir.
- Statistic tracking'in Premium kilidi olması, ücretsiz kullanıcının gelişim duygusunu ve doğal retention döngüsünü zayıflatabilir.
- Bir asterisk “90 gün hedeflerini karşılama” koşulu gösteriyor; neyin koşulu olduğu metin snapshot'ında açık değil ve doğrulanmalı.

## Paywall hipotezleri

| Hipotez | Durum | Güven |
| --- | --- | --- |
| 21. saved word/phrase çekirdek reader akışında upgrade duvarı çıkarır | Doğrulanacak | Orta |
| 6. imported lesson yeni importu engeller veya upgrade ister | Doğrulanacak | Orta |
| Vocabulary review quizleri Free kullanıcıda tamamen kapalıdır | Public matrix bunu belirtiyor; uygulamada doğrulanacak | Orta-yüksek |
| Progress/statistics ekranı Free kullanıcıda sınırlı veya kilitlidir | Public matrix bunu belirtiyor; hesap planı belirleyici | Orta |
| Premium Plus AI özellikleri ayrıca kota iletişimi gösterir | Doğrulanacak | Düşük |

Gerçek reader deneyi sırasında dört öğe oluşturulduğu için 20'lik Free limiti aşılmadı; 21. öğe ile sınır davranışı özellikle tetiklenmedi. Flashcard review ekranı açılabildi, ancak plan matrisi `Flashcard quizzes`i Premium olarak işaretlediğinden bunun ücretsiz hesapta hangi alt adımda kilitlendiği doğrulanamadı.

## Bizim ürünümüz için sonuç

Import/transcription maliyetleri için kota mantığı anlaşılır; fakat çekirdek learning-loop doğrulamasını 20 kelimede kesmek kullanıcıya değeri göstermeden ödeme isteme riski taşır. Bizim üründe ücretsiz kullanıcı en az bir tam “seç → oku/dinle → bağlamda kelime öğren → progress gör → yeni input” döngüsünü yaşayabilmeli; maliyetli AI/transcription kapasitesi ayrı ve şeffaf kota ile sınırlandırılmalıdır.
