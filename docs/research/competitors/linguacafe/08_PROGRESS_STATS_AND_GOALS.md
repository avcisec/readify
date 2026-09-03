# İlerleme, istatistik ve hedefler

**İnceleme:** 31 Ağustos 2026 · **Kanıt:** LC-E002, LC-E012

| Metrik | Nasıl artıyor | Veri kaynağı | Öğrenmeyle ilişkisi | Risk | Karar |
| --- | --- | --- | --- | --- | --- |
| Days of activity | günlük event | DailyAchievement | alışkanlık | tek tıklamayla gün | Adapt |
| Read words | reader finish ve review example sentence | Chapter/read + goals | input hacmi | review cümlesi şişirir | Adapt |
| Known words | stage=0 | EncounteredWord | kaba mastery proxy | lemma/bağlam yok | Adapt |
| Words currently studied | stage<0 | Vocabulary | SRS yükü | phrase/word ayrımı | Adopt |
| Known lemmas | base-word eşleşmesi | StatisticsService | çekim normalize etme | eksik base_word | Experiment |
| Review goal | normal review answer | GoalAchievement | recall çabası | route-state karışabilir | Adopt |
| New words goal | stage 2→negative | GoalAchievement | keşif/öğrenme | auto-highlight etkisi | Adapt |
| Chapter read count | Finish reading | Chapter | tamamlanan input | erken tıklama | Adopt |

Baseline Home: activity 2, read 382, known 0, studied 5. Deney sonrası: activity 2, read 617, known 1, studied 7, review 4/2, new words 4/10. `Known lemmas=0`, çünkü Known kelime için base_word boş kaldı. Bu metrik çelişkisi kullanıcı güvenini zedeleyebilir.

## Bizim ürünümüz için sonuç

İlerlemeyi “okuma/dinleme maruziyeti”, “kelime karşılaşması”, “aktif hatırlama” ve “mastery kanıtı” olarak ayrı panellerde göster; streak’i öğrenmenin yerine koyma.
