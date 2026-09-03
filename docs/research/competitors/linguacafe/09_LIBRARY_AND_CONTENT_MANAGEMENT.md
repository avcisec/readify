# Library ve içerik yönetimi

Library `/books` tablo/grid düzeni, arama, Create book ve Import CTA’ları taşır. Book görünümünde toplam/unique/known/highlighted/new sayıları, chapter tablosu, edit/read/delete aksiyonları bulunur. Chapter işlendiğinde `processing_status=processed` olur; failed/retry route’ları kaynakta mevcuttur. Kaldığın chapter ve son içerik önerisi sınırlıdır; seviyeye göre otomatik öneri bu incelemede doğrulanmadı.

## Bizim ürünümüz için sonuç

Kütüphane kaynak türü, dil, seviye, bilinmeyen oranı, süre ve sync kalitesiyle filtrelenmeli. Import duplicate fingerprint’i kullanıcıya “mevcut kaynağı kullan / yeniden işle” seçeneği vermeli.
