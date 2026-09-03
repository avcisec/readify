# Runtime, dağıtım ve güvenlik

**İnceleme:** 31 Ağustos 2026 · **Kanıt:** LC-E005, LC-E006

## Doğrulanan durum

`webserver`, `mysql`, `redis` ve `python` sağlıklı durumdadır. Web uygulaması `localhost:9191`, Reverb websocket ise `127.0.0.1:6001` üzerinde dinler; internet erişimine açılmamıştır. Sürüm v0.14.1, upstream commit `c1ea298ce40c65b9dd33e9b26fd2e52fae66f2c8` olarak doğrulandı. Stack Laravel 11/PHP 8.2, Vue 2/Vuetify 2, MySQL 8, Redis/Horizon/Reverb ve ayrı Python tokenizer servisidir.

Araştırma öncesinde README’deki `app:create-backup` komutu çalıştırıldı; backup içeriği okunmadı. Secret, `.env`, cookie, token veya kişisel veri rapora alınmadı. Uygulama kodu/dependency/compose değişmedi.

## Riskler

- Vue 2 ve Vuetify 2 güncel olmayan bağımlılık riski taşır.
- YouTube istemcisi dış sağlayıcı davranışına hassastır; 500 hata UI’da “No subtitles found” olarak maskeleniyor.
- Self-hosting veri kontrolü ve maliyet avantajı sağlar; yedekleme, GPU ve güncelleme sorumluluğu işletmecidedir.

## Bizim ürünümüz için sonuç

İlk dağıtımda localhost/private-by-default, otomatik yedek ve iş kuyruğu görünürlüğü korunmalı. Hata sınıfları (caption yok, sağlayıcı reddi, parse hatası) kullanıcıya ayrı gösterilmeli.
