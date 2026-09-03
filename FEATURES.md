# Readify — Özellik Envanteri

**Durum:** Ideacraft / product discovery  
**Ürün özeti:** [idea.md](idea.md)

## Öncelik tanımları

- **Core:** İlk uçtan uca ürün döngüsünü kanıtlamak için gerekli.
- **Plus:** Core deneyimini iyileştirir fakat ilk doğrulamayı bloke etmez.
- **Later:** Ürün tezi doğrulandıktan sonra değerlendirilecek.

## Account ve öğrenme profili

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Hesap oluşturma ve giriş | Core | Import ve ilerlemeyi kalıcı tutar | E-posta ve temel session yönetimi |
| Öğrenilen dil profili | Core | İstatistik ve vocabulary'yi dile göre ayırır | İlk kalite garantisi Fransızca |
| Yaklaşık başlangıç seviyesi | Core | İlk içerik ve UX varsayımlarını ayarlar | Beginner/Intermediate yerine A1–C2 aralığı |
| Arayüz dili ayrımı | Plus | Öğrenilen dilden bağımsız UI | İlk aşamada Türkçe/İngilizce düşünülebilir |
| Çoklu öğrenilen dil | Later | Aynı hesapta farklı diller | Her dilin Library/vocabulary/progress'i ayrı |
| Veri export ve hesap silme | Plus | Veri taşınabilirliği ve güven | Original, derived ve user-state kapsamı açıklanır |

## Library ve discovery

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Kişisel Library | Core | Bütün importları tek yerde görür | Private-by-default |
| Processing durumu | Core | İşlemin hangi aşamada olduğunu anlar | Queued, extracting, OCR, ASR, TTS, aligning, ready, failed |
| Continue CTA | Core | Kaldığı yerden hızlı devam eder | Son paragraph/sentence ve playback konumu |
| Source type filtresi | Core | Video/kitap/metin/belge ayrımı | YouTube, EPUB, PDF, yapıştırılan metin, MD |
| Arama | Core | Uzun Library'de içeriği bulur | Başlık ve metadata |
| Duplicate source bildirimi | Core | Aynı içeriği yeniden işlemez | Mevcut artefakta bağlama veya mevcut lesson'a gitme |
| Chapter/section progress | Core | Uzun kaynakta konumunu görür | User-specific state |
| Favorites | Plus | Önemli içeriği ayırır | Library filtresi |
| Playlist | Plus | Dinleme sırası oluşturur | Hazır audio bölümleri |
| History | Plus | Önceki çalışmalarını bulur | Son açılma ve çalışma oturumu |
| Uygun sonraki input önerisi | Plus | Karar yükünü azaltır | Seviye, unknown oranı ve son etkinlik açıklanır |
| Public content library | Later | Hazır içerik keşfi | Lisans/moderasyon gerektirir |

## Import Wizard

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| YouTube URL import | Core | Videoyu lesson'a dönüştürür | Experimental connector ve feature flag |
| EPUB import | Core | Kitap chapter yapısını korur | Spine ve heading extraction |
| PDF import | Core | Dijital veya taranmış belgeyi işler | Native text-first, selective OCR |
| Düz metin yapıştırma | Core | Kopyalanmış metni dosyasız lesson yapar | Geniş textarea, karakter sınırı, paragraf koruma |
| Markdown import | Core | Yapısal not/belgeyi korur | Heading, liste, quote, paragraph |
| Drag-and-drop | Core | EPUB/PDF/Markdown dosyası eklemeyi hızlandırır | Yalnız dosya kaynaklarında format ve boyut doğrulaması |
| File picker | Core | EPUB/PDF/Markdown dosyası seçer | Yalnız dosya kaynaklarında aynı validation hattı |
| Dil tespiti | Core | Doğru parser/model seçimini sağlar | Kullanıcı sonucu onaylayabilir |
| Metadata çıkarma | Core | Library kartını doldurur | Başlık, yazar/channel, source type, cover/thumbnail; yapıştırılan metinde ilk satırdan güvenli başlık |
| Import progress | Core | Uzun işlemlerde belirsizliği azaltır | Aşama ve hata görünümü |
| Retry | Core | Geçici hatadan kurtarır | Idempotent job |
| Cancel | Plus | Boşa compute tüketimini durdurur | Bekleyen downstream job'lar iptal edilir |
| `.srt` / `.vtt` ekleme | Plus | YouTube caption fallback'i | Dil ve timestamp doğrulaması |
| Transcript yapıştırma | Plus | Caption erişimi olmayan videoyu destekler | Original audio yetkisi ayrıca kontrol edilir |
| Import önizleme | Plus | Yanlış dil/yapıyı erken fark eder | İlk section ve metadata |
| Seçili chapter import | Plus | Uzun kitabın yalnız gereken kısmını alır | Artefakt kimliği source + selection içerir |
| Metadata düzenleme | Plus | Hatalı başlık/kapak düzeltir | User-specific override |
| URL/article import | Later | Web makalesini dönüştürür | Readability/telif değerlendirmesi |
| Podcast/RSS | Later | Audio içerik serisini takip eder | Feed ve episode modeli |
| DOCX | Later | Ofis belgesi desteği | Ayrı parser |
| Bulk import | Later | Çoklu kaynak ekler | Quota ve queue yönetimi |

