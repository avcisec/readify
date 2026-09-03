# LingQ Derinlemesine Ürün Keşfi — Kapsam ve Yöntem

**İnceleme tarihi:** 26 Ağustos 2026  
**Ürün:** LingQ web uygulaması (`https://www.lingq.com/`)  
**Araştırma dili:** Türkçe

## Amaç

Bu çalışma LingQ'yu kopyalamak için değil; reading, listening, vocabulary, içerik importu, audio–text ilişkisi, ilerleme ve kişiselleştirme mantığını gerçek kullanıcı yolculukları üzerinden anlamak için yürütülür. Sonuçlar, A2 sonu–B1 başlangıcı Fransızca öğrenen bir kullanıcının anlaşılabilir input odaklı yeni ürününün MVP kararlarına zemin oluşturacaktır.

## Araştırma sorusu

LingQ, “içerik seç → oku ve dinle → bilinmeyen kelimeyle etkileş → bağlam içinde öğren → ilerlemeyi gör → uygun yeni input'a devam et” döngüsünü ne kadar iyi destekliyor; nerelerde ürün, öğrenme veya UX fırsatı bırakıyor?

## Yöntem

1. Girişsiz public site, konumlandırma, CTA ve pricing erişim yolları incelenir.
2. Kullanıcı kimlik bilgilerini kendisi girer; araştırmacı bunları istemez, okumaz veya kaydetmez.
3. Authenticated information architecture ve ana route'lar haritalanır.
4. Kısa bir Fransızca dersle kontrollü öğrenme deneyi yürütülür.
5. Deney öncesi/sonrası metrikler karşılaştırılır.
6. Import, pricing/paywall, profil/ayarlar, sosyal/retention ve responsive ekranlar güvenlik sınırları içinde gözlenir.
7. Bulgular kanıt ID'leriyle raporlara bağlanır; doğrulanamayan konular açıkça işaretlenir.

## Kanıt ve kesinlik sınıfları

- **Doğrudan gözlemlendi:** T3 Browser'da gerçekten görülen veya denenen davranış.
- **LingQ tarafından belirtiliyor:** Ürün sayfası, yardım sayfası ya da uygulama metnindeki açık ürün beyanı.
- **Çıkarım:** Gözlenen arayüz davranışının olası açıklaması; her önemli çıkarıma yüksek/orta/düşük güven eklenir.
- **Doğrulanamadı:** Paywall, erişim, veri eksikliği ya da güvenlik sınırı nedeniyle test edilemeyen davranış.

Pazarlama metinleri ürün gerçeği değil ürün beyanı olarak ele alınır. Backend şeması, algoritma, alignment tekniği veya spaced-repetition yöntemi arayüz kanıtı olmadan kesinleştirilmez.

## Test bağlamı

- Birincil kullanım: Fransızca, tahmini A2 sonu–B1 başlangıcı.
- Birincil platform: Web, masaüstü; temel tablet ve telefon viewport kontrolleri ayrıca yapılır.
- Oturum tarihi ve saat dilimi: 26 Ağustos 2026, Europe/Paris.
- Fiyatlar görüldüğü para birimiyle ve bölge/hesap etkisi notuyla kaydedilir.
- Accessibility değerlendirmesi profesyonel WCAG denetimi değil, gözlemsel UX incelemesidir.

## Güvenlik ve etik sınırlar

- Kimlik bilgileri ve kişisel veriler rapora alınmaz.
- Hassas bilgi içeren ekran görüntüsü kaydedilmez; gerekiyorsa güvenli kırpma/maskeleme uygulanır.
- Ödeme, trial/abonelik, tutor booking, mesajlaşma veya public yayın yapılmaz.
- Kaynak kodu, özel API, güvenlik önlemi, token veya cookie incelenmez.
- Import gerekiyorsa yalnızca küçük, telifsiz ve private örnek kullanılır.
- Hesap durumundaki bütün kontrollü değişiklikler `ACCOUNT_CHANGES.md` içinde kaydedilir.

## Raporlama standardı

Her önemli bulgu mümkün olduğunca ekran/özellik, giriş yolu, route, eylem, sistem tepkisi, değişen durum, kullanıcı problemi/değeri, güçlü yön, sürtünme, paywall, kanıt ve ürün çıkarımı ile belgelenir. Dosyalar arası ana bağlantı noktaları `EVIDENCE_INDEX.md`, `15_FEATURE_INVENTORY.md` ve `SUMMARY.md` olacaktır.

## Bizim ürünümüz için sonuç

Araştırmanın başarı ölçütü özellik sayısı değil, çekirdek comprehensible-input döngüsünün hangi parçalarda öğrenme değeri ürettiğini ve hangi karmaşıklıkların MVP dışında bırakılabileceğini kanıta dayalı biçimde ayırmaktır.

