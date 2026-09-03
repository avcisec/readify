# Import ve Content Creation

**İnceleme tarihi:** 26 Ağustos 2026  
**Güvenlik sınırı:** Telifli içerik yüklenmedi; dosya, URL, ses veya public yayın gönderilmedi.

## Editor akışı

`Create` → `/en/learn/fr/web/editor/` üzerinde üç adım görüldü: `1 Select Source → 2 Add Content → 3 Review & Import`. Açıklama, kullanıcının sevdiği gerçek içerikten lesson oluşturmayı vurguluyor. Kaynak kartları `Type or Paste`, `Web Links`, `Audio Transcription`, `Text Files & Ebooks`, `Scan`; ayrıca Netflix, Prime Video, YouTube, TikTok ve Instagram olarak gruplanıyor. [LQ-IMP-001]

`Type or Paste` seçilince Lexical contenteditable metin alanı açıldı (`Type or paste any text`). Metin girilmedi. Bu nedenle başlık/kapak, dil, transcript düzenleme, private/public, collection, processing süresi, boyut/format hataları ve Review & Import sonuçları **doğrulanamadı**.

## Audio–text soruları

UI, audio transcription'ı ayrı bir source olarak gösteriyor; public pazarlama AI transcript/translation/audio üretiminden söz ediyor. Ancak kullanıcıdan timestamp istenmesi, otomatik alignment, confidence, manuel düzenleme, sync başarısızlığı veya imported audio'da cümle/kelime vurgusu bu güvenli oturumda gözlenmedi. Bu nedenle teknik algoritma hakkında çıkarım yapılmamalıdır.

## Vocabulary import

Vocabulary ekranındaki `Import Terms` modalı yalnız `.csv` kabul ediyor ve kolon şemasını açıklıyor: `term, phrase, tag1, tag2, meaninglanguage1, meaning1, meaninglanguage2, meaning2`. Browse/Submit var; dosya seçilmedi ve import çalıştırılmadı. [LQ-VOC-002]

## Değerlendirme

- **Güçlü:** Kaynak seçimi içerik ekosistemini genişletiyor; üç adım, yükleme sonrası review vaadiyle güven veriyor.
- **Sürtünme:** Çok farklı kaynak türleri aynı ekranda; yeni kullanıcı için “hangi yol transcript'i otomatik hizalar?” sorusu yanıtsız.
- **Risk:** URL/streaming import telif, erişim ve transcript maliyeti taşır. Public yayın varsayılanı olursa kullanıcı hatası büyür; private taslak ve açık kota gerekir.

## Bizim ürünümüz için sonuç

MVP'de güvenilir text+audio birlikte yükleme ve basit transcript segment düzenleme yeterli. Otomatik hizalama sonucu güven puanı ve üç cümlelik düzeltme aracı, geniş kaynak kataloğundan önce yatırım yapılacak alan olmalı. Import dosyası private taslak başlamalı; public paylaşım ayrı, bilinçli bir adım olmalı.

**Kanıt:** [LQ-IMP-001], [LQ-VOC-002], [LQ-PRICE-003].