## Deduplication ve artifact cache

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Canonical YouTube ID | Core | Aynı videoyu tekrar işlemez | Video ID + dil + caption/version key |
| Private input hash | Core | Aynı dosya veya normalize edilmiş yapıştırılmış metni aynı hesapta tanır | Hash başka kullanıcının varlığını ifşa etmez |
| Hibrit dedup | Core | Maliyeti düşürür, privacy'yi korur | Public/lisanslı global; private hesap içi |
| Versioned artifact cache | Core | Model değişimini yönetir | Model/parser/config sürümü key'e dahil |
| Sentence NLP cache | Core | Aynı cümleyi tekrar parse etmez | Sentence hash + language + parser version |
| TTS cache | Core | Aynı sesi yeniden üretmez | Text hash + voice + model/config version |
| Negative cache | Plus | Sürekli aynı başarısız işi denemez | Süreli hata kaydı ve manuel retry |
| Cache invalidation aracı | Plus | Model yükseltmesini kontrollü yapar | Eski artefaktı koru veya regenerate |

## Text extraction, OCR ve normalization

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| EPUB spine/chapter koruma | Core | Kitap sırası bozulmaz | Chapter/section entity'leri |
| Markdown structure koruma | Core | Belge anlamlı bloklara ayrılır | Heading/list/quote/paragraph |
| PDF native extraction | Core | OCR maliyetini önler | Her sayfa için text-quality kontrolü |
| Scanned-page tespiti | Core | Yalnız gerektiğinde OCR | Text density/glyph/coverage sinyalleri |
| Selective OCR | Core | Taranmış sayfayı okunabilir yapar | Fransızca OCR modeli |
| Page anchor | Core | Kaynak sayfaya geri döner | PDF page number ve bounding reference |
| Paragraph segmentation | Core | Reader ve TTS blokları oluşur | Kaynak sınırları korunur |
| Sentence segmentation | Core | Sentence View ve alignment oluşur | Stable sentence ID |
| Header/footer temizleme | Core | Tekrarlı gürültüyü azaltır | Sayfalar arası tekrar analizi |
| Text quality score | Core | Fallback kararını açıklar | Extraction/OCR confidence |
| Hyphenation repair | Plus | Satır sonu bölünmüş kelimeleri düzeltir | Original text mapping korunur |
| Footnote ayrımı | Plus | Ana okumayı sadeleştirir | Açılır secondary block |
| Table ayrımı | Plus | Bozuk düz metni azaltır | Table block olarak saklar |
| OCR/transcript editor | Plus | Hatalı metni düzeltir | Yalnız değişen sentence yeniden işlenir |
| Gelişmiş layout reconstruction | Later | Karmaşık PDF düzenini korur | Çok sütun, tablo ve görsel ilişkisi |
| El yazısı OCR | Later | Not defteri/taranmış yazı | Ayrı kalite ve model ihtiyacı |

