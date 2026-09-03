# MVP Önerisi

**İnceleme tarihi:** 26 Ağustos 2026

## MVP Core

| Özellik | Değer/öğrenme | Teknik ve veri yükü | Risk | Neden şimdi |
| --- | --- | --- | --- | --- |
| Fransızca text+audio lesson | Çekirdek anlaşılabilir input | Orta; lisanslı/kendi içerik | Telif ve içerik maliyeti | Değer hipotezinin temeli |
| Reader'da token/phrase seçimi | Bağlamdan kelime öğrenme | Orta; lemma/meaning | Yanlış anlam | LingQ'dan daha sade bağlam önerisi |
| Cümle segmentli player | Listening + transcript bağı | Orta-yüksek; timestamp | Sync hatası | En kritik teknik risk erken ölçülür |
| Status + source sentence | Vocabulary hafızası | Düşük-orta | Öz-bildirim | Öğrenme state'i gerekir |
| Kısa recall review | Aktif hatırlama | Orta | Fazla quizleşme | Pasif okumayı tamamlar |
| Progress exposure/known/recall ayrımı | Dürüst geri bildirim | Orta | Motivasyon düşüşü | LingQ'nun manipülasyon açığına yanıt |
| “Next suitable input” önerisi | Döngüyü sürdürme | Orta; basit kurallar | Yanlış seviye | A2/B1 deneyimi için gerekli |

## MVP Plus

| Özellik | Değer | Karmaşıklık/bağımlılık | Neden sonra ama yakın |
| --- | --- | --- | --- |
| Type/paste private import | Kişisel içerik | Orta; transcript yoksa kolay | İçerik havuzunu genişletir |
| Basit CSV vocabulary import/export | Taşınabilirlik | Düşük | Core veri modelinden sonra |
| TTS fallback | Sessiz text'i dinleme | Orta; sağlayıcı maliyeti | Gerçek audio öncelikli |
| Font/theme ve mobil polish | Konfor/erişilebilirlik | Düşük-orta | Çekirdek doğrulama sonrası |
| Review schedule açıklaması | Retention | Orta | İlk review davranışı görülünce |

## Post-MVP

Community, tutor marketplace, leaderboard/challenges, streaming/YouTube/EPUB/PDF importu, otomatik transcription/alignment, word-level karaoke, AI chat/grammar, offline uygulamalar, sosyal feed ve geniş font/voice paketleri.

### Karar ilkeleri

- **Kullanıcı değeri:** Bir oturumda “oku → dinle → kelimeyi bağlamda öğren → ilerlemeyi gör” tamamlanmadan yeni özellik eklenmez.
- **AI bağımlılığı:** AI anlam önerisi ve transcript için kaynak/üretim güveni gösterilmeli; deterministic status/metrics AI'a bırakılmamalı.
- **Telif/privacy:** Import varsayılan private; public paylaşım ve üçüncü taraf medya post-MVP.
- **Farklılaşma:** Progress dürüstlüğü, input uygunluğu ve sync kalitesi erken test edilir.

## Bizim ürünümüz için sonuç

LingQ'nun geniş feature setini MVP'ye taşımak yerine tek Fransızca öğrenme döngüsünde güvenilirlik kanıtlanmalı. Core yedi parçayı doğrulamadan tutor, community veya ileri AI'a yatırım yapılmamalı.
