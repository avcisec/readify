# Vocabulary, Dictionary ve Review

**İnceleme tarihi:** 26 Ağustos 2026

## Vocabulary modeli

Vocabulary listesi `/en/learn/fr/web/library/vocabulary/all` üzerinde `All / Phrases / Due for Review (SRS)` sekmelerini, Search, Filters ve More Actions'ı sunuyor. Satırlar TERM, MEANING, SOURCE TEXT, STATUS alanlarına ayrılıyor; her satırda çöp kutusu, 1–4 status düğmeleri ve Known kontrolü var. Dört deney öğesi source snippet'leriyle listelendi: `histoire` (Story, 1), `déjeune` (to have lunch, 1), `voiture` (car, 4), `en voiture` (by car phrase, 1). [LQ-VOC-001], [LQ-VOC-002]

Status anlamları arayüz filtresinde `1-New`, `2-Can't Remember`, `3-Not Sure`, `4-Learned`, ayrıca Known olarak açıklanıyor. DOM sınıfındaki zero-based adlandırma raporlanmadı; kullanıcıya görünen etiket esas alındı.

## Dictionary ve anlam kalitesi

Reader paneli sözlük kaynaklarını ve topluluk/popüler anlamları bir arada sunuyor. `Type new meaning`, tag ve notes alanları var. Related Phrases, tek kelimeden daha doğal birim kaydetmeyi sağlıyor. Buna karşılık Popular Meanings listesi çok dilli, uzun ve bağlam dışı seçeneklerle karar yükünü artırabiliyor. “Kelimeyi listede bilmek” ile bağlamda üretmek arasında otomatik garanti yok; status 4 kullanıcının öz-bildirimi.

## Review

`Review` → `/vocabulary/all/review` açıldığında 1/8…8/8 kartlı akış görüldü. İlk kart `en voiture` için doğru anlam seçimi (by car, Story, to have lunch, car) istiyordu. Daha önce Reader içindeki `Review Sentence` akışında anlam kartı, sentence ordering ve speaking adımları test edildi; speaking atlandı. Review scheduling'in hangi tarih/algoritma ile üretildiği yalnız `Due for Review (SRS)` etiketiyle ima ediliyor; ayrıntı doğrulanamadı.

Filters: Tags, Course, Sort A–Z/SRS Date, date, status. More Actions seçim yokken “Select terms to see options” dedi; toplu düzenleme güvenli şekilde denenmedi. Vocabulary Import, `.csv` ve beklenen kolonları (`term, phrase, tag1, tag2, meaninglanguage1, meaning1...`) açıklıyor; dosya yüklenmedi.

## Güçlü yönler ve sorunlar

- **Güçlü:** Reader'dan tek tıkla kalıcı vocabulary; status ilerlemesi ve source text; phrase desteği; SRS için ayrı yüzey.
- **Sürtünme:** Anlam listesi gürültülü; review modları ve status semantiği yeni kullanıcı için açıklamasız; bulk edit/import ergonomisi masaüstüne daha uygun.
- **Ölçüm riski:** Known/Learned büyük ölçüde kullanıcı tıklamasına dayanıyor; bağlam içinde doğru kullanım ölçülmüyor.

## Bizim ürünümüz için sonuç

MVP'de tek, bağlama dayalı anlam ve phrase kaydı; kısa aktif recall kartı; source sentence ve confidence birlikte verilmeli. SRS görünür “ne zaman neden geldi” açıklamasıyla sunulmalı. Status değişimi geri alınabilir ve batch preview'lı olmalı.

**Kanıt:** [LQ-READ-001], [LQ-SENT-001], [LQ-VOC-001], [LQ-VOC-002].
