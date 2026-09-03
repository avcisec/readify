# Feature Inventory

**İnceleme tarihi:** 26 Ağustos 2026

| Alan | Özellik | Kullanıcı amacı | Giriş noktası | Nasıl çalışıyor | Oluşturduğu/değiştirdiği durum | Paywall | Güçlü yön | Sorun | Kanıt | Bizim kararımız |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Reading | Page View | Metni sürekli okumak | Lesson card | Token renkleri ve panel | Read words | Free | Hızlı akış | Read metriği şişebilir | LQ-READ-001 | Adopt |
| Reading | Sentence View | Cümle/token odaklanmak | Reader footer | 1/11…11/11 gezinme | Review context | Kısmen | Aktif recall köprüsü | Çeviri paywall'ı | LQ-SENT-001 | Adapt |
| Reading | Word lookup | Bilinmeyeni anlamak | Token click | Dictionary/meaning/status paneli | Vocabulary status | Free limit 20 | Bağlam içinde | Popular meanings gürültülü | LQ-READ-001 | Adopt |
| Reading | Phrase capture | Kalıp ifadeyi saklamak | Related Phrases | Phrase seçip status ver | Phrase item | Free limite dahil | Doğal birim | Seçim keşfi gizli | LQ-VOC-001 | Adopt |
| Reading | Inline lesson translation | Satır çevirisi görmek | More > Show Translation | Kaynak çeviriyi açar | Görsel state | Reader'da gözlenen free | Anında destek | Sentence Translation ile isim çakışıyor | LQ-READ-001 | Adapt |
| Reading | Lesson info | Zorluk/metadata görmek | More | Modalda word/read/listen/course | Sayaç görünümü | Free | Seçimi destekler | Read count güvenilmez | LQ-READ-002 | Adopt |
| Listening | Mini player | Ders sesini kontrol etmek | Reader footer | Play, seek, speed, repeat | Listening time | Free gözlendi | Çekirdek döngüde | Icon-only | LQ-LISTEN-001 | Adopt |
| Listening | Sync transcript | Sesi metinle izlemek | Player sync | Aktif cümleyi ortalar | Playback position | Premium+ olarak sunuluyor | Sentence context | Word highlight yok | LQ-LISTEN-001 | Adapt |
| Vocabulary | Status 1–4/Known | Öğrenme durumunu işaretlemek | Panel/list row | Düğmelerle doğrudan günceller | Known/Learned counters | 20 item free | Kolay ilerleme | Öz-bildirim | LQ-VOC-001 | Adapt |
| Vocabulary | SRS tab | Due kelimeleri bulmak | Vocabulary | `Due for Review (SRS)` | Review queue | Review gating belirsiz | Hatırlatma yüzeyi | Scheduler açıklamasız | LQ-VOC-002 | Adopt |
| Vocabulary | Review cards | Aktif hatırlama | Review CTA | Meaning choice + card flow | Review events | Matrix Premium | Doğal input'u tamamlar | Mod ayrımı belirsiz | LQ-VOC-002 | Adapt |
| Vocabulary | CSV import | Dış sözlüğü taşımak | Import Terms | Şema + Browse/Submit | Vocabulary records | Free limit | Taşınabilirlik | Hata/preview görülmedi | LQ-VOC-002 | Experiment |
| Library | Level filters | Uygun zorluk seçmek | Library | Beginner1/2…Advanced2 | Discovery state | Free | Basit sinyal | Kişisel uygunluk açıklaması yok | LQ-AUTH-001 | Adopt |
| Library | Mini Stories | Tekrarlı graded input | Library section | Kısa seri, course count | Read/listen state | Free gözlendi | Başlangıç için net | İçerik seçimi çok geniş | LQ-AUTH-001 | Adopt |
| Library | External source tiles | Sevilen medyayı bulmak | Library | Netflix/YouTube/TED vb. | Discovery | Bazı import premium | Ekosistem | Telif/sync riski | LQ-AUTH-001 | Later |
| Create | Type or Paste | Kendi text'ini ders yapmak | Create > editor | Lexical textarea | Taslak/import job | Import limit | Düşük bariyer | Sonuç görülmedi | LQ-IMP-001 | Adopt |
| Create | Audio transcription | Sesli içeriği yazıya çevirmek | Editor source | Ayrı source kartı | Import/transcript | Kota/Premium | Geniş input | Cost/sync belirsiz | LQ-IMP-001 | Later |
| Progress | Profile metrics | Aktiviteyi ölçmek | User menu | Known/read/listen/coins | Learning stats | Stats Premium matriste | Çok görünür | Manipüle edilebilir | LQ-PROG-002 | Adapt |
| Progress | Streak/goal/coins | Alışkanlık kurmak | Profile/header | Completion ve etkinlikle artar | Streak/coins | Challenge gating | Hızlı geri bildirim | Completion dark risk | LQ-COMP-001 | Adapt |
| Social | Community forum | Yardım/paylaşım | Sidebar | Threads, rankings, exchange | Posts (test edilmedi) | — | Sorun sinyali | Çekirdekten uzak | LQ-SOC-001 | Later |
| Social | Tutors | Konuşma/feedback almak | Sidebar | Filtered tutor cards + Book | Booking/points | Point purchase | Gerçek iletişim | Maliyet ve risk | LQ-SOC-002 | Later |
| Monetization | Premium plan | Limitleri kaldırmak | Sale/upgrade | Annual/monthly cards | Subscription | Paid | Kotalar anlaşılır | Erken paywall | LQ-PRICE-001 | Adapt |
| Monetization | Premium Plus AI | Gelişmiş AI/ses | Subscription | 6x transcription, AI voices | Plan state | Paid | Paket ayrımı | Kota kapsamı belirsiz | LQ-PRICE-003 | Later |
| UX | Themes/fonts | Okuma konforu | Reader Aa | Theme/font/size | Preference | Fontların bir kısmı premium | Kişiselleştirme | Seçenek yükü | LQ-READ-001 | Experiment |
| UX | Mobile responsive | Dar ekranda sürdürmek | Viewport | Collapsed nav, stacked cards | Layout state | — | Temel akış korunuyor | Erişilebilirlik açıkları | LQ-UX-001 | Adopt |
