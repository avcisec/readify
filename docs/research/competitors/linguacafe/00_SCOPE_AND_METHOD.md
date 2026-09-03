# LinguaCafe Derinlemesine Ürün ve Teknik Keşfi — Kapsam ve Yöntem

**İnceleme tarihi:** 31 Ağustos 2026  
**Ürün:** LinguaCafe `v0.14.1`  
**Yerel adres:** `http://localhost:9191`  
**Araştırma dili:** Türkçe

## Amaç

Bu çalışma LinguaCafe'nin reading, vocabulary, review, import ve ilerleme mantığını gerçek kullanıcı akışı ve açık kaynak kod kanıtlarıyla anlamak; Readify için yeniden kullanılabilecek temelleri ve YouTube, ASR/alignment, Qwen3-TTS, PDF/OCR ile karaoke geliştirme boşluklarını belirlemek için yürütülür.

## Kanıt sınıfları

- **Doğrudan gözlemlendi:** T3 Browser'da görülen veya güvenli biçimde denenen davranış.
- **LinguaCafe manual tarafından belirtiliyor:** Uygulamanın kendi manual/README metnindeki beyan.
- **Kaynak kodda doğrulandı:** Sabit OCI imajındaki route, model, service, migration veya Vue/Python kodunda görülen davranış.
- **Çıkarım:** Gözlem ve koddan türetilen olası açıklama; güven seviyesi belirtilir.
- **Doğrulanamadı:** Erişim, çevre, test verisi veya güvenlik sınırı nedeniyle çalıştırılamayan davranış.

Kaynak kod kanıtı, çalışan imajın içindeki uygulamaya aittir; rapordaki kavramsal diyagram LinguaCafe'nin resmi ve eksiksiz backend şeması olarak sunulmaz.

## Test sınırları

- Mevcut kullanıcı kitabı açılmaz, değiştirilmez ve kanıtlara alınmaz.
- Hesap kimliği, e-posta, parola, token, cookie ve session içerikleri okunmaz veya kaydedilmez.
- Telifli metin ve YouTube transcript içeriği raporlara kopyalanmaz.
- `[Araştırma] Une matinée au parc – 2026-08-31` adlı sentetik Fransızca kitap kullanılır.
- Toplam en fazla beş vocabulary varlığı oluşturulur.
- YouTube testinde transcript listesi alınır ancak hesaba import edilmez.
- Chapter completion yalnız sentetik içerikte ve auto-Known kapalıyken denenir.
- Mevcut öğrenme dili ve geçici browser-local ayarlar deney sonunda geri yüklenir.
- Accessibility bölümü profesyonel WCAG denetimi değil, gözlemsel UX incelemesidir.

## Runtime bağlamı

- Upstream sürüm/commit: `v0.14.1` / `c1ea298ce40c65b9dd33e9b26fd2e52fae66f2c8`
- Web: Laravel 11, PHP 8.2, Vue 2, Vuetify 2
- Veri ve işler: MySQL 8, Redis, Horizon, Reverb
- Dil işleme: ayrı Python tokenizer servisi
- Yerel dağıtım: güvenlik yamalı ve digest-pinned OCI imajları
- HTTP ve websocket yalnız `127.0.0.1` üzerinde yayınlanır.

## Yedek

Araştırma öncesinde README'deki `php artisan app:create-backup` komutu çalıştırıldı. `linguacafe_2026_08_31_12_20_03.sql` adlı uygulama yedeği üretildi. Yedek içeriği araştırmada açılmadı.

## Raporlama standardı

Her önemli bulgu mümkün olduğunca ekran/route, eylem, sistem tepkisi, değişen durum, kullanıcı değeri, sürtünme, kanıt ID'si ve Readify kararıyla ilişkilendirilir. Ana bağlantı noktaları `EVIDENCE_INDEX.md`, `15_FEATURE_INVENTORY.md` ve `SUMMARY.md` olacaktır.

## Bizim ürünümüz için sonuç

LinguaCafe yalnız rakip değil, olası bir açık kaynak temelidir. Bu nedenle ürün UX'i ile kodun genişletilebilirliği ayrı ayrı değerlendirilmelidir; çalışan bir özelliğin veri modeli gelecekteki audio-sync veya AI pipeline'ını desteklemeyebilir.