## YouTube, transcript ve ASR

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Creator/manual caption önceliği | Core | En kaliteli transcript'i seçer | Mevcutsa ilk kaynak |
| Automatic caption fallback | Core | Manual caption olmayan videoyu destekler | Dil doğrulaması yapılır |
| Caption language seçimi | Core | Doğru öğrenme dilini seçer | Kullanıcı override edebilir |
| Timestamp monotonicity testi | Core | Bozuk timeline'ı yakalar | Overlap, geriye gidiş ve taşma kontrolü |
| Caption coverage testi | Core | Uzun sessiz/eksik alanı yakalar | Audio duration ile karşılaştırılır |
| Transcript language testi | Core | Yanlış dilde ASR/parse önler | Fransızca-first |
| Align-only fallback | Core | Gereksiz ASR maliyetini önler | Metin iyi, timing kötü olduğunda |
| WhisperX fallback | Core | Caption olmayan/kötü videoyu işler | Yalnız metin kalite testi başarısızsa |
| Transcript ile seek | Core | Metinden videoya gider | Sentence timestamp |
| Kompakt playback yüzeyi | Core | Reader'da kontrolü korur | Politika incelemesi gerekli |
| Video simgesiyle embed | Core | Original videoyu açar | YouTube branding ve player kurallarına uyar |
| Güvenli embed + subtitle fallback | Core | Connector başarısızsa lesson'ı kurtarır | Kullanıcı `.srt/.vtt` sağlar |
| Experimental connector flag | Core | Politik riski yönetir | Ortama göre aç/kapat |
| Transcript confidence göstergesi | Plus | Kullanıcı kaliteyi anlar | Source ve fallback nedeni |
| Transcript editörü | Plus | ASR/caption hatasını düzeltir | Alignment ve NLP seçici yenilenir |
| Speaker diarization | Later | Çok konuşmacılı videoyu ayırır | Compute ve UX karmaşıklığı |
| Transcript translation | Later | Destek dilinde yardım | Source/AI translation ayrımı |

## Linguistic intelligence

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Surface tokenization | Core | Reader highlight'ı doğru olur | Character offset saklanır |
| Multi-word token expansion | Core | `du/des/au/aux` doğru analiz edilir | Surface ve syntactic word ayrılır |
| Lemmatization | Core | Çekimler aynı kökte birleşir | Fransızca Stanza provider |
| Universal POS | Core | Kelime kategorisini açıklar | UD v2 canonical değer |
| Fransızca POS etiketi | Core | Teknik etiketi anlaşılır yapar | Kullanıcı dostu mapping |
| Morphological features | Core | Çekimi açıklar | Gender, Number, Person, Tense, Mood vb. |
| Dependency parsing | Core | Cümlede kelime ilişkisini gösterir | Head + deprel |
| Sentence root | Core | Ana yüklemi belirler | Tek root validation |
| Parent/head kelime | Core | Kelimenin bağlı olduğu öğeyi gösterir | Kelime panelinde görünür |
| Child ilişkileri | Core | Alt bileşenleri gösterir | Tree görünümünde |
| Grammar-role mapping | Core | Özne/nesne/tümleç olarak öğrenir | UD → pedagojik Türkçe/French label |
| Noun phrase | Core | Parent grubunu gösterir | Dependency subtree/rule katmanı |
| Verb phrase | Core | Fiil grubunu gösterir | Head ve child span |
| Prepositional phrase | Core | Edatlı grubu gösterir | Parent group saklanır |
| Clause group | Core | Yan cümleyi ayırır | ccomp/xcomp/advcl/acl ilişkileri |
| Otomatik analiz etiketi | Core | Hatanın mümkün olduğunu bilir | Kesin insan anotasyonu iddiası yok |
| Gelişmiş dependency tree | Core | Cümle yapısını görselleştirir | Sentence View'dan açılır |
| Parser/model version | Core | Sonuçları yeniden üretilebilir yapar | Annotation metadata |
| Yanlış analiz bildirimi | Plus | Kalite sorununu raporlar | Kullanıcı düzeltmesi değil feedback |
| Grammar editor | Plus | Head/label/group düzeltir | Audit ve reprocessing |
| Named entity recognition | Plus | Özel isimleri ayırır | Ignore önerisi olabilir |
| Aynı grammar pattern arama | Plus | Yapıyı bağlamlar arasında tekrar eder | Dependency pattern index |
| Kişiselleştirilmiş grammar açıklaması | Later | Seviyeye uygun öğretim | AI + güvenlik/kalite katmanı |
| Semantic role labeling | Later | Agent/patient gibi anlam rollerini ekler | Dependency'den farklı katman |
| Coreference resolution | Later | Zamir referanslarını açıklar | Uzun bağlam modeli |

