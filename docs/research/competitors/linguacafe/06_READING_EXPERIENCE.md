# Reading deneyimi

**İnceleme:** 31 Ağustos 2026 · **Kanıt:** LC-E009, LC-E011

Reader metni kelime span’larına böler; New stage 2, learning -7…-1, Known 0, Ignored 1’dir. New kelimeler sarı/vurgulu; learning renkleri aşamaya göre değişir; Known/Ignored varsayılan olarak vurgulanmaz. Kelime tıklaması popup/side box açar: lemma/base word, translation, dictionary sonuçları, stage butonları ve Anki aksiyonu vardır. Sürükleyerek phrase seçilip “Save phrase” yapılır. `reviendrai` için base word `revenir` gözlendi; sentaks/POS veya cümle ögesi etiketi yoktur.

Reader toolbar Fullscreen, settings, chapters, glossary, font büyüt/küçült, plain-text mode ve hotkeys sunar. Plain-text mode kelime etkileşimini kapatıp boşluklu metin verir; Fransızca apostrof çevresinde `l' air`, `j' emporte` gibi yapay aralıklar gözlendi. Page View/Sentence View LingQ eşdeğeri doğrulanmadı; gerçek görünüm continuous text ve subtitle-block tabanlıdır.

## Bizim ürünümüz için sonuç

Renk yalnız sinyal değil, metin etiketi ve ikonla desteklenmeli. Fransızca elision, lemma ve POS/dependency katmanı import sırasında normalize edilmeli; kullanıcı isterse sentence/page görünümünü değiştirebilmeli.
