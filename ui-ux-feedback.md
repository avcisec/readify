Bu dosyada ui ux wireframe ilk versiyonunun kullanim sonrasi feedbackleri vardir.


Şu anda doğru çalışması gerekenler:

- Yerel passwordless giriş bağlantısı 
Test sonucu: Paswordless giriş bağlantısı çalışıyor. (çok bir olayı yok zaten.)

- Fransızca seviye onboarding’i

Test sonucu: Seçimi yaptıktan sonra /library arayüzü açılıyor normal akışta olduğu gibi. Ancak seviye seçiminin uygulanıp uygulanmadığı konusunu profil sayfası olmadığı için ve anasayfada herhangi bir yerde yer almadığı için doğrulayamadım.

- 50.000 karaktere kadar metin yapıştırma
Test sonucu: 50.000 karakter sınırı çalışıyor. 

- Fransızca olmayan metin için uyarı/onay
Test sonucu: Fransızca olmayan metin için uyarı veriyor. Ancak bu metni fransızca dil öğrenim sayfasındayken ekleyebilmek çok doğru gelmedi. Fransızca olmayan metni ekleyemeyelim bence. Ya da bu konuda görüşünü bekliyorum. Benim kaçırdığım bir UX standardı olarak fransızca olmasa bile eklenmesi gerekiyor mu? 
Değerlendirelim.


- Arka planda metin işleme ve Library durumları

Metin işleme doğru çalışıyor. Ancak ui olarak çok iyi değil. Mesela metin ekle butonu var tıklayınca text inputa götürüyor ama kullanıcı butona basmak yerine direkt olarak inputa da yapıştırabilir. Zaten oralar çok değişecek. 


- Library’den metni açma ve devam etme

Test sonucu: library'den metni açıp devam edebiliyorum. Çalışıyor. Ancak şöyle bir şey keşfettim. Mesela ekranı küçültüp telefon ekranı ölçüsüne getirdiğimde en üstteki metin başlığı backgrounduyla birlikte sola kayıyor. [`feedback-sc/1.png`](feedback-sc/1.png) ekran görüntüsünde görebilirsin.


- Reader’da kelimelere tıklama

Test sonucu: Readerdaki kelimelere tıkladığımda panel açılıyor. Ancak buradaki paneli biraz geliştirmemiz gerekiyor. Kelime durumu için sadece öğreniyorum biliyorum ve yoksay state yetersiz bence. 1'den 4'e kadar yapalım. Bunun için örnek olarak LingQ'dan aldığım [`feedback-sc/2.png`](feedback-sc/2.png) ekran görüntüsüne bakabilirsin. Kelime panelini o şekilde yapalım. Design olarak bizimki gibi olsun ama. Hepsinden önce, kelimenin üzerine geldiğimde arkaplanla aynı olan sana daha önce verdiğim renkte bir background oluyor ancak text rengi siyah olduğundan okunması zorlaşıyor. Sanırım bunun için bir brand guide göndereceğim sana. Çünkü platformun dark ve light renk paletini ayırmamız lazım. Beyaz arkaplan gözü çok yoruyor. Şimdilik kelimenin üzerine gelince font color beyaz yap.

- Sınırlı test sözlüğünden Fransızca–Türkçe anlam gösterme
Test sonucu: Metindeki biçim
toujours
→
Lemma
toujours (lemma) şeklinde görebiliyorum kelimeye tıkladığımda. Sözlük olarak göremedim galiba henüz çalışmıyor. Galiba bu aşamada bu aşamada sözlük olayı çalışmıyor değil mi? 

- Kelimeyi `Öğreniyorum`, `Biliyorum` veya `Yoksay` olarak işaretleme

Test sonucu:  Kelimenin state'i işaretleniyor ve vocabulary sayfasında o şekilde görebiliyorum. 
- Son değişikliği geri alma
Bunu nasıl test edeceğim anlamadım. 
- Vocabulary ekranında kayıtlı kelimeleri görme
Test sonucu: Evet kayıtlı kelimeleri görebiliyorum. 
- Kelimenin metindeki yerine dönme
Test sonucu: kelimenin metindeki yerini görebiliyorum. 
- Semantik okuma konumunu kaydetme ve devam etme
Test sonucu: bir kelimeye tıklayıp o kelimeyle ilgili state'i güncellediğimde çıkıp tekrar girince o kelimenin olduğu yere geliyorum. Peki ya hiç kelimeye tıklamazsak? Bu durumda en son bulunduğumuz yeri de açmak lazım. Zaten chapterlara bölüp her chapter'ı ayrı açmamız daha mantıklı. Linguacafe'de olduğu gibi. 

- Bölümü tamamlandı olarak işaretleme
Çalışıyor.
- Progress ekranında temel yapısal sayıları görme
Evet bu bölüm de çalışıyor.
- Masaüstü, tablet ve mobil yerleşimler
Tablet yerleşiminde sidebar bayağı küçülüyor. Masaüstü state'den tablete doğru birazcık küçülttüğümüzde mobilde olduğu gibi sidebar aşağı mobil uyumlu olan haline geçiş yapsa daha iyi olur.

- Klavye navigasyonu ve mobil kelime bottom sheet’i
buraya bakacağım tekrar.

Şunların henüz çalışmasını beklememelisin:

- Gerçek e-posta gönderimi
- Kapsamlı gerçek Fransızca–Türkçe sözlük
- AI çeviri veya bağlamsal açıklamalar
- EPUB/PDF/audio import
- TTS, oynatıcı ve metin–ses senkronizasyonu
- Review/SRS
- Gerçek öğrenme puanı, CEFR tahmini veya ayrıntılı istatistik
- Arama, silme ve gelişmiş Library yönetimi
- Production deployment ve gerçek kullanıcı trafiği

## Sonraki aşama

Önce mevcut dilim için kısa bir ürün kabul turu yapmanı öneriyorum:

1. Library ve Reader tasarımını tarayıcıda dene.
2. Birkaç farklı uzunlukta Fransızca metin ekle.
3. Masaüstü ve telefonda kelime etkileşimini kontrol et.
4. Tasarım yönü, yoğunluk ve Reader deneyimi için geri bildirim ver.
5. Bu temel kabul edilirse yeni özellik eklemeye geçelim.

Bundan sonraki teknik faz için önerim: **production-capable text learning loop**.

Bu fazda:

- Gerçek passwordless e-posta/identity sağlayıcısı
- Lisanslı gerçek Fransızca–Türkçe anlam kaynağı
- Library arama/silme ve daha iyi işlem durumları
- Preview/staging deployment
- Production yapılandırması ve operasyonel doğrulama