## Reader — ortak davranışlar

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Page/Sentence View seçici | Core | Okuma ve yoğun çalışmayı ayırır | Toolbar kontrolü |
| Lesson bazlı görünüm tercihi | Core | Geri dönüşte aynı deney | User preference |
| Görünüm değişiminde audio koruma | Core | Dinleme kesilmez | Aynı playback state |
| Görünüm değişiminde sentence koruma | Core | Bağlam kaybolmaz | Stable sentence ID |
| Token click | Core | Kelime panelini açar | Surface token → syntactic analysis |
| Phrase selection | Core | Kalıp ifadeyi kaydeder | Span ve source context |
| Inline translation | Core | Anlamayı destekler | Source ve AI translation ayrı etiketlenir |
| Audio-text sync | Core | Okurken dinlemeyi bağlar | Sentence/word timings |
| Renk + metin/ikon status | Core | Erişilebilir vocabulary durumu | Yalnız renge dayanmaz |
| Reading position persistence | Core | Kaldığı yerden devam | Paragraph/sentence anchor |
| Player hız kontrolü | Core | Zorluğa göre dinler | Belirlenmiş hız seçenekleri |
| ±5 saniye seek | Core | Kısa tekrar yapar | Player control |
| Continuous play | Plus | Uzun dinleme | Hazır paragraph/chapter queue |
| Font ve text size | Plus | Okuma konforu | Accessibility preference |
| Theme | Plus | Görsel konfor | High contrast dahil |
| Keyboard shortcuts | Plus | Güç kullanıcı hızını artırır | Reader ve vocabulary actions |
| Distraction-free mode | Plus | Dikkati metne verir | Nav/panel gizleme |

## Page View

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Continuous document view | Core | Uzun metni doğal okur | Chapter/paragraph akışı |
| PDF page anchors | Core | Kaynağa geri döner | Sayfa numarası |
| EPUB chapter headers | Core | Kitap yapısını korur | Heading hierarchy |
| Tıklanabilir bütün kelimeler | Core | Hızlı lookup/status | Token spans |
| Aktif sentence highlight | Core | Audio konumunu takip eder | Sentence timing |
| Word karaoke | Core | Kelimeyi sesle eşler | Alignment varsa |
| Scroll position save | Core | Kaldığı yeri bulur | Debounced persistence |
| Source page preview | Plus | PDF bağlamını görür | Original page image/text toggle |

## Sentence View

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Tek cümle focus | Core | Bilgi yoğunluğunu azaltır | Stable sentence ID |
| Önceki/sonraki cümle | Core | Kontrollü ilerler | Keyboard/swipe desteklenebilir |
| Sentence sıra göstergesi | Core | Lesson içindeki konumu görür | N / total |
| Sentence audio play | Core | Cümleyi ayrı dinler | Segment timestamp |
| Sentence loop | Core | Yoğun dinleme yapar | Açık loop state |
| Word karaoke | Core | Telaffuz-zaman ilişkisini görür | `audio.currentTime` |
| Token meaning | Core | Cümleyi çözümleyebilir | Aynı word panel |
| Grammar-role etiketleri | Core | Cümle öğelerini görür | User-friendly labels |
| Parent/head gösterimi | Core | Bağımlılığı anlar | Kelime paneli/tree |
| Phrase group vurgusu | Core | Kelime grubunu görür | Span highlight |
| Dependency tree | Core | Gelişmiş yapıyı inceler | İsteğe bağlı panel |
| Sentence translation | Core | Anlamayı doğrular | Kaynak/AI ayrımı |
| Review Sentence | Core | Pasif okumadan recall'a geçer | Cloze veya ordering |
| Auto-next | Plus | Akıcı sentence çalışması | Kullanıcı kontrolü |
| Speaking review | Later | Üretim pratiği | Mikrofon ve privacy gerektirir |

