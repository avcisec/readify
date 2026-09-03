# Fırsatlar ve Farklılaşma

**İnceleme tarihi:** 26 Ağustos 2026

| Fırsat | Gözlenen problem | Önerilen yaklaşım | Kullanıcı değeri | Teknik zorluk | Risk | MVP uygunluğu |
| --- | --- | --- | --- | --- | --- | --- |
| Dürüst ilerleme | Reader açılışı read words'u artırıyor; completion 50 Known'ı erken yazıyor | Ayrı read exposure, confirmed known ve demonstrated recall metrikleri | Gerçek gelişim algısı | Orta | Daha yavaş motivasyon | Yüksek |
| Açıklanabilir input seçimi | Unknown yüzdesi var, kişisel uygunluk nedeni yok | CEFR tahmini + bilinmeyen oranı + süre + “neden önerildi” | A2/B1 için güvenli seçim | Orta | Seviye tahmini hatası | Yüksek |
| Net translation katmanları | Lesson translation free, sentence translation premium; aynı isim | Source translation, AI translation ve hint'i ayrı adlandır | Akışta sürpriz azalır | Düşük | UI metin yükü | Yüksek |
| Sync güven puanı | Import alignment ve manuel düzeltme görülmedi | Segment confidence, cümle düzeltme ve fallback transcript | Dinleme güvenilirliği | Yüksek | Yanlış otomasyon | Orta |
| Bağlam öncelikli vocabulary | Popular Meanings gürültülü, status öz-bildirim | Tek bağlama uygun anlam + source sentence + phrase önerisi | Daha hızlı kavrama | Orta | Yanlış anlam seçimi | Yüksek |
| Review açıklanabilirliği | SRS var ama neden/schedule belirsiz | Due nedeni, tekrar geçmişi ve “hatırlamadım” seçeneği | Kontrol duygusu | Orta | Fazla metin | Yüksek |
| Güvenli completion | Completion geri alınamayan bulk Known etkisi yaptı | Önizleme, seçmeli onay, undo ve audit log | Veri güveni | Düşük | Onay adımı uzar | Yüksek |
| Sade mobil reader | Panel ve icon-only kontroller yoğun | Bottom sheet, görünür label, keyboard/ARIA | Telefon kullanımında erişilebilirlik | Orta | Ekran alanı | Yüksek |
| Private-first import | URL/streaming ve public paylaşım telif riski taşıyor | Taslak private, açık public adımı, telif kontrolü | Güven ve taşınabilirlik | Orta | Daha az UGC büyümesi | Yüksek |
| AI sınırları | AI lookup/translation paywall; kalite belirsiz | AI yalnız belirsiz anlamı açıklar, kaynağı gösterir; doğru metadata için deterministik sistem | Daha tutarlı öğrenme | Orta | Halüsinasyon | Orta |
| Fransızca kişiselleştirme | Generic level filtresi A2/B1 farkını yakalamıyor | Liaison, elision, gender ve high-frequency phrase setleri | Hedef kullanıcıya hız | Orta | İçerik üretim maliyeti | Yüksek |
| Social opt-in | Forum/tutor çekirdekten ayrık ve privacy hassas | Sonradan açılan, varsayılan private paylaşım | Güvenli destek | Orta | Düşük erken ağ etkisi | Düşük |

## Bizim ürünümüz için sonuç

En güçlü ayrışma, LingQ'nun geniş ekosistemini kopyalamak değil; daha dürüst metrik, daha iyi seviyeye uygun içerik açıklaması ve daha güvenilir audio-text sync üçlüsüdür. Bunlar reading-listening-vocabulary döngüsünü doğrudan iyileştirir.
