# Kurulum, profil, dil ve admin

**İnceleme:** 31 Ağustos 2026

## Kullanıcı ayarları

User Settings içinde hesap, tema, öğrenme dili, UI dili ve veriyle ilgili bölümler bulunur. Seçili dil French olarak doğrulandı; kişisel hesap alanları raporlanmadı. Reader ayarları browser-local storage’da tutulur: vurgu, plain-text mode, font, satır aralığı, genişlik, auto-known, TTS hızı ve vocabulary panel davranışı.

## Admin

Güvenli biçimde Dashboard, Languages, Dictionaries, Fonts, API ve Reviews sekmeleri incelendi. Dictionaries’de French Wiktionary 79.067 kayıt, JMDict 0 kayıt görünüyordu. API paneli DeepL/LibreTranslate, cache, AnkiConnect ve Jellyfin gruplarını gösterir. Review ayarları 7’den 1’e Leitner seviyeleri ve alternatif gecikmeler alır. Kullanıcı/dil/dictionary silme veya kritik ayar değiştirme yapılmadı.

## Bizim ürünümüz için sonuç

Dil profili global hesap ayarı değil, her öğrenme dili için ayrı ilerleme ve sözlük konfigürasyonu taşımalı. Local ayarların export/import edilebilir olması, SSR ve çoklu cihazda tutarlılık sağlaması gerekir.