## Vocabulary ve Known modeli

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Bilinmeyen durumu | Core | Yeni öğeyi ayırt eder | Default reader state |
| Öğreniyorum durumu | Core | Çalışılacak kelimeyi ayırır | Vocabulary item oluşturur |
| Biliniyor durumu | Core | Bildiğini işaretler | Self-report, recall değildir |
| Görmezden gel | Core | Özel isim/gürültüyü çıkarır | Progress'ten ayrı tutulur |
| One-click Known | Core | Akışı bölmeden işaretler | Word panel eylemi |
| One-click undo | Core | Hatalı işlemi geri alır | Status event history |
| Lemma-wide Known | Core | Çekimleri birlikte yönetir | `user + language + lemma` |
| Tüm çekimlere propagation | Core | Aynı fiili tekrar tekrar işaretlemez | Bütün occurrence görünümü güncellenir |
| Page/Sentence senkronu | Core | İki görünüm tutarlı olur | Ortak state |
| Known coverage update | Core | İçerik uygunluğunu gösterir | Unique lemma bazlı |
| Self-known / Recall Confirmed ayrımı | Core | Dürüst öğrenme metriği | Ayrı statüler |
| Existing card pause | Core | Bilinen kelimenin review yükünü azaltır | Kart/geçmiş silinmez |
| Tekrar çalış | Core | Kelimeyi yeniden kuyruğa alır | Pause kaldırılır |
| Source occurrences | Core | Kelimeyi farklı bağlamlarda görür | VocabularyOccurrence |
| Phrase vocabulary | Core | Kalıp ifadeyi saklar | Word status'tan ayrı |
| Meaning/sense | Core | Polysemy bağlamını korur | Lemma altında sense |
| Tek surface-form override | Plus | Belirli çekimi ayrı yönetir | Lemma state üzerine override |
| Bulk status edit | Plus | Büyük listeyi yönetir | Preview + confirm + undo |
| CSV import/export | Plus | Vocabulary taşınabilirliği | Açık şema |

## Flashcards ve review

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Saved vocabulary'den kart | Core | İstenmeyen kart oluşmaz | Explicit user intent |
| Recognition card | Core | Kelimeyi anlamdan tanır | Term → meaning/context |
| Contextual cloze | Core | Çekimli biçimi bağlamda hatırlar | Exact occurrence offset |
| Audio card | Core | Listening recall çalışır | TTS veya izinli audio |
| Due queue | Core | Düzenli tekrar yapar | SRS uyumlu schedule |
| Tekrar/Zor/İyi/Kolay | Core | Recall kalitesini bildirir | Review event |
| Review history | Core | Geçmiş performansı görür | Kart silinmeden korunur |
| Source filtresi | Core | Belirli kitap/video kelimelerini çalışır | Library item filter |
| Word/phrase filtresi | Core | Kart türünü seçer | Vocabulary type |
| Recall Confirmed | Core | Kanıtlanmış öğrenmeyi ayırır | Farklı günlerde 2 başarılı delayed review |
| Lapse | Core | Unutulan kelimeyi geri alır | Review schedule güncellenir |
| Kart önizleme | Plus | Oluşacak kartı kontrol eder | Export/review öncesi |
| Kart alanlarını düzenleme | Plus | Hatalı meaning/context'i düzeltir | User override |
| Grammar-role kartları | Later | Yapıyı aktif hatırlar | Yeni template |
| Conjugation kartları | Later | Fiil çekimi çalışır | Morphology generator |
| Writing/production kartları | Later | Aktif üretim | Input değerlendirme gerekir |

