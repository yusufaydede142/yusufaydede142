# Burç Uyumu

Doğum tarihine, saatine, yerine ve cinsiyetine göre sana en uygun burçları sıralar ve aranızdaki uyumu açıklar.

## Kullanım
Kurulum gerekmez. `index.html` dosyasını tarayıcıda açman yeterli; internet bağlantısı da gerekmez.

## Neler var
- **Uyum:** 12 burç, sana uygunluk sırasına göre. İlişki ve arkadaşlık için ayrı sıralama. Her burcun ayrıntısında 8 başlıkta puan, nedenleri ve öneriler.
- **Haritan:** Güneş, Ay, yükselen, Venüs, Mars ve Merkür burçların; element dengen ve burcunun özellikleri.
- **Günlük:** O günün gerçek gezegen konumları senin haritanla karşılaştırılır. Bugün, yarın ve bu hafta için.
- **Biriyle karşılaştır:** İki kişinin doğum haritasını yan yana koyar, aranızdaki açıları gösterir.
- **Ünlüler:** 85 ünlüyle uyumun; arama ve filtreler.
- Sonuçları WhatsApp'ta paylaşma, açık ve koyu tema.

## Nasıl hesaplanıyor
Gezegen konumları astronomik formüllerle (Meeus ve NASA/JPL yaklaşık yörünge elemanları) doğum anına ve yerine göre hesaplanır. Türkiye için 2016 öncesi yaz/kış saati otomatik hesaba katılır. Doğum saati bilinmiyorsa yükselen burç hesaplanamaz; bu durumda öğle saati kullanılır.

## Dosyalar
| Dosya | İçerik |
|---|---|
| `index.html` | Sayfa |
| `css/style.css` | Görünüm |
| `js/astro.js` | Gezegen ve yükselen hesabı |
| `js/data.js` | Burç bilgileri ve metinler |
| `js/compat.js` | Uyum puanlama |
| `js/horoscope.js` | Günlük ve haftalık yorum |
| `js/cities.js` | Şehirler ve saat dilimleri |
| `js/celebs.js` | Ünlü listesi |
| `js/app.js` | Arayüz |

Astrolojik geleneklere dayanır, eğlence amaçlıdır.
