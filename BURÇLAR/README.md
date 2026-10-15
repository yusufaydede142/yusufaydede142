# Burç Uyumu

Doğum tarihine, saatine, yerine ve cinsiyetine göre sana en uygun burçları sıralar ve aranızdaki uyumu açıklar.

## Kullanım
Kurulum gerekmez. `index.html` dosyasını tarayıcıda açman yeterli.

İnternette yayınlamak için GitHub'da **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`** seç. Kök dizindeki `index.html` ziyaretçiyi bu klasöre yönlendirir.

## Neler var
- **Uyum:** 12 burç, sana uygunluk sırasına göre. İlişki ve arkadaşlık için ayrı sıralama. Her burcun ayrıntısında uyumun nedeni, karşı tarafın özellikleri ve bir öneri. Altında ünlülerle uyumun.
- **Davet bağlantısı:** Arkadaşına bir bağlantı gönderirsin; o sadece kendi bilgilerini girer ve ikinizin uyumunu hemen görür.
- **Haritan:** Doğum haritası çizimi; Güneş, Ay, yükselen, Venüs, Mars ve Merkür burçların; element dengen.
- **Günlük:** O günün gerçek gezegen konumları senin haritanla karşılaştırılır (bugün, yarın, hafta). Takvimde Ay evresi, dolunay ve yeniay, burç geçişleri ve Merkür geri hareketi.
- **Karşılaştır ve Çevren:** İki kişinin haritası yan yana. Karşılaştırdığın kişileri kaydedip hepsiyle uyumunu tek listede görürsün; grubun en uyumlu ikilisi de gösterilir.
- **Paylaşım:** WhatsApp, metin kopyalama ve Instagram/WhatsApp için hazır görsel.
- Telefonda ana ekrana eklenebilir ve internetsiz de çalışır (internette yayınlandığında).

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
| `sw.js`, `manifest.webmanifest`, `icons/` | Ana ekrana ekleme ve çevrimdışı çalışma |

Astrolojik geleneklere dayanır, eğlence amaçlıdır.
