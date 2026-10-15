# Proje kuralları

Bu depodaki uygulamalar sade, kullanışlı ve elle özenle yapılmış gibi görünmeli. "Yapay zeka üretmiş" hissi vermemeli.

## Tasarım
- Emoji kullanma: başlıklarda, düğmelerde ve metinlerde yok.
- Tek vurgu rengi kullan. Geçişli (gradient) renk, parıltı, yıldız ve ✦ gibi süsler kullanma.
- Bol boşluk bırak, net bir hiyerarşi kur. Bir ekranda en fazla 3 ana bölüm göster; fazlası için sekme kullan.
- Sistem yazı tipini kullan. Gölge ve köşe yuvarlaklığı hafif olsun.
- Önce telefon ekranını düşün. Yatay kaydırma olmasın.
- Açık ve koyu temayı birlikte destekle; varsayılan sistem ayarını izlesin.

## Metin
- Kısa, doğal, günlük Türkçe. Bir cümle tek bir şey söylesin.
- Kalıp ve abartılı ifadeler kullanma ("büyüleyici", "eşsiz bir yolculuk", "harika!", ünlem yağmuru).
- Kullanıcıya "sen" diye hitap et.
- Rakamları gereksiz yere çoğaltma; bir puan yeterliyse yanına beş puan daha koyma.

## Dürüstlük
- Uydurma veri gösterme. Rastgele üretilmiş bir şeyi gerçekmiş gibi sunma.
- Bilinmeyen bilgiyi açıkça söyle (örn. doğum saati yoksa yükselen hesaplanamaz).

## Kod
- Kurulum gerektirmeyen, düz HTML/CSS/JS tercih et; dış kütüphaneyi gerçekten gerekiyorsa ekle.
- Kullanıcıdan gelen metni sayfaya basmadan önce kaçış (escape) uygula.
- Değişiklikten sonra uygulamayı telefon ve masaüstü genişliğinde dene.

## Agent'lar
Arayüz değişikliğinden sonra `sade-tasarim` ve `kullanilabilirlik-testi`, metin değişikliğinden sonra `metin-editoru` agent'ını çalıştır.
