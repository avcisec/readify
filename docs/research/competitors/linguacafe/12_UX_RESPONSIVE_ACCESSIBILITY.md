# UX, responsive ve gözlemsel erişilebilirlik

**İnceleme:** 31 Ağustos 2026; profesyonel WCAG denetimi değildir. Desktop 1280×900, iPad Air portrait 820×1180 ve iPhone 12 Pro portrait viewport’ları kontrol edildi.

Desktop’ta Library tablo yoğun ama okunabilir. Tablet düzeni korunur. Telefonda üst CTA’lar sadeleşir; Layout düğmesi “Library” görünümüne döner, kapak/title/length/actions dikey kartlara ayrılır. Alt nav More/Home/Library/Vocabulary görünür. Reader metni telefon genişliğinde uzun scroll ister; renk anlamı renk körlüğü için ikon/metinle desteklenmelidir.

Focus, dialog ve klavye hotkeys gözlendi; aria isimleri birçok ikon düğmede boş. Loading/error/empty durumları var ancak YouTube 500 ile caption yok ayrımı yok. Plain text mode apostrof boşluklarını bozuyor.

## Bizim ürünümüz için sonuç

Mobilde import/reader/review tek elle kullanılmalı; her stage renk+etiket, ikon düğmeler anlamlı aria-label, hata kodları açıklanabilir olmalı. Metin layout regression testleri Fransızca elision içermeli.
