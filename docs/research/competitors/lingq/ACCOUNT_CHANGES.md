# LingQ Hesap Değişiklikleri

**İnceleme tarihi:** 26 Ağustos 2026  
**Kapsam:** Araştırma sırasında LingQ hesabında oluşturulan bütün küçük ve güvenli durum değişikliklerinin günlüğü.

## Güvenlik sınırları

- Kimlik bilgileri, e-posta, gerçek isim, kullanıcı ID'si, ödeme bilgisi, token ve cookie kaydedilmez.
- Satın alma, trial/abonelik başlatma, ödeme yöntemi ekleme, rezervasyon, mesaj/gönderi/yorum yayımlama yapılmaz.
- Hesap, öğrenme verisi veya önemli ayarlar silinmez/sıfırlanmaz/değiştirilmez.
- Mevcut öğrenme verisi korunur.
- Öğrenme deneyi en fazla 5–10 vocabulary öğesi ve tek kısa dersle sınırlıdır.

## Değişiklik günlüğü

| Tarih-saat (Europe/Paris) | Dil | Ekran/route | Eylem | Değişen durum | Geri alınabilirlik | Sonuç/not |
| --- | --- | --- | --- | --- | --- | --- |
| 26 Ağustos 2026, yaklaşık 17:36 | Fransızca | `1a - Michel est cuisinier, partie 1`; `/en/learn/fr/web/reader/23800720` | `histoire` kelimesine tıklandı ve `Story` anlamı seçildi | İlk LingQ oluşturuldu; otomatik statü `1`; üst sayaç `11/400 Coins` | Reader'daki silme simgesiyle geri alınabilir görünüyor; araştırma boyunca deney tutarlılığı için korunacak | Onboarding “first LingQ” başarısını gösterdi; kullanıcı tarafından izin verilen 5–10 kelime sınırı içinde 1/10 |
| 26 Ağustos 2026, yaklaşık 17:57–18:00 | Fransızca | Aynı reader; page/listen/sentence görünümleri | Kısa ses birkaç kez oynatıldı, duraklatıldı ve zaman çizgisinde 5 saniye ileri/geri gidildi; senkron metin görünümü açıldı | Listening ve study-time telemetrisi oluştu; ayar/playlist değişmedi | Pasif aktivite metriği geri alınmadı | Deney sonunda `Hours of Listening 0.02`; ses hızı listesi yalnız açıldı, hız değiştirilmedi |
| 26 Ağustos 2026, yaklaşık 18:00 | Fransızca | Sentence View → `Review Sentence` | `histoire` için kart çevrildi; doğru/yeşil yanıt seçildi; cümle parçaları doğru sıraya getirildi; konuşma egzersizi mikrofon açılmadan `Skip` edildi | Bir review olayı oluşmuş olabilir; `histoire` statüsü görünür olarak `1` kaldı | Vocabulary statüsü değişmedi | Mikrofon veya konuşma kaydı başlatılmadı |
| 26 Ağustos 2026, yaklaşık 18:02 | Fransızca | Reader | `déjeune` için `to (have) lunch` anlamı seçildi | LingQ oluşturuldu; statü `1` | Reader'dan geri alınabilir görünüyor; korunacak | İzin verilen sınır içinde 2/10 tekil vocabulary öğesi |
| 26 Ağustos 2026, yaklaşık 18:04 | Fransızca | Reader | `voiture` için `car` anlamı seçildi, ardından statü `4` yapıldı | LingQ oluşturuldu; `Known Words +1` ve `LingQs Learned +1` ile ilişkilendi | Statü reader'dan yeniden ayarlanabilir | İzin verilen sınır içinde 3/10 tekil vocabulary öğesi; UI statüsü `4`, DOM renk sınıfı sıfır-tabanlı göründüğünden `lingq-status-3` |
| 26 Ağustos 2026, yaklaşık 18:05 | Fransızca | Reader → Related Phrases | `en voiture` ifadesi seçildi, `by car` anlamı kaydedildi | Phrase LingQ oluşturuldu; statü `1`; toplam `LingQs Created` 4 oldu | Reader/vocabulary'den geri alınabilir görünüyor | İzin verilen sınır içinde 4/10 vocabulary öğesi |
| 26 Ağustos 2026, yaklaşık 18:06 | Fransızca | Reader tamamlanma kontrolü | Sağdaki tamamlanma işareti tıklandı; sistem “I know these 50 words / Complete your lesson” ekranını açtı; toplu onay düğmesine basılmadı ve `Back` seçildi | Ekrana giriş anında kalan 50 mavi kelime otomatik `Known` oldu; `Lessons Completed 1`, `Known Words 51`, `Coins 904`, `1 Day Streak` oluştu. `Back` değişiklikleri geri almadı | Uygulamada güvenli bir toplu geri alma doğrulanamadı; ek toplu işlem yapılmadı | Kullanıcının izin verdiği tek kısa ders tamamlama eyleminin beklenmeyen otomatik sonucu. Bu değişiklik özellikle kanıtlandı ve raporda önemli UX/metrik riski olarak ele alınacak |

## Deney sonu toplam etkisi

- Oluşturulan vocabulary: 3 tekil kelime LingQ'su + 1 phrase LingQ'su = 4.
- Görünür statüler: `histoire` 1, `déjeune` 1, `voiture` 4, `en voiture` 1.
- Ders tamamlama eylemi öncesi header `1 Known Word`; tamamlama ekranı sonrası Profile `51 Known Words` gösterdi.
- Satın alma, trial, abonelik, ödeme, tutor rezervasyonu, mesaj/gönderi, ayar değişikliği, import/yayınlama veya veri silme yapılmadı.
