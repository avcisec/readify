# Çekirdek öğrenme döngüsü

**İnceleme:** 31 Ağustos 2026 · **Kanıt:** LC-E009–LC-E012

`Library → Plain text import → Book/Chapter → Processed reader → kelime seçimi → stage/çeviri → practice review → normal review → Finish reading → Home goals` akışı gerçek sentetik Fransızca metinle uygulandı.

200 kelimelik bölüm işlendi; 143 unique ve 141 new kelime gösterildi. `jardinier` stage -7 ve manuel çeviri, `écureuil` stage -4 ve çeviri, `petit carnet` phrase stage -7, `lointaine` Known stage 0, `reviendrai` Ignored stage 1 oldu. Completion read_count 0’dan 1’e ve Reading 417’den 617’ye çıktı; auto-Known false iken diğer yeni kelimeler Known’a taşınmadı.

Practice review’de “Again/I was correct” veri stage’ini değiştirmedi; normal review’de doğru cevap phrase’i -7’den -6’ya taşıdı ve next_review ertesi güne ayarlandı. Review örnek cümlesini readWords’a saydığından okuma metriği gerçek okuma ile karışabilir.

## Bizim ürünümüz için sonuç

İçerik seçimini seviyeye uygunluk ve bilinmeyen oranıyla açıklayan tek akış tasarla. Her event’in (lookup, save, review, completion) hangi metriği değiştirdiğini kullanıcıya ve analitik katmana açıkça ayır.
