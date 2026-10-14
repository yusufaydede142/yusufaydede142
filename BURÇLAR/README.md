# ✦ Burç Uyum Rehberi ✦

Doğum tarihi, doğum saati, doğum yeri ve cinsiyete göre **sana en uygun erkek / kadın burçlarını sırayla** gösteren, aralarındaki uyumu detaylı anlatan bir web uygulaması.

## Nasıl açılır?
Kurulum gerekmez, internet de gerekmez. `index.html` dosyasına çift tıklayıp tarayıcıda açman yeterli.

## Özellikler
- **Gerçek astronomik hesaplama:** Güneş, Ay, Merkür, Venüs, Mars konumları ve Yükselen burç doğum anına ve yerine göre hesaplanır.
- **81 il + 56 yurtdışı şehri**; listede olmayan yerler için enlem/boylam girişi.
- **Türkiye saat dilimi geçmişi:** 2016 öncesi yaz/kış saati uygulaması otomatik hesaba katılır (gelişmiş ayarlardan elle değiştirilebilir).
- **Doğum saati bilinmiyorsa** öğle saati kullanılır, Ay'ın o gün burç değiştirdiği durumlar belirtilir.
- **Kişiselleştirilmiş uyum sıralaması (1–12):** Güneş burcu uyumu; Ay, Yükselen, Venüs/Mars (partner cinsiyetine göre çekim gezegeni) ve 7. ev (alçalan burç) ile birlikte değerlendirilir.
- **8 kategoride uyum puanı:** Aşk, İletişim, Duygusal Bağ, Tutku, Güven, Ortak Değerler, Evlilik, Arkadaşlık.
- **Her burç için detaylı rapor:** açı ilişkisi, element ve nitelik uyumu, yönetici gezegenler, haritandan kişisel notlar, güçlü yönler, zorluklar, o burcun erkeği/kadını hakkında bilgi, kalbini kazanma ipuçları ve tavsiyeler.
- **Belirli biriyle uyum (sinastri):** Partnerin doğum bilgilerini girince iki harita gezegen gezegen karşılaştırılır; Güneş–Ay, Venüs–Mars gibi açılar, evlilik evi bağlantıları, kategori puanları ve yan yana harita tablosu gösterilir.
- **Sana özel günlük / haftalık yorum:** O günün gerçek gezegen konumları doğum haritanla karşılaştırılır; günün teması, gökyüzü etkileri, aşk/iş/ruh hali puanları, Merkür geri uyarısı, haftanın en iyi günleri ve burç geçişleri.
- **WhatsApp'ta paylaşma** ve metni kopyalama (kendi sonuçların ve partner uyumu için).
- **Açık / koyu tema** seçeneği (sağ üstteki düğme, tercih hatırlanır).
- **Ünlülerle uyum:** 85 Türk ve dünya ünlüsüyle kişisel uyum puanın; arama ve cinsiyet/köken filtresi.
- **Arkadaşlık uyumu** sekmesi, element/nitelik dağılımı, kişilik profili, yazdırma / PDF.

## Dosyalar
| Dosya | Açıklama |
|---|---|
| `index.html` | Ana sayfa |
| `css/style.css` | Tasarım (mobil uyumlu) |
| `js/astro.js` | Gezegen ve yükselen hesaplamaları |
| `js/data.js` | Burç bilgileri ve yorum metinleri |
| `js/compat.js` | Uyum puanlama motoru |
| `js/cities.js` | Şehir koordinatları ve saat dilimleri |
| `js/horoscope.js` | Günlük / haftalık kişisel yorum |
| `js/celebs.js` | Ünlü listesi |
| `js/app.js` | Arayüz mantığı |

> Astrolojik geleneklere dayanır ve eğlence amaçlıdır.