## Anki export

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| `.apkg` deck export | Core | Anki'de doğrudan çalışır | Packaged deck |
| Media packaging | Core | Audio kartlar çalışır | Dosya referansları paketlenir |
| Readify note type | Core | Alanlar ve template korunur | Özel model |
| Stable GUID | Core | Re-import duplicate'ını azaltır | Vocabulary item/sense bazlı |
| Seçili kelime export | Core | İstenen kartları taşır | Selection |
| Lesson/source export | Core | Tek içerik deck'i oluşturur | `Readify::French::<Source>` |
| Scheduling'i dışlama | Core | Kullanıcının Anki geçmişine karışmaz | Clean deck |
| Source locator | Core | Orijinal bağlama döner | Page/chapter veya URL+timestamp |
| YouTube original audio dışlama | Core | Politika/telif riskini azaltır | TTS telaffuzu veya text-only |
| Export job status | Core | Uzun media paketini izler | Background job |
| Export geçmişi | Plus | Önceki paketi yeniden indirir | Version metadata |
| Alan seçimi | Plus | Deck'i sadeleştirir | Template seçenekleri |
| TSV fallback | Plus | Düzenlenebilir alternatif verir | UTF-8 + headers |
| AnkiConnect sync | Later | Dosyasız aktarım | Yerel Anki bağlantısı |
| İki yönlü sync | Later | Değişiklikleri eşler | Conflict ve privacy yükü |

## TTS, player ve karaoke

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Qwen3-TTS Fransızca | Core | Text-only içeriği dinler | Yerel GPU worker |
| 1 sabit Fransızca ses | Core | Tutarlı kalite ve cache | İkinci ses Plus olabilir |
| İlk bölüm üretimi | Core | Hızlı ilk playback | Import sonrası |
| İki paragraf prefetch | Core | Kesintisiz dinleme | Rolling high/medium priority |
| Kısa semantic chunk | Core | Hata ve cache'i sınırlar | Paragraf veya 1–3 cümle |
| Qwen3-ForcedAligner | Core | Word timing üretir | Audio + known text |
| Word timestamp | Core | Karaoke sağlar | Start/end |
| Sentence fallback | Core | Alignment hatasında player çalışır | Word highlight yok |
| Play/pause | Core | Temel dinleme | Actual playback metric |
| ±5 saniye | Core | Tekrar | Seek |
| Hız seçenekleri | Core | Anlamaya göre ayarlar | Playback rate |
| Sentence repeat | Core | Yoğun listening | Segment loop |
| Audio/text position sync | Core | İki modaliteyi bağlar | Shared timeline |
| İkinci sabit ses | Plus | Tercih sunar | Ayrı cache variant |
| Bölümü yeniden üret | Plus | Kalite sorununu düzeltir | Model/version aware |
| Audio kalite feedback | Plus | Hatalı TTS'i raporlar | Regenerate queue |
| Chapter download | Plus | Yetkili/TTS audio offline dinlenir | YouTube kapsam dışı |
| Voice cloning | Later | Kişisel ses | Consent ve abuse riski |
| Voice design | Later | Stil seçimi | Cache çeşitliliği ve maliyet |
| Çoklu dil TTS | Later | Dil kapsamını genişletir | Dil başına QA |

