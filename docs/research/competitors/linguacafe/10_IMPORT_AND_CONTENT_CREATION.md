# Import ve içerik oluşturma

**Doğrudan UI:** Plain text, Text file (`.txt`), E-book (`.epub`, DRM uyarısı), Subtitle (`.srt`, `.ass`), YouTube ve Website. PDF ve Markdown aktif seçenek değildir; source selection içinde yorum satırında kalan seçeneklerdir. Plain text sihirbazı Source → Book → Method → Finish adımlarında 300–15.000 karakter aralığı ve varsayılan 3000 sınırı verir; Fransızca detailed tokenizer seçimi source’ta `detailed` olarak varsayılan gelir.

**Kaynak doğrulaması:** `ImportService` text/e-book/subtitle’ı Python tokenizer’a gönderir, Book/Chapter oluşturur ve `ProcessChapter` kuyruğuna dispatch eder. EPUB spine sırası korunur; subtitle start/end timestamp’leri subtitle modelinde taşınır. YouTube Controller seçilen transcript’i `text` olarak map eder; timestamp/video metadata kaybolur. OCR, PDF extraction, Markdown normalization, dedup/fingerprint ve import edit history mevcut olarak doğrulanmadı.

| Tip | UI | Gerçek test | Structure | Timestamp | Failure |
| --- | --- | --- | --- | --- | --- |
| Plain text | Var | 200 kelime başarılı | Tek chapter/chunk | Yok | Processing state |
| TXT | Var | Dosya yüklenmedi | Metin | Yok | format validator |
| EPUB | Var | Dosya yüklenmedi | spine/chapter | Yok | DRM uyarısı |
| SRT/ASS | Var | Dosya yüklenmedi | subtitle blocks | Var | parser/queue |
| YouTube | Var | Listeleme başarısız | düz text | Yok | 500 “No subtitles” |
| PDF/MD | Yok | Test edilmedi | Yok | Yok | feature absent |

## Bizim ürünümüz için sonuç

İlk MVP’de native PDF text-first, seçici OCR; yapıştırılan düz metin ile EPUB/MD normalization; YouTube canonical fingerprint ve transcript segment modeli şart. TXT dosya importu güncel Readify ürün kararıyla kaldırılmıştır. Import job kullanıcıya aşama, maliyet ve yeniden kullanılmış cache durumunu göstermeli.
