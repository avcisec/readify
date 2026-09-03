# Açık sorular ve takipler

- YouTube sağlayıcısında 500 parse hatası hangi sürüm/API değişimiyle çözülür; manual/generated caption ayrımı nasıl alınır?
- WhisperX GPU başına saniye ve Qwen3-TTS paragraf başına maliyet nedir?
- OCR için hangi dil modelleri ve confidence eşiği seçilecek?
- Dependency/POS modelinin Fransızca elision ve multiword expression başarısı nedir?
- Word timing forced alignment kalite metriği ve kullanıcı düzeltme UX’i nasıl olacak?
- Audio cache kullanıcılar arası hangi privacy/telif kurallarıyla paylaşılabilir?
- Anki export formatı ve silme/geri alma politikası nedir?
- Progress mastery’yi exposure’dan nasıl ayırıp manipülasyonu azaltırız?
- Mobil cihazda offline audio ve background playback MVP’ye gerçekten gerekli mi?
- LingQ, Readlang, Lute ve Language Reactor üzerinde aynı sentetik task ile benchmark yapılmalı.

## Sonraki testler

1. Telifsiz kısa ses + insan transcript’iyle end-to-end alignment.
2. OCR’li tek sayfa ve native PDF karşılaştırması.
3. A2/B1 Fransızca kullanıcılarla 5-session vocabulary retention testi.
4. Üç farklı caption kalite sınıfında ASR/align fallback maliyet ölçümü.

## Bizim ürünümüz için sonuç

Bu sorular cevaplanmadan WhisperX/Qwen3-TTS varsayılanını açmak maliyet ve kalite riski yaratır; önce küçük, telifsiz benchmark setiyle eşikler ölçülmelidir.
