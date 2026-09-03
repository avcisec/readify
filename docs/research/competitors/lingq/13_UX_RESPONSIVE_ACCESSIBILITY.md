# UX, Responsive Tasarım ve Gözlemsel Accessibility

**İnceleme tarihi:** 26 Ağustos 2026  
**Kapsam:** Desktop 1440×900, iPad Air tablet 820×1180 ve mobil 717×968 temel ekranları; bu profesyonel WCAG denetimi değildir.

## Responsive gözlemler

717×968 görünümünde sidebar ikonlaşarak daralıyor; Library kartları ve tutor kartları dikey istifleniyor; Vocabulary tablosunda `SOURCE TEXT` başlığı gizleniyor ancak satır snippet'leri kalıyor. Reader metni okunabilir, Sentence View ve footer player erişilebilir; sağ vocabulary paneli daha kompakt. Pricing yıllık plan kartlarını dikey düzene taşıyor. [LQ-UX-001]

820×1180 iPad Air görünümünde review kartı, üst sayaçlar ve daraltılmış sidebar aynı temel yapıyı korudu; genişlik, mobildeki dikey istiflenme ile desktop arasında orta bir düzen sağladı. Uzun metin performansı ve mobil arka plan audio'su test edilmedi.

## Kullanılabilirlik

- **Güçlü:** Renkli vocabulary statüleri hızlı tarama; tooltip'ler bilinmeyen ikonları açıklıyor; Reader/Listen geçişi kısa.
- **Sürtünme:** Üstteki sale/upgrade banner öğrenme alanında kalıcı dikkat çekiyor; Activities ile Progress ayrımı belirsiz; Sentence Translation ve ders çevirisi aynı adla sunuluyor.
- **Yoğunluk:** Reader More, Aa ve vocabulary paneli güçlü ama ilk kullanımda çok sayıda seçenek açıyor.

## Gözlemsel accessibility riskleri

Icon-only play/pause, skip, repeat ve synchronized-text kontrollerinde görünür metin yok; tooltip'e bağımlılık var. Review'daki kırmızı X/yeşil check seçenekleri semantik label olmadan renk ve şekle dayanıyor. Vocabulary status renkleri metin/ikonla desteklenmezse renk körlüğü riski taşır. Focus sırası, screen reader announcement, kontrast oranı ve klavye ile reader token seçimi tam denetlenmedi.

## Bizim ürünümüz için sonuç

Mobilde tablo yerine kart/accordion; player kontrollerinde görünür label ve aria-label; status'ta renk+numara+metin; review feedback'inde yalnız renge bağlı olmayan açıklama kullanılmalı. İlk oturumda tek ana CTA, ikincil ayarları progressive disclosure ile göstermeli.

**Kanıt:** [LQ-UX-001], [LQ-LISTEN-001], [LQ-VOC-002].
