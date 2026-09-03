# Vocabulary, review ve Anki

**İnceleme:** 31 Ağustos 2026 · **Kanıt:** LC-E009–LC-E011

`EncounteredWord` surface/base_word/reading/translation/stage/lookup/read/review alanlarını taşır; `Phrase` words JSON, reading, translation ve stage taşır. Word ve phrase stage’leri aynı negatif öğrenme seviyelerini kullanır. Stage seçimi aynı surface occurrence’larına yayılır; phrase indexing chapter processed sonrası görünür.

Dictionary French Wiktionary’den gelir; kullanıcı çevirisi textarea ile yazılır ve seçim kapatılırken kaydedilir. Otomatik sözlük sonucu otomatik olarak kullanıcı translation’ına dönüşmez; bu, değerli ama gizli bir kaydetme adımıdır. Vocabulary listesinde arama/filtre, CSV import/export ve AnkiConnect ayarları bulunur; reader toolbar “Send to anki” sunar. Kart üretiminin alan şablonu ve Anki sunucusu bu oturumda çalıştırılmadı.

Review, practice ve normal modlara ayrılır. Practice answer stage’i değiştirmez; normal correct stage’i bir kademe ilerletir, Again geriletir/relearning işaretleyebilir. Leitner benzeri tarih planı ReviewService ve reviewIntervals ayarlarıyla uygulanır.

## Bizim ürünümüz için sonuç

Flashcard bağlam cümlesi, surface+lemma, POS ve ses zamanlaması taşımalı. Anki export deterministik bir dosya/JSON olarak MVP’ye alınabilir; AnkiConnect sonraya bırakılmalı. “Listeye ekleme” ile “bağlamda tekrar” ayrı event olarak ölçülmeli.
