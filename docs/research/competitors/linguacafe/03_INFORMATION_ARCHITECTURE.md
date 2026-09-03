# Bilgi mimarisi

**İnceleme:** 31 Ağustos 2026 · **Kanıt:** LC-E002–LC-E004

## Ana yapı

```mermaid
flowchart TD
 Home[Home / Calendar] --> Library[Library /books]
 Library --> Book[Book /books/{id}]
 Book --> Reader[Reader /chapters/read/{id}]
 Reader --> Vocab[Vocabulary /vocabulary]
 Home --> Review[Review /review/{practice}/{book}/{chapter}]
 More[More] --> Settings[User settings]
 More --> Manual[User manual]
 More --> Admin[Admin settings]
 Admin --> Lang[Languages]
 Admin --> Dict[Dictionaries]
 Admin --> Fonts[Fonts]
 Admin --> Reviews[Review settings]
```

Alt navigasyon Home, Library, Vocabulary; mobilde alt çubukta bu üç alan görünür. `More` içinde Review, settings, manual, admin ve entegrasyonlar bulunur. Library’den import/create book; book’tan chapter/read, edit ve delete akışları başlar. Geri dönüş için global nav kullanılır; reader’da “Library” bitiş CTA’sı vardır.

## Gözlemsel değerlendirme

Tablo görünümü içerik listesinde verimli ancak mobilde aksiyonlar sıkışır; `More` menüsü güçlü fakat özellik keşfini gizler. Review URL parametreleri practice/book/chapter kapsamını ifade eder. Route değişimleri SPA bileşenini yeniden kullanabildiğinden araştırma navigasyonunda eski deste state’i korunabildi; ürün testlerinde tam sayfa geçişi ile doğrulanmalıdır.

## Bizim ürünümüz için sonuç

Çekirdek döngüyü üst seviyede görünür tut: İçerik → Reader → Vocabulary → Review → Progress. Admin ve maliyet panelleri kullanıcı öğrenme yüzeyinden ayrılmalı.
