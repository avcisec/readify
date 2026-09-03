# LinguaCafe Araştırması — Hesap Değişiklikleri

**İnceleme tarihi:** 31 Ağustos 2026

Bu dosya yalnız araştırma sırasında bilinçli olarak oluşturulan veya değiştirilen hesap durumlarını tutar. Kimlik bilgileri ve kişisel alanlar kaydedilmez.

| Zaman | Alan | Önceki durum | Eylem | Son durum | Geri yükleme |
| --- | --- | --- | --- | --- | --- |
| Başlangıç | Auth session | Login ekranı | Kullanıcı bilgileri kendisi girerek oturum açtı | Authenticated session | Araştırma için açık bırakıldı |
| 12:3x CEST | Library | Araştırma kitabı yoktu | Özgün Fransızca metin, Plain text import ile yeni ve izole bir kitaba aktarıldı | `[Araştırma] Une matinée au parc – 2026-08-31`; bölüm tabanı `Chapitre de test`; 3000 karakter/bölüm | Plan gereği silinmeyecek; açık araştırma verisi olarak bırakıldı |
| 12:33–12:40 CEST | Fransızca vocabulary | Yeni kelime | `jardinier` seçildi, çevirisi eklendi ve 7. öğrenme seviyesine alındı | Stage `-7`, çeviri `bahçıvan` | Araştırma verisi olarak bırakıldı |
| 12:34–12:40 CEST | Fransızca vocabulary | Yeni kelime | `écureuil` seçildi, çevirisi eklendi ve 4. öğrenme seviyesine alındı | Stage `-4`, çeviri `sincap` | Araştırma verisi olarak bırakıldı |
| 12:36–12:40 CEST | Fransızca phrase | Kayıt yoktu | `petit carnet` sürüklenerek seçildi, phrase kaydedildi ve 7. öğrenme seviyesine alındı | Stage `-7`, çeviri `küçük defter` | Araştırma verisi olarak bırakıldı |
| 12:39 CEST | Fransızca vocabulary | Yeni kelime | `lointaine` doğrudan Known yapıldı | Stage `0` | Araştırma verisi olarak bırakıldı |
| 12:40 CEST | Fransızca vocabulary | New | `reviendrai` Ignored yapıldı; arayüz lemma olarak `revenir` gösterdi | Stage `1`, base word `revenir` | Araştırma verisi olarak bırakıldı |
| 12:44 CEST | Reader local settings | `plain-text-mode=false` | Plain-text mode açılarak okuma davranışı gözlendi | Geçici olarak `true` | Aynı oturumda `false` değerine geri getirildi |
| 12:45–12:51 CEST | Review ve goal sayaçları | Reviews `2`, Reading `382`; test phrase stage `-7` | Bir practice yanıtı ve iki normal-kabul edilen doğru yanıt verildi; ilk route değişiminde Vue bileşeni eski practice destesini korudu | Reviews `4`, Reading `417`; phrase stage `-6` ve sonraki review `2026-09-01`; `écureuil` stage `-4` kaldı | Öğrenme deneyi sonucu olarak bırakıldı; route-reuse artefaktı raporda ayrıştırıldı |
| 12:51 CEST | Sentetik chapter | `read_count=0`; Reading `417`; auto-Known `false` | `Finish reading` çalıştırıldı | `read_count=1`; Reading `617`; Known `1` olarak kaldı | Plan gereği bırakıldı; local ayar başlangıç değeri `false` olarak korundu |

Not: `boulangerie` önceden Ignored durumundaydı ve araştırma varlıklarından sayılmadı; yalnız seçilmesi lookup sayacını artırmış olabilir. `vendeuse` üzerinde kalıcı stage değişikliği yapılmadı.

## Planlanan üst sınır

- Bir sentetik Fransızca araştırma kitabı ve bir chapter
- En fazla beş vocabulary varlığı
- Bir kısa practice review ve bir kısa normal review
- Sentetik chapter completion
- Geçici dil/reader ayarı değişikliklerinin sonunda geri yüklenmesi

Mevcut kullanıcı kitabı ve ona bağlı öğrenme durumu değiştirilmez.