## Progress ve statistics

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Dil bazlı Profile/Stats | Core | Her dilde ayrı ilerleme | LanguageProgress |
| Daily Learning Score | Core | Günlük aktiviteyi özetler | Şeffaf versioned policy |
| Günlük hedef | Core | Alışkanlık kurar | Default 20; 10/20/30/45/60 |
| Streak | Core | Devamlılığı gösterir | Hedef tamamlanan gün |
| Activity heatmap | Core | Çalışma ritmini görür | Yerel takvim günü |
| Dönem filtreleri | Core | Kısa/uzun trendi görür | Today, 7d, 30d, month, 3m, 6m, all |
| Active study time | Core | Gerçek aktif süre | Idle-filtered |
| Active reading time | Core | Okuma çabasını görür | 60 sn idle cutoff |
| Words exposed | Core | Metin hacmini görür | Görünürlük eşiği, başarı değil |
| Unique lemmas exposed | Core | Vocabulary breadth | Tekrarlar ayrı |
| Listening time | Core | Gerçek playback süresi | Wall time |
| Audio coverage | Core | İçerikte ne kadar ilerlediğini görür | Media timeline duration |
| Sections completed | Core | Yapısal ilerleme | Açık completion, vocabulary etkisi yok |
| Saved vocabulary | Core | Çalışma kuyruğunu görür | Explicit save |
| Self-marked Known | Core | Kullanıcı beyanını görür | Lemma bazlı |
| Recall Confirmed | Core | Kanıtlanmış hatırlamayı görür | İki farklı gün delayed success |
| Review accuracy | Core | Recall kalitesini görür | Doğru / bütün cevaplar |
| Due cards | Core | Bugünkü işi görür | Scheduler |
| Assistance rate | Core | İçeriğin zorluğunu görür | Meaning/translation interaction oranı |
| Known coverage | Core | İçerik uygunluğunu görür | Self-known + recall-confirmed lemma |
| Detailed total + change | Core | Metrik artışını açıklar | Seçili dönem aggregate |
| Study session history | Core | Hangi kaynağa zaman verdiğini görür | Session summaries |
| Metric tooltips | Core | Sayacın nasıl arttığını anlar | Formula ve exclusions |
| Tahmini CEFR range | Core | Seviye yönünü görür | Resmî test değil |
| CEFR confidence | Core | Tahmin belirsizliğini anlar | Low/medium/high |
| Weekly report | Plus | Düzenli özet alır | In-app, e-posta opt-in |
| Monthly report | Plus | Uzun trendi görür | In-app |
| Manuel/offline activity | Plus | Dışarıdaki çalışmayı kaydeder | Manual etiketi, default score dışı |
| Grammar structure exposure | Plus | Hangi yapıları gördüğünü anlar | Mastery değildir |
| Retention graph | Plus | Vocabulary dayanıklılığını izler | Review events |
| Source difficulty trend | Plus | Input seçimini iyileştirir | Unknown/assistance/pace |
| Speaking/writing stats | Later | Üretim becerisini görür | İlgili özelliklerden sonra |
| Badge/challenge | Later | Ek motivasyon | Şeffaf kriter |
| Leaderboard | Later | Sosyal rekabet | Manipülasyon/privacy riski |

## Learning Score kuralları

| Aktivite | Score | Sınır/not |
| --- | ---: | --- |
| 1 aktif okuma dakikası | 1 | Audio çalarken ayrıca sayılmaz |
| 1 aktif dinleme dakikası | 1 | Gerçek playback wall time |
| Tamamlanan review | 0,25 | Günlük en fazla 5 puan |
| Başarılı delayed recall | +0,25 | Günlük en fazla 5 puan |
| Kelime kaydetmek | 0 | Niyet sinyali, öğrenme kanıtı değil |
| Known yapmak | 0 | Self-report |
| Lesson açmak/tamamlamak | 0 | Hacim metriği ayrı |
| Import yapmak | 0 | Teknik işlem |

## CEFR tahmini

| Bileşen | Ağırlık |
| --- | ---: |
| Recall-confirmed lexical mastery | %40 |
| Delayed review performansı | %25 |
| Known coverage + assistance rate | %20 |
| Reading/listening çeşitliliği | %15 |

İlk tahmin için en az 3 çalışma günü, 3 tamamlanmış section ve 50 review event gerekir. Sonuç haftalık hesaplanır; aralık ve confidence ile gösterilir, resmî test olarak sunulmaz.

## Platform ve operasyon

| Özellik | Öncelik | Kullanıcı değeri | Sistem davranışı / not |
| --- | --- | --- | --- |
| Application API | Core | Bütün client işlemlerini birleştirir | Auth + domain services |
| Metadata DB | Core | Kaynak, içerik ve kullanıcı state'i | Shared asset/user state ayrımı |
| Object storage | Core | Original ve derived artefakt | Retention ve delete policy |
| Job queue | Core | Uzun işleri async yürütür | Priority ve idempotency |
| Yerel GPU worker | Core | İlk geliştirme maliyetini düşürür | Mevcut PC/GPU |
| Ortak worker interface | Core | Cloud'a taşımayı kolaylaştırır | Provider adapters |
| Retry/idempotency | Core | Duplicate maliyeti ve state bozulmasını önler | Job key |
| Artefakt versioning | Core | Model değişimini yönetir | Reprocess seçeneği |
| Cost telemetry | Core | OCR/ASR/TTS maliyetini görür | GPU sec, page, minute, char |
| Quality telemetry | Core | Hatalı pipeline'ı bulur | Extraction/alignment/parser status |
| Import silme | Core | Kullanıcı kontrolü | User data ve ref-count temizliği |
| Private-by-default | Core | Privacy/telif riskini azaltır | Public yayın yok |
| Docker Compose model stack | Plus | Kurulumu tekrarlanabilir yapar | GPU passthrough |
| GPU health dashboard | Plus | Worker sorununu görür | Queue/VRAM/latency |
| Soft quota/cost estimate | Plus | Uzun işlem sürprizini azaltır | Hard pricing daha sonra |
| Admin reprocess | Plus | Model upgrade/hata düzeltir | Scope seçimi |
| On-demand GPU worker | Later | Trafiğe göre ölçekler | Aynı worker contract |
| Autoscaling | Later | Yüksek trafik | Queue depth + warm pool |
| Monetization/paywall | Later | Compute maliyetini finanse eder | Telemetri sonrası limit |

