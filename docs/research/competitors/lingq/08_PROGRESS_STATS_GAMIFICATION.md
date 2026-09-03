# LingQ İlerleme, İstatistikler ve Gamification

**İnceleme tarihi:** 26 Ağustos 2026  
**Durum:** Kontrollü deney öncesi/sonrası ölçümler kaydedildi. Challenge/leaderboard ve manuel activity davranışları gözlenebilen giriş noktalarıyla sınırlı tutuldu; ayrıntılar açık sorulara taşındı.

## Erişim

- Route: `/en/learn/fr/web/profile`
- Giriş yolu: Sol alt kullanıcı menüsü → `Profile`.
- Dile özel bağlam: Fransızca. Profile sayfası Fransızca için level ilerlemesi, haftalık aktivite, streak, özet ve detailed stats gösteriyor.
- Kişisel profil alanları kanıta alınmadı; yalnız öğrenme metrikleri kaydedildi.

## İlk ölçüm: reader açılışı + 1 LingQ sonrası

İlk ölçüm, tamamen yeni görünen Fransızca Library'den kısa Mini Story açılıp tek bir kelimede (`histoire`) önerilen anlam seçildikten sonra alındı. Detailed Stats `CHANGE` sütunları, ilgili yeni eylemleri ayrıca doğruladı. [LQ-PROG-001]

| Metrik | Toplam | Gösterilen değişim | Gözlenen tetikleyici |
| --- | ---: | ---: | --- |
| Coins Earned | 19 | +19 | Lesson açma, translation/meaning kullanma ve ilk LingQ onboarding'i birlikte |
| Study Time | 00:04 | 00:00 | Sayfada yaklaşık dört dakika bulunma; change yuvarlaması belirsiz |
| LingQs Created | 1 | +1 | `histoire` için `Story` anlamını seçme |
| Known Words | 0 | 0 | Henüz hiçbir kelime known yapılmadı |
| LingQs Learned | 0 | 0 | Statü 1 LingQ learned sayılmadı |
| Hours of Listening | 0.00 | 0.00 | Audio henüz oynatılmadı |
| Words of Reading | 158 | +158 | Mini Story reader'ının açılması; bilinçli kaydırma/tek tek okuma yapılmadı |
| Hours of Speaking | 0.00 | 0.00 | Aktivite yok |
| Words of Writing | 0 | 0 | Aktivite yok |
| Lessons Completed | 0 | 0 | Ders tamamlanmadı |
| Lessons Taken | 1 | +1 | Reader açıldı |
| Lessons Imported | 0 | 0 | Import yapılmadı |
| Lessons Published | 0 | 0 | Yayın yapılmadı |
| Lessons Shared | 0 | 0 | Paylaşım yapılmadı |
| Translations Used | 1 | +1 | Popular Meaning seçildi |
| Translations Shared | 0 | 0 | Paylaşım yapılmadı |
| Reading Speed | 37 | 0 | Nasıl hesaplandığı doğrulanmadı |

### Hedef ve streak

- **Doğrudan gözlemlendi:** `0 Day Streak`.
- **Doğrudan gözlemlendi:** Header/profile sayaçları kısa gecikmeyle farklı değer gösterdi: reader önce `11/400 Coins`, profile daha sonra `19/400 Coins` gösterdi.
- **Doğrudan gözlemlendi:** Profile “You have 6 hours 8 minutes to reach your goal” metnini gösterdi.
- **Doğrudan gözlemlendi:** Fransızca level hedefi `680 Known Words to Beginner 1` olarak gösterildi; mevcut Known Words 0.
- **Çıkarım — orta güven:** `400 Coins` günlük hedef olabilir; hesap ayarları ve zaman penceresi henüz doğrulanmadı.
- **Çıkarım — düşük güven:** “6 hours 8 minutes” kalan süre tahmini coin kazanım hızına dayanıyor olabilir. Algoritma doğrulanmadı ve bir dakikadan kısa eylem seti için aşırı kesin görünüyor.

