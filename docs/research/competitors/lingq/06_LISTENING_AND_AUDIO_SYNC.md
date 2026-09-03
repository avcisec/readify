# Listening ve Audio–Text Senkronizasyonu

**İnceleme tarihi:** 26 Ağustos 2026

## Player ve akış

Reader altındaki mini player genişletildi. Play/pause, zaman slider'ı, ±5 saniye, speed (`0.5x, 0.6x, 0.75x, 0.9x, 1x, 1.25x, 1.5x, 2x`), `Continuous play`, `Show synchronized text` ve kapatma kontrolleri görüldü. Spacebar için pause tooltip'i vardı. [LQ-LISTEN-001]

Audio oynatılırken `/en/learn/fr/web/listen/23800720` route'u açıldı. Transcript cümle listesi ve toplam süre görünüyor; aktif cümle `is-playing`/stroke görünümüyle vurgulanıyor, gelecek cümleler gri. Sistem aktif cümleyi otomatik olarak görünür alana ortalıyor. Cümle satırına tıklamak yaklaşık ilgili timestamp'e seek etti; 00:27→00:32→00:27 ±5 davranışı doğrulandı.

## Senkronizasyonun sınırları

**Doğrudan gözlendi:** Cümle seviyesinde aktif vurgu ve timestamp seek vardır. **Görülmedi:** kelime seviyesinde karaoke vurgusu, ham timestamp düzenleyicisi veya alignment ayarı. Bu nedenle iç teknik algoritma hakkında çıkarım yapılmamalıdır. En fazla, transcript segmentleri ile ses zamanı arasında cümle düzeyi eşleme olduğu söylenebilir (**çıkarım, orta güven**).

Download Audio ve Continuous play menüleri mevcut; arka plan mobil oynatma, playlist'ten kesintisiz oynatma ve audio-only deneyimi bu oturumda doğrulanmadı. Native `<audio>`/`<video>` öğesi görünmedi; uygulama altyapısı hakkında sonuç çıkarılmadı. Import edilmiş ses, podcast/YouTube/audiobook ayrımı ve TTS kalite akışı doğrulanamadı.

## Ölçüm

Profile deney sonrasında `Hours of Listening 0.02` oldu. Reader açılışında dinleme sayacı değişmedi; gerçek audio oynatımı sonrasında arttı. Cümle tıklaması veya seek'in toplam dinleme süresini nasıl etkilediği ayrılamadı. [LQ-PROG-002]

## Değerlendirme

- **Güçlü:** Audio ve transcript aynı çalışma alanında; yavaşlatma ve ±5 saniye öğrenen kontrolünde.
- **Sürtünme:** Aktif cümlenin görsel sinyali kelime düzeyine inmiyor; Continuous play'nin açık/kapalı durumu görünür kalıcı ikonla doğrulanamadı.
- **Ürün riski:** Import edilen içerikte hizalama başarısızsa temel listening değeri bozulabilir; arayüzde hata/manuel düzeltme yolu gözlenmedi.

## Bizim ürünümüz için sonuç

MVP için güvenilir cümle segmenti + oynatma/seek yeterli; kelime karaoke'si sonraya bırakılabilir. Sync kalitesi, segment confidence ve manuel düzeltme yüzeyi ürünün farklılaşma alanıdır. Dinleme süresi yalnız gerçekten geçen audio zamanı ile ölçülmeli; seek ve tekrarlar açıkça tanımlanmalı.

**Kanıt:** [LQ-LISTEN-001], [LQ-PROG-002], [LQ-IMP-001].