## Kavramsal varlıklar

- `User`, `LearningLanguage`, `SourceAsset`, `LibraryItem`
- `ImportJob`, `ProcessingJob`, `Artifact`, `AudioVariant`
- `Document`, `Chapter`, `Section`, `Paragraph`, `Sentence`
- `SurfaceToken`, `SyntacticWord`, `Lemma`, `Morphology`
- `DependencyEdge`, `PhraseGroup`, `TranscriptSegment`, `WordTiming`
- `LexemeStatus`, `TokenFormOverride`, `VocabularyItem`, `VocabularySense`, `VocabularyOccurrence`
- `FlashcardNote`, `CardTemplate`, `ReviewEvent`, `AnkiExportJob`
- `ReaderSession`, `ReaderViewPreference`, `ReadingPosition`, `PlaybackState`
- `LearningEvent`, `StudySession`, `UserDailyStats`, `LanguageProgress`
- `GoalDefinition`, `StreakState`, `LearningScorePolicy`, `LevelEstimate`

## Provider sınırları

- `Importer`
- `TextExtractor`
- `OCRProvider`
- `CaptionProvider`
- `ASRProvider`
- `LinguisticAnnotationProvider`
- `TTSProvider`
- `ForcedAligner`
- `FlashcardGenerator`
- `DeckExporter`
- `ArtifactStore`
- `LearningEventRecorder`
- `StatsAggregator`
- `LearningScoreCalculator`
- `LevelEstimator`

## Temel kabul senaryoları

1. Aynı kaynak tekrar import edildiğinde pahalı pipeline yeniden çalışmamalı.
2. Dijital PDF sayfasında OCR çalışmamalı; taranmış sayfada çalışmalı.
3. Transcript metni doğru, timestamp bozuksa WhisperX yerine align-only çalışmalı.
4. TTS bütün kitabı değil ilk bölüm + iki paragraf penceresini hazırlamalı.
5. Alignment başarısızsa sentence-level player çalışmaya devam etmeli.
6. Her sentence tek root içermeli; dependency graph döngüsüz olmalı.
7. `du/des/au/aux` surface token ve syntactic word ilişkisi korunmalı.
8. Page View'da Known yapılan lemma Sentence View'da anında Known görünmeli.
9. `mange` Known yapılınca `manger` lemma'sının diğer çekimleri de Known olmalı.
10. Known undo bütün inherited occurrence'ları geri almalı.
11. Known yapmak Recall Confirmed veya Learning Score üretmemeli.
12. Lesson completion hiçbir kelimeyi otomatik Known yapmamalı.
13. Görünüm değişimi audio ve sentence konumunu korumalı.
14. Aynı lemma tekrar kaydedildiğinde duplicate kart yerine occurrence eklenmeli.
15. Cloze doğru çekimli surface form'u gizlemeli.
16. `.apkg` Anki'de açılmalı; media referansları kırık olmamalı.
17. Aynı `.apkg` yeniden import edildiğinde stable GUID duplicate'ı önlemeli.
18. Reader açılıp kapatılınca words exposed artmamalı.
19. 60 saniye idle sonrası reading time durmalı.
20. 2x playback listening time ve audio coverage'ı ayrı hesaplamalı.
21. Yetersiz veride CEFR yerine `Veri toplanıyor` görünmeli.
22. Bütün progress değerleri öğrenilen dile özel olmalı.