## İlk metrik değerlendirmesi

| Metrik | Nasıl artıyor | Neyi temsil ediyor | Gerçek öğrenmeyle ilişkisi | Manipülasyon/yanılma riski | Bizim ürün için karar |
| --- | --- | --- | --- | --- | --- |
| Words of Reading | Bu deneyde lesson reader'ının açılması 158 kelimeyi topluca ekledi | Maruz kalınan metin hacmi | Düşük–orta; gerçekten okunup anlaşılma doğrulanmıyor | Yüksek; lesson açmak yeterli görünüyor | Adapt: görünürlük/süre/anlama sinyaliyle birleştir |
| Lessons Taken | Reader açıldığında +1 | Açılan/başlanan lesson | Düşük | Yüksek; tamamlama veya çaba gerektirmiyor | Skip ana başarı metriği olarak; yalnız history |
| Translations Used | Bir meaning seçilince +1 | Lexical yardım kullanımı | Orta; bilinmeyen kelimeyle gerçek etkileşim var | Orta; rastgele tıklanabilir | Adopt yardımcı davranış sinyali olarak |
| LingQs Created | Meaning seçilince +1 | Kaydedilen vocabulary öğesi | Orta; dikkat ve niyet sinyali | Orta; liste biriktirme öğrenme değildir | Adapt: bağlam + sonraki recall ile değerlendir |
| Coins | Birkaç ürün davranışının birleşimi | Günlük çaba/gamification | Dolaylı | Yüksek; ödül ağırlıkları öğrenme yerine tıklamayı optimize edebilir | Experiment; açıklanabilir ağırlıklar |
| Known Words | Statü 4 veya lesson completion'ın kalan mavi kelimeleri topluca Known yapması | Kullanıcının bildiğini beyan ettiği söz varlığı | Düşük–orta; self-report ve completion varsayımı | Çok yüksek; bu deneyde tek completion tıklaması +50 yaptı | Adapt: bağlam içi tekrar ve güvenle birlikte; completion'dan ayır |
| Reading Speed | Reader zaman/kelime oranı olabilir | Okuma temposu | Düşük–orta | Yüksek; sekme açık kalması veya toplu sayım etkileyebilir | Later; önce doğrulama |
| Study Time | Sayfada geçirilen süreden artıyor gibi görünüyor | Üründeki aktif süre | Dolaylı | Orta–yüksek; idle ayrımı bilinmiyor | Adapt: aktif etkileşim pencereleri |

## Deney sonu ölçümü

Reader, audio, Sentence View, dört vocabulary öğesi ve completion işareti denendikten sonra Profile yeniden ölçüldü. Yalnız öğrenme metrikleri seçici olarak çıkarıldı; profil kimliği kaydedilmedi. [LQ-PROG-002]

| Metrik | İlk ölçüm | Deney sonu | Gözlenen açıklama |
| --- | ---: | ---: | --- |
| Coins Earned | 19 | 904 | Vocabulary/statü/review ve özellikle lesson completion sonrası büyük sıçrama |
| Study Time | 00:04 | 00:17 | Reader/review/profile oturumu boyunca arttı |
| LingQs Created | 1 | 4 | Üç kelime + bir phrase kaydı |
| Known Words | 0 | 51 | `voiture` statü 4 ile önce 1; completion işaretiyle kalan 50 mavi kelime topluca Known |
| LingQs Learned | 0 | 1 | `voiture` statü 4 ile ilişkilendi; completion'daki daha önce kaydedilmemiş kelimeler Learned LingQ sayılmadı |
| Hours of Listening | 0.00 | 0.02 | Kısa ses oynatımları ve seek deneyi |
| Words of Reading | 158 | 406 | Reader route'una yeniden girişler; gerçek okuma hacminden çok açılış/tekrar sayımı etkili |
| Hours of Speaking | 0.00 | 0.00 | Speaking review adımı mikrofon açılmadan atlandı |
| Words of Writing | 0 | 0 | Aktivite yok |
| Lessons Completed | 0 | 1 | Completion işaretine tıklama; sonraki `Back` geri almadı |
| Lessons Taken | 1 | 1 | Aynı lesson tekrar açıldığında yeni lesson olarak sayılmadı |
| Translations Used | 1 | 4 | Kaydedilen meaning/phrase seçimleri ve translation etkileşimleri |
| Reading Speed | 37 | 27 | Aynı kısa metnin açılış/süre değişimiyle düştü; güvenilirlik düşük |

### Completion'ın toplu etkisi

- **Doğrudan gözlemlendi:** Tamamlanma kontrolü “Complete your lesson” ekranını açtı ve “These words will be marked as known” açıklamasıyla kalan 50 kelimeyi listeledi. Toplu onay düğmesine basılmadı.
- **Doğrudan gözlemlendi:** Bu ekrana giriş anında Profile `Known Words 51`, `Lessons Completed 1`, `Coins Earned 904` ve `1 Day Streak` gösterdi. `Back` bunları geri almadı. [LQ-COMP-001]
- **Doğrudan gözlemlendi:** Level göstergesi `629 Known Words to Beginner 1` oldu; ilk ölçümde 680 idi. Bu, 51 kelimelik farkla tam eşleşir.
- **Çıkarım — yüksek güven:** LingQ lesson completion'ı, kalan bütün mavi kelimeleri “kullanıcı biliyor” varsayımıyla otomatik self-report'a dönüştürüyor.
- **Ürün riski:** Kullanıcı yalnız dersi bitirmek isterken vocabulary modelini topluca ve önceden açık onay olmadan değiştirebiliyor. Bu hem geri dönüşü zor UX hem de Known Words/coin/streak metriklerini tek tıkla şişirme riski.

## Gözlemsel UX

- Haftalık üst özet reading, listening, LingQ created, speaking ve writing'i aynı sırada gösteriyor; eksik alanlarda `Attention` veya `Not Added` dili kullanıyor.
- Streak, Last 7 Days/Month takvimiyle ayrı bir modül.
- Summary dönemleri Today, Last 7 days, Last 30 days, This month, Last 3/6 months ve All Time.
- Detailed Stats hem toplamı hem `CHANGE` sütununu verdiği için kontrollü deneyde hangi aksiyonun neyi etkilediğini izlemek güçlü.
- `Speaking` ve `Writing` otomatik ölçülmüyorsa manuel ekleme veya tutor akışıyla ilişki ileride incelenecek.

## Doğrulanacaklar

- [ ] Audio oynatımı Listening metriğini ne zaman ve hangi hassasiyetle artırıyor?
- [ ] Lesson completion ile `Lessons Completed`, streak ve coin nasıl değişiyor?
- [ ] Known statüsü Known Words ve LingQs Learned'i nasıl etkiliyor?
- [ ] Review sonucu Learned LingQs'i etkiliyor mu?
- [ ] 400 Coins hedefinin zaman penceresi ve ayarı nedir?
- [ ] Reading Speed ve Study Time idle davranışı.
- [ ] Manual activity ekleme.
- [ ] Challenges, badges, leaderboard ve milestones.

## Bizim ürünümüz için sonuç

LingQ ayrıntılı davranış telemetrisiyle motivasyon sağlar; ancak `Words of Reading` ve `Lessons Taken` bu ilk deneyde öğrenme gerçekleşmeden artabildi. Bizim üründe hacim metrikleri “exposure” olarak adlandırılmalı, başarı metriği gibi sunulmamalı; görünür okuma, audio takip, bağlam yardımı, kısa anlama kontrolü ve sonraki recall ayrı sinyaller olarak dürüstçe gösterilmelidir.
