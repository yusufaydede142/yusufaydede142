/* Burç verileri ve yorum metinleri */
(function (global) {
  'use strict';

  const SIGNS = [
    {
      name: 'Koç', symbol: '♈', dates: '21 Mart – 20 Nisan', element: 'Ateş', modality: 'Öncü', polarity: 'Eril',
      ruler: 'Mars', color: 'Kırmızı', stone: 'Elmas', day: 'Salı',
      keywords: ['cesur', 'girişimci', 'enerjik', 'dürüst', 'sabırsız'],
      summary: 'Zodyak\'ın ilk burcu olan Koç, yeni başlangıçların, cesaretin ve saf yaşam enerjisinin temsilcisidir. Düşündüğünü hemen yapar, rekabetten beslenir ve hayata öncü olarak katılmak ister. Dolaysız, samimi ve içi dışı birdir; öfkesi çabuk parlar ama çabuk da söner.',
      strengths: ['Cesaret ve liderlik', 'Dürüst ve açık sözlü olması', 'Yüksek motivasyon ve enerji', 'Korumacı ve sadık tavrı'],
      weaknesses: ['Sabırsızlık', 'Düşünmeden hareket etme', 'Çabuk sinirlenme', 'Rekabeti ilişkiye taşıma'],
      male: 'Koç erkeği fethetmeyi seven, kendinden emin ve tutkulu biridir. Hoşlandığı kişiye doğrudan yaklaşır, oyun oynamaz. Korumacıdır; sevdiği kişiyi savunmak için her şeyi yapar. Sıkılmaya meyillidir, bu yüzden ilişkide heyecan ve meydan okuma arar. Bağımsızlığına müdahale edilmesinden hoşlanmaz ama sevdiğinde son derece sadıktır.',
      female: 'Koç kadını bağımsız, cesur ve ne istediğini bilen biridir. Kendi ayakları üzerinde durur, ilişkide eşitlik ister. İlk adımı atmaktan çekinmez. Duygularını saklamaz; sevgisi de öfkesi de açıktır. Ona hayran olan ama onu kontrol etmeye çalışmayan, kendisine yetişebilecek enerjide bir partner arar.',
      inLove: 'Aşkta ateşli ve hızlıdır. Kovalamaca ve heyecan onu canlı tutar; rutin ve pasiflik ise sönmesine neden olur.',
      winMale: 'Kendinden emin ol, ona meydan oku, macera teklif et. Fazla kolay ulaşılabilir olma ama oyun da oynama; dürüstlüğe değer verir.',
      winFemale: 'Ona saygı duy ve bağımsızlığını destekle. Spontane planlar yap, onu şaşırt; sıkıcı ya da kararsız görünme.',
      needs: 'Heyecan, özgürlük, takdir ve dürüstlük.'
    },
    {
      name: 'Boğa', symbol: '♉', dates: '21 Nisan – 20 Mayıs', element: 'Toprak', modality: 'Sabit', polarity: 'Dişil',
      ruler: 'Venüs', color: 'Yeşil', stone: 'Zümrüt', day: 'Cuma',
      keywords: ['sadık', 'sabırlı', 'güvenilir', 'duyusal', 'inatçı'],
      summary: 'Boğa, istikrarın, güvenin ve dünyevi zevklerin burcudur. Venüs\'ün yönettiği bu burç güzelliği, konforu, iyi yemeği ve kalıcı değerleri sever. Yavaş ama emin adımlarla ilerler; bir kez bağlandığında kolay kolay vazgeçmez.',
      strengths: ['Sadakat ve güvenilirlik', 'Sabır ve kararlılık', 'Pratik zekâ', 'Şefkatli ve sıcak yapı'],
      weaknesses: ['İnatçılık', 'Değişime direnç', 'Sahiplenicilik', 'Rahatına düşkünlük'],
      male: 'Boğa erkeği sakin, güven veren ve sağlam biridir. Acele etmez; birini tanımak için zaman ister ama karar verdiğinde ciddi ve kalıcı ilişki kurar. Romantizmi somut jestlerle gösterir: güzel bir akşam yemeği, düşünülmüş bir hediye. Güvenliği ve huzuru önemser, sadakatsizliği asla affetmez.',
      female: 'Boğa kadını zarif, sıcak ve son derece sadıktır. Güzel şeylerden hoşlanır ve kendine değer verilmesini ister. Duygusal ve maddi güvenlik onun için önemlidir. Bir kez güvendiğinde partnerine tüm kalbiyle bağlanır; sabırlıdır ama sınırları aşıldığında geri dönüşü zordur.',
      inLove: 'Aşkı yavaş pişen bir yemek gibidir: sabırla büyür, uzun süre doyurur. Dokunmak, yakınlık ve sadakat onun aşk dilidir.',
      winMale: 'Acele etme; güvenilir ve tutarlı ol. Onu güzel bir sofraya, doğaya ya da konsere götür. Samimiyet ve zarafet onu etkiler.',
      winFemale: 'Kibar, tutarlı ve sözünün eri ol. Onu şımart, duyularına hitap eden deneyimler sun ve uzun vadeli niyetini göster.',
      needs: 'Güven, istikrar, fiziksel yakınlık ve sadakat.'
    },
    {
      name: 'İkizler', symbol: '♊', dates: '21 Mayıs – 21 Haziran', element: 'Hava', modality: 'Değişken', polarity: 'Eril',
      ruler: 'Merkür', color: 'Sarı', stone: 'Akik', day: 'Çarşamba',
      keywords: ['meraklı', 'konuşkan', 'esprili', 'uyumlu', 'kararsız'],
      summary: 'İkizler, zihnin, iletişimin ve merakın burcudur. Merkür\'ün yönettiği bu burç hızlı düşünür, çok konuşur ve her şeyi öğrenmek ister. Sosyal, esprili ve çok yönlüdür; aynı anda birçok ilgi alanını yürütebilir.',
      strengths: ['Zekâ ve hazırcevaplık', 'Uyum sağlama yeteneği', 'Eğlenceli ve sosyal yapı', 'Açık fikirlilik'],
      weaknesses: ['Kararsızlık', 'Çabuk sıkılma', 'Yüzeysellik', 'Duygularını zihinselleştirme'],
      male: 'İkizler erkeği esprili, meraklı ve sohbetiyle büyüleyen biridir. Zihnini uyaran, onunla saatlerce konuşabilen bir partner arar. Özgürlüğüne düşkündür; fazla kıskançlık ve kısıtlama onu uzaklaştırır. Duygularını sözcüklerle ifade eder, mesajlaşmayı ve fikir alışverişini sever.',
      female: 'İkizler kadını canlı, sosyal ve çok yönlü biridir. Bir gün maceracı, ertesi gün düşünceli olabilir. Zekâsına hitap eden, onu güldüren ve değişimine ayak uydurabilen birine aşık olur. Monotonluk onu boğar; ilişkide sürekli yeni bir şey keşfetmek ister.',
      inLove: 'Aşk onun için önce zihinsel bir çekimdir. Konuşamadığı biriyle uzun süre birlikte olamaz.',
      winMale: 'İlginç sohbetler aç, mizahını göster, onu entelektüel olarak şaşırt. Sıkıcı rutinlerden ve aşırı sahiplenmeden kaçın.',
      winFemale: 'Onu güldür, merak ettiği konulara ilgi göster, spontane planlar yap. Mesajlaşmaya ve fikir paylaşmaya açık ol.',
      needs: 'Zihinsel uyarım, çeşitlilik, özgürlük ve iyi bir sohbet.'
    },
    {
      name: 'Yengeç', symbol: '♋', dates: '22 Haziran – 22 Temmuz', element: 'Su', modality: 'Öncü', polarity: 'Dişil',
      ruler: 'Ay', color: 'Gümüş / Beyaz', stone: 'İnci', day: 'Pazartesi',
      keywords: ['şefkatli', 'koruyucu', 'sezgisel', 'aile odaklı', 'alıngan'],
      summary: 'Yengeç, duyguların, yuvanın ve aidiyetin burcudur. Ay\'ın yönettiği bu burç derin hisseder, sevdiklerini korur ve geçmişe, aileye, anılara büyük değer verir. Dışarıdan sert bir kabuk gösterse de içi son derece yumuşaktır.',
      strengths: ['Derin şefkat ve empati', 'Sadakat ve koruyuculuk', 'Güçlü sezgiler', 'Yuva kurma yeteneği'],
      weaknesses: ['Alınganlık', 'Ruh hali dalgalanmaları', 'Geçmişe takılma', 'Pasif-agresif tepkiler'],
      male: 'Yengeç erkeği duygusal, şefkatli ve aile kurmaya yatkın biridir. İlk başta çekingen görünebilir; güvenmeden kalbini açmaz. Sevdiğinde son derece koruyucu ve fedakârdır. Yuvasını, ailesini ve partnerini her şeyin üstünde tutar. Duygusal olarak güvende hissetmeye ihtiyaç duyar.',
      female: 'Yengeç kadını sıcak, sezgisel ve besleyici bir yapıya sahiptir. Sevdiklerine anne şefkatiyle yaklaşır. Duygusal derinlik ve sadakat arar; yüzeysel ilişkiler onu tatmin etmez. Kırıldığında kabuğuna çekilir; sabır ve anlayışla yaklaşılmayı bekler.',
      inLove: 'Aşkı bir yuva gibidir: güvenli, sıcak ve kalıcı. Sevgisini bakım vererek, yemek yaparak, hatırlayarak gösterir.',
      winMale: 'Ona güvenli bir alan sun, duygularına saygı göster. Ailesine ve geçmişine ilgi duy; sıcaklığın onu açar.',
      winFemale: 'Nazik, tutarlı ve duygusal olarak ulaşılabilir ol. Küçük detayları hatırla, ona korunduğunu hissettir.',
      needs: 'Duygusal güvenlik, aidiyet, şefkat ve sadakat.'
    },
    {
      name: 'Aslan', symbol: '♌', dates: '23 Temmuz – 22 Ağustos', element: 'Ateş', modality: 'Sabit', polarity: 'Eril',
      ruler: 'Güneş', color: 'Altın / Turuncu', stone: 'Yakut', day: 'Pazar',
      keywords: ['karizmatik', 'cömert', 'yaratıcı', 'gururlu', 'sadık'],
      summary: 'Aslan, kalbin, yaratıcılığın ve kendini ifade etmenin burcudur. Güneş\'in yönettiği bu burç doğal bir karizmaya sahiptir; girdiği ortamı aydınlatır. Cömert, sıcak ve sadıktır; takdir edilmek ve sevildiğini hissetmek ister.',
      strengths: ['Karizma ve özgüven', 'Cömertlik ve sıcaklık', 'Sadakat', 'Yaratıcılık ve liderlik'],
      weaknesses: ['Gurur ve ego', 'Takdir edilme ihtiyacı', 'Dramatiklik', 'İnatçılık'],
      male: 'Aslan erkeği kendinden emin, cömert ve romantik biridir. Sevdiği kişiye kral gibi davranır, onu şımartmayı sever. Karşılığında hayranlık ve sadakat bekler. Gururu kolay incinir; eleştiriyi nazikçe duymak ister. İlişkide koruyucu ve tutkulu bir partnerdir.',
      female: 'Aslan kadını göz alıcı, sıcak ve güçlü bir kişiliğe sahiptir. Kendine değer verilmesini, özel hissettirilmeyi ister. Sevdiği kişiye son derece cömert ve sadıktır. Gölgede kalmayı sevmez; onunla gurur duyan ve bunu gösteren bir partner arar.',
      inLove: 'Aşkta büyük jestleri, romantizmi ve tutkuyu sever. Sevdiğini dünyaya göstermekten çekinmez.',
      winMale: 'Ona içten iltifat et, başarılarını takdir et. Kendinden emin ve bakımlı ol; onunla birlikte parlayabileceğini göster.',
      winFemale: 'Onu özel hissettir, cömert ve romantik ol. Onu kıskanç bir şekilde kısıtlama, onunla gurur duyduğunu göster.',
      needs: 'Takdir, hayranlık, sadakat ve romantizm.'
    },
    {
      name: 'Başak', symbol: '♍', dates: '23 Ağustos – 22 Eylül', element: 'Toprak', modality: 'Değişken', polarity: 'Dişil',
      ruler: 'Merkür', color: 'Lacivert / Bej', stone: 'Safir', day: 'Çarşamba',
      keywords: ['titiz', 'analitik', 'yardımsever', 'mütevazı', 'eleştirel'],
      summary: 'Başak, hizmetin, düzenin ve mükemmelliğin burcudur. Merkür\'ün toprak yüzünü temsil eder; detaycı, analitik ve pratik düşünür. Sevgisini sözlerden çok emekle, yardımla ve özenle gösterir.',
      strengths: ['Analitik zekâ', 'Güvenilirlik ve çalışkanlık', 'Yardımseverlik', 'Detaylara dikkat'],
      weaknesses: ['Aşırı eleştirellik', 'Endişeye yatkınlık', 'Mükemmeliyetçilik', 'Duygularını açmakta zorlanma'],
      male: 'Başak erkeği ölçülü, zeki ve güvenilir biridir. Duygularını hemen göstermez ama sevdiğinde bunu küçük, düşünülmüş hareketlerle belli eder. Düzenli ve sağlıklı bir hayat ister. Partnerinin de kendini geliştiren, tutarlı ve dürüst biri olmasını bekler.',
      female: 'Başak kadını zarif, akıllı ve özenli biridir. Seçicidir; kalbini kolay açmaz. Bir ilişkiye girdiğinde son derece sadık ve destekleyicidir. Partnerinin hayatını kolaylaştırmak için çok çabalar; karşılığında saygı ve takdir bekler.',
      inLove: 'Aşkı hizmet etmektir: sana kahve yapmak, sorununu çözmek, sağlığınla ilgilenmek. Güven kazandıkça çok sıcak bir partnere dönüşür.',
      winMale: 'Zekânı ve tutarlılığını göster, abartıdan kaçın. Küçük detaylara verdiğin önem onu etkiler.',
      winFemale: 'Sabırlı ve saygılı ol, dağınıklık ve sorumsuzluktan kaçın. Ona yardım teklif et, fikirlerine değer ver.',
      needs: 'Güven, düzen, takdir edilmek ve zihinsel uyum.'
    },
    {
      name: 'Terazi', symbol: '♎', dates: '23 Eylül – 22 Ekim', element: 'Hava', modality: 'Öncü', polarity: 'Eril',
      ruler: 'Venüs', color: 'Pembe / Açık Mavi', stone: 'Opal', day: 'Cuma',
      keywords: ['uyumlu', 'zarif', 'adil', 'romantik', 'kararsız'],
      summary: 'Terazi, ilişkilerin, dengenin ve estetiğin burcudur. Venüs\'ün hava yüzünü temsil eder; zarif, diplomatik ve sosyaldir. Hayatı bir partnerle paylaşmak onun için doğaldır; uyum ve adalet en temel değerleridir.',
      strengths: ['Diplomasi ve uzlaşmacılık', 'Zarafet ve estetik duygusu', 'Romantizm', 'Adalet duygusu'],
      weaknesses: ['Kararsızlık', 'Çatışmadan kaçınma', 'Başkalarını memnun etme çabası', 'Yalnız kalmaktan korkma'],
      male: 'Terazi erkeği çekici, kibar ve romantik biridir. Partnerine centilmence davranır, güzel şeylerle onu mutlu etmek ister. Çatışmadan hoşlanmaz, sorunları konuşarak çözmeyi tercih eder. Estetik ve zihinsel uyumu olan, zarif bir partner arar.',
      female: 'Terazi kadını zarif, sosyal ve romantik biridir. Uyumlu bir ilişki onun için hayatın merkezindedir. Kaba davranışlar ve kavga onu çok yorar. Kendisine eşit davranan, onu dinleyen ve hayatı güzelleştiren bir partnerle çiçek açar.',
      inLove: 'Aşkı ortaklıktır: birlikte karar vermek, birlikte güzel anlar yaşamak. Romantik jestler ve nezaket onun için çok değerlidir.',
      winMale: 'Zarif ve kibar ol, ilginç sohbetler kur. Sanat, müzik, güzel mekânlar gibi ortak estetik zevkler onu çeker.',
      winFemale: 'Centilmen ol, onu dinle, kararlarda onu ortak et. Romantik ve dengeli bir tavır onu etkiler.',
      needs: 'Uyum, ortaklık, nezaket ve güzellik.'
    },
    {
      name: 'Akrep', symbol: '♏', dates: '23 Ekim – 21 Kasım', element: 'Su', modality: 'Sabit', polarity: 'Dişil',
      ruler: 'Plüton / Mars', color: 'Bordo / Siyah', stone: 'Topaz', day: 'Salı',
      keywords: ['tutkulu', 'derin', 'gizemli', 'kararlı', 'kıskanç'],
      summary: 'Akrep, dönüşümün, tutkunun ve derinliğin burcudur. Hiçbir şeyi yarım yaşamaz; ya hep ya hiç der. Güçlü sezgileri vardır, insanların içini okur. Güveni kazanmak zordur ama kazanıldığında sadakati sarsılmazdır.',
      strengths: ['Tutku ve kararlılık', 'Derin sadakat', 'Güçlü sezgi', 'Dayanıklılık'],
      weaknesses: ['Kıskançlık ve sahiplenme', 'Kin tutma', 'Gizlilik', 'Kontrol ihtiyacı'],
      male: 'Akrep erkeği gizemli, yoğun ve manyetik bir çekiciliğe sahiptir. Duygularını kolay açmaz ama hissettiği her şey derindir. İlişkide tam bir bağlılık ve dürüstlük ister; ihaneti asla unutmaz. Sevdiğinde koruyucu, tutkulu ve sonuna kadar sadıktır.',
      female: 'Akrep kadını güçlü, gizemli ve son derece sezgisel biridir. Yüzeysel ilişkilerle ilgilenmez; ruhunu görecek birini arar. Güvendiği kişiye tüm benliğiyle bağlanır. Sınanmaktan ve yalandan nefret eder; dürüstlüğe ve derinliğe değer verir.',
      inLove: 'Aşkı yoğun, tutkulu ve dönüştürücüdür. Duygusal ve fiziksel bütünleşme arar.',
      winMale: 'Gizemini koru, her şeyi hemen anlatma; ama asla yalan söyleme. Derin konuşmalar ve sadakat onu kazanır.',
      winFemale: 'Dürüst, kararlı ve duygusal olarak cesur ol. Onu sınamaya kalkma; ona güvenebileceğini zamanla göster.',
      needs: 'Güven, derinlik, tutku ve sadakat.'
    },
    {
      name: 'Yay', symbol: '♐', dates: '22 Kasım – 21 Aralık', element: 'Ateş', modality: 'Değişken', polarity: 'Eril',
      ruler: 'Jüpiter', color: 'Mor', stone: 'Turkuaz', day: 'Perşembe',
      keywords: ['özgür', 'iyimser', 'maceracı', 'filozof', 'patavatsız'],
      summary: 'Yay, özgürlüğün, keşfin ve anlam arayışının burcudur. Jüpiter\'in yönettiği bu burç iyimser, cömert ve maceracıdır. Seyahat etmeyi, öğrenmeyi, yeni kültürleri tanımayı sever. Dürüstlüğü bazen patavatsızlığa varır.',
      strengths: ['İyimserlik ve neşe', 'Açık fikirlilik', 'Dürüstlük', 'Macera ruhu'],
      weaknesses: ['Bağlanma korkusu', 'Patavatsızlık', 'Sabırsızlık', 'Aşırı iyimserlik / dağınıklık'],
      male: 'Yay erkeği eğlenceli, maceracı ve özgür ruhludur. Hayatı bir yolculuk olarak görür ve bu yolculuğa eşlik edecek bir arkadaş-sevgili arar. Kıskançlık ve kısıtlama onu kaçırır. Bağlandığında dürüst ve cömert bir partnerdir; ama özgürlük alanına ihtiyaç duyar.',
      female: 'Yay kadını neşeli, bağımsız ve hayat dolu biridir. Kafası çalışan, onu güldüren ve maceralara katılan birine aşık olur. Dürüstlüğe çok önem verir. İlişkide kendini kafeste hissetmemesi gerekir; özgürlüğü ile bağlılığı bir arada yaşayabilir.',
      inLove: 'Aşkı bir maceradır. Birlikte keşfetmek, öğrenmek ve gülmek ilişkisinin yakıtıdır.',
      winMale: 'Ona macera teklif et, felsefi sohbetler kur, bağımsızlığına saygı göster. Neşen ve açık fikirliliğin onu çeker.',
      winFemale: 'Onu güldür, seyahat planla, fikirlerine açık ol. Kıskançlık ve dram göstermekten kaçın.',
      needs: 'Özgürlük, macera, dürüstlük ve anlam.'
    },
    {
      name: 'Oğlak', symbol: '♑', dates: '22 Aralık – 19 Ocak', element: 'Toprak', modality: 'Öncü', polarity: 'Dişil',
      ruler: 'Satürn', color: 'Kahverengi / Antrasit', stone: 'Oniks', day: 'Cumartesi',
      keywords: ['hırslı', 'disiplinli', 'sorumlu', 'sabırlı', 'mesafeli'],
      summary: 'Oğlak, sorumluluğun, başarının ve kalıcı yapıların burcudur. Satürn\'ün yönettiği bu burç disiplinli, sabırlı ve hedef odaklıdır. Hayatı ciddiye alır, uzun vadeli düşünür. Zamanla yumuşar; yaşlandıkça gençleşen burç olarak bilinir.',
      strengths: ['Sorumluluk ve güvenilirlik', 'Hırs ve azim', 'Sabır', 'Pratik bilgelik'],
      weaknesses: ['Duygusal mesafe', 'Aşırı iş odaklılık', 'Karamsarlık', 'Katılık'],
      male: 'Oğlak erkeği ciddi, olgun ve güvenilir biridir. Duygularını hemen göstermez; sevgisini sorumluluk alarak, geleceği planlayarak ifade eder. Partnerinde zarafet, olgunluk ve hedef birliği arar. Bir kez bağlandığında son derece sadık ve koruyucudur.',
      female: 'Oğlak kadını güçlü, kararlı ve ayakları yere basan biridir. Kariyer ve başarı onun için önemlidir; partnerinin de hırslı ve sorumlu olmasını ister. Dışarıdan soğuk görünebilir ama güvendiği kişiye derin bir sıcaklık gösterir.',
      inLove: 'Aşkı bir yatırımdır: zamanla değeri artan, sağlam temellere oturan bir yapı.',
      winMale: 'Olgun, saygılı ve hedefleri olan biri olduğunu göster. Sabırlı ol; onun güvenini zaman kazandırır.',
      winFemale: 'Sorumluluk sahibi ve tutarlı ol, onun hedeflerine saygı duy. Gösterişten çok güvenilirlik onu etkiler.',
      needs: 'Saygı, güvenilirlik, ortak hedefler ve istikrar.'
    },
    {
      name: 'Kova', symbol: '♒', dates: '20 Ocak – 18 Şubat', element: 'Hava', modality: 'Sabit', polarity: 'Eril',
      ruler: 'Uranüs / Satürn', color: 'Turkuaz / Elektrik Mavisi', stone: 'Ametist', day: 'Cumartesi',
      keywords: ['özgün', 'bağımsız', 'vizyoner', 'insancıl', 'mesafeli'],
      summary: 'Kova, özgünlüğün, özgürlüğün ve geleceğin burcudur. Kalıpların dışında düşünür, yenilikleri sever ve insanlığın iyiliği için idealler taşır. Arkadaşlık onun için kutsaldır; en iyi ilişkileri dostluk temeli üzerine kurulur.',
      strengths: ['Özgünlük ve yaratıcılık', 'Açık fikirlilik', 'Sadık dostluk', 'İnsancıl değerler'],
      weaknesses: ['Duygusal mesafe', 'İnatçılık', 'Öngörülemezlik', 'Bağımsızlığı aşırı önemseme'],
      male: 'Kova erkeği sıra dışı, zeki ve bağımsız biridir. Önce arkadaş olmak ister; aşk dostluğun içinden doğar. Duygularını mantıkla süzer, dramdan hoşlanmaz. Özgürlüğüne saygı duyan, kendi dünyası olan ve fikirleri ilginç bir partner onu cezbeder.',
      female: 'Kova kadını özgür ruhlu, ilginç ve kendine özgü biridir. Klişelerden hoşlanmaz; ilişkisini de kendi kurallarıyla yaşamak ister. Zihinsel bağ, ortak idealler ve karşılıklı özgürlük onun için temel şarttır.',
      inLove: 'Aşkı önce derin bir arkadaşlıktır. Sahiplenici değil, özgürleştirici bir ilişki ister.',
      winMale: 'Kendin ol, ilginç fikirlerini paylaş, onun projelerine ilgi göster. Baskı ve dram kurmaktan uzak dur.',
      winFemale: 'Onun özgünlüğünü kutla, özgürlüğüne saygı duy. Önce iyi bir arkadaş ol; gerisi doğal gelir.',
      needs: 'Özgürlük, dostluk, zihinsel uyum ve özgünlük.'
    },
    {
      name: 'Balık', symbol: '♓', dates: '19 Şubat – 20 Mart', element: 'Su', modality: 'Değişken', polarity: 'Dişil',
      ruler: 'Neptün / Jüpiter', color: 'Deniz Yeşili / Lila', stone: 'Akuamarin', day: 'Perşembe',
      keywords: ['romantik', 'empatik', 'hayalperest', 'sanatsal', 'fedakâr'],
      summary: 'Balık, zodyak\'ın son burcu olarak tüm burçların izlerini taşır. Empatik, sezgisel ve romantiktir; başkalarının duygularını kendi duyguları gibi hisseder. Sanata, müziğe ve maneviyata yatkındır. Gerçeklikten kaçma eğilimi en büyük sınavıdır.',
      strengths: ['Derin empati', 'Romantizm ve şefkat', 'Yaratıcılık', 'Sezgi ve hoşgörü'],
      weaknesses: ['Gerçeklerden kaçma', 'Sınır koymakta zorlanma', 'Aşırı fedakârlık', 'Kararsızlık'],
      male: 'Balık erkeği romantik, duyarlı ve hayalperest biridir. Sevdiği kişiye şiirler yazan, onu ruhundan seven bir partnerdir. Kaba ve soğuk insanlardan uzak durur. Ona güven veren, hayallerini paylaşan ve ayaklarını yere bastırabilen bir partnerle mutlu olur.',
      female: 'Balık kadını şefkatli, sezgisel ve masalsı bir romantizme sahiptir. Ruh eşi arar; derin duygusal bağ kurmak ister. Çok fedakârdır, bu yüzden kendisine de aynı özeni gösteren birine ihtiyaç duyar. Nazik ve koruyucu partnerlerle kendini güvende hisseder.',
      inLove: 'Aşkı ruhsal bir birleşmedir. Romantizm, şefkat ve hayal gücü ilişkisini besler.',
      winMale: 'Nazik ve romantik ol, duygularını paylaş. Sanat, müzik ve hayaller üzerine konuşmak onu yakınlaştırır.',
      winFemale: 'Ona şefkat göster, onu dinle ve koruyucu ol. Romantik jestler ve sabır onun kalbini açar.',
      needs: 'Şefkat, romantizm, ruhsal bağ ve anlaşılmak.'
    }
  ];

  /* Klasik güneş burcu uyum matrisi (%), simetrik */
  const RAW = [
    // Koç Boğa İkiz Yeng Asln Başk Terz Akrp Yay  Oğlk Kova Balık
    [70, 55, 83, 45, 95, 48, 78, 60, 93, 47, 85, 55], // Koç
    [55, 72, 50, 90, 55, 94, 62, 82, 45, 96, 42, 88], // Boğa
    [83, 50, 68, 52, 85, 58, 94, 45, 80, 48, 95, 50], // İkizler
    [45, 90, 52, 75, 58, 85, 50, 95, 42, 78, 45, 97], // Yengeç
    [95, 55, 85, 58, 72, 52, 88, 55, 96, 50, 76, 48], // Aslan
    [48, 94, 58, 85, 52, 70, 55, 87, 50, 95, 52, 72], // Başak
    [78, 62, 94, 50, 88, 55, 70, 58, 86, 52, 93, 57], // Terazi
    [60, 82, 45, 95, 55, 87, 58, 74, 50, 89, 46, 96], // Akrep
    [93, 45, 80, 42, 96, 50, 86, 50, 74, 52, 88, 55], // Yay
    [47, 96, 48, 78, 50, 95, 52, 89, 52, 75, 55, 84], // Oğlak
    [85, 42, 95, 45, 76, 52, 93, 46, 88, 55, 72, 56], // Kova
    [55, 88, 50, 97, 48, 72, 57, 96, 55, 84, 56, 74]  // Balık
  ];

  const CATEGORIES = [
    { key: 'ask', label: 'Aşk & Romantizm', icon: '💘' },
    { key: 'iletisim', label: 'İletişim', icon: '💬' },
    { key: 'duygu', label: 'Duygusal Bağ', icon: '🌙' },
    { key: 'tutku', label: 'Tutku & Çekim', icon: '🔥' },
    { key: 'guven', label: 'Güven & Sadakat', icon: '🤝' },
    { key: 'deger', label: 'Ortak Değerler', icon: '⚖️' },
    { key: 'evlilik', label: 'Evlilik & Uzun Vade', icon: '💍' },
    { key: 'arkadas', label: 'Arkadaşlık', icon: '🌟' }
  ];

  // Element çiftine göre kategori düzeltmeleri [ask, iletisim, duygu, tutku, guven, deger, evlilik, arkadas]
  const ELEMENT_PAIRS = {
    'Ateş-Ateş': {
      mods: [4, 3, -5, 8, -4, 2, -4, 6],
      text: 'İki ateş burcu bir araya geldiğinde ortaya çıkan enerji göz kamaştırıcıdır. Birbirinizin cesaretini, tutkusunu ve hayata olan heyecanını anında anlarsınız. Birlikte hareket etmek, risk almak ve eğlenmek çok doğal gelir.',
      plus: ['Yüksek enerji ve ortak heyecan', 'Güçlü fiziksel çekim', 'Birbirini motive etme'],
      minus: ['İki güçlü ego çatışabilir', 'Duygusal derinlik ihmal edilebilir', 'Kavgalar hızla alevlenebilir']
    },
    'Toprak-Toprak': {
      mods: [-2, -3, 2, -2, 8, 7, 8, 2],
      text: 'İki toprak burcu aynı dili konuşur: güven, istikrar ve somut hedefler. Birbirinize sağlam bir zemin sunarsınız; birlikte ev, kariyer ve gelecek inşa etmek bu ilişkinin doğasıdır.',
      plus: ['Yüksek güven ve sadakat', 'Ortak pratik hedefler', 'Maddi ve duygusal istikrar'],
      minus: ['İlişki rutine ve monotonluğa dönebilir', 'Romantizm ve spontanlık eksik kalabilir', 'İki taraf da inatçı olabilir']
    },
    'Hava-Hava': {
      mods: [0, 8, -6, -2, -3, 3, -3, 8],
      text: 'İki hava burcu arasında zihinsel bir kıvılcım vardır. Sohbetleriniz bitmez; fikirler, planlar ve kahkahalar arasında zaman su gibi akar. Birbirinizin özgürlüğüne saygı duymak sizin için doğaldır.',
      plus: ['Mükemmel iletişim', 'Ortak sosyal hayat ve merak', 'Birbirinin özgürlüğüne saygı'],
      minus: ['Duygusal derinlik yüzeyde kalabilir', 'Kararlılık ve somut adımlar eksik olabilir', 'Bağlılık konusu ertelenebilir']
    },
    'Su-Su': {
      mods: [5, -2, 9, 5, 3, 2, 3, 0],
      text: 'İki su burcu birbirini kelimelere gerek kalmadan anlar. Sezgisel, derin ve şefkatli bir bağ kurarsınız. Duygusal dünyanız birbirine akar; bu ilişki ruh eşliğine en yakın deneyimlerden biridir.',
      plus: ['Derin duygusal anlayış', 'Sezgisel iletişim', 'Şefkat ve romantizm'],
      minus: ['Duygusal dalgalanmalar birbirini besleyebilir', 'Sorunlar konuşulmadan geçiştirilebilir', 'Gerçekçi kararlar zorlaşabilir']
    },
    'Ateş-Hava': {
      mods: [3, 6, -4, 5, -3, 2, -2, 6],
      text: 'Hava ateşi besler: biriniz fikir üretir, diğeri onu harekete geçirir. Bu, zodyak\'ın en canlı ve eğlenceli kombinasyonlarından biridir. Birlikte sıkılmanız neredeyse imkânsızdır.',
      plus: ['Heyecan verici ve dinamik ilişki', 'Zihinsel ve fiziksel uyum', 'Ortak macera ve sosyal yaşam'],
      minus: ['Duygusal ihtiyaçlar gözden kaçabilir', 'Kararlılık ve süreklilik sınanabilir', 'Tartışmalar alevlenebilir']
    },
    'Toprak-Su': {
      mods: [3, -2, 6, 2, 7, 4, 7, 1],
      text: 'Su toprağı besler, toprak suya şekil verir. Bu kombinasyon birbirini tamamlayan, verimli ve şefkatli bir bağ oluşturur. Biriniz güven ve yapı sunarken diğeri duygusal derinlik ve sıcaklık katar.',
      plus: ['Güçlü güven ve bağlılık', 'Duygusal ve maddi güvenlik', 'Aile kurmaya çok uygun'],
      minus: ['Değişime kapalı bir rutine dönüşebilir', 'Duygular bazen bastırılabilir', 'Fazla içe kapanma']
    },
    'Ateş-Toprak': {
      mods: [-3, -4, -3, 2, 2, -4, -2, -3],
      text: 'Ateş hızlı, toprak yavaştır. Biriniz hemen harekete geçmek isterken diğeri planlamak ve güvence almak ister. Doğru dengelendiğinde ateş toprağa heyecan, toprak ateşe kalıcılık kazandırır.',
      plus: ['Birbirini dengeleme potansiyeli', 'Hırs ve azimde ortaklık', 'Fiziksel çekim'],
      minus: ['Tempo farkı sabırsızlık yaratabilir', 'Risk algısında çatışma', 'Biri diğerini fazla temkinli ya da fazla aceleci bulabilir']
    },
    'Ateş-Su': {
      mods: [-2, -4, 1, 6, -4, -4, -4, -3],
      text: 'Ateş ve su buhar oluşturur: yoğun, tutkulu ama zaman zaman yakıcı. Aranızdaki çekim güçlüdür, fakat ateşin doğrudanlığı suyun hassasiyetini incitebilir; suyun duygusallığı ise ateşin hevesini söndürebilir.',
      plus: ['Yoğun tutku ve çekim', 'Birbirinden öğrenme fırsatı', 'Duygusal yoğunluk'],
      minus: ['İletişim tarzları çok farklı', 'Kırgınlıklar birikebilir', 'Özgürlük ile yakınlık ihtiyacı çatışabilir']
    },
    'Hava-Toprak': {
      mods: [-4, 1, -5, -3, -1, -2, -2, -1],
      text: 'Hava fikirler dünyasında, toprak somut gerçeklikte yaşar. Biriniz teorize ederken diğeri uygulamaya bakar. Saygı ve sabır olduğunda bu fark büyük bir tamamlayıcılığa dönüşebilir.',
      plus: ['Fikir ve uygulamanın birleşimi', 'Birbirine yeni bakış açısı kazandırma', 'Mantıklı karar alma'],
      minus: ['Duygusal ifade eksik kalabilir', 'Biri diğerini sıkıcı, öteki dağınık bulabilir', 'Hayat ritimleri farklı']
    },
    'Hava-Su': {
      mods: [-3, -1, -3, -3, -4, -3, -3, -2],
      text: 'Hava düşünür, su hisseder. Biriniz mantıkla yaklaşırken diğeri kalbiyle tepki verir. Bu ilişki karşılıklı anlayış ve sabır gerektirir; başarıldığında ise hem akla hem kalbe hitap eden zengin bir bağ oluşur.',
      plus: ['Birbirinin eksik yanını tamamlama', 'Yaratıcılık ve hayal gücü', 'Romantik idealizm'],
      minus: ['Duygusal ihtiyaçlar yanlış anlaşılabilir', 'Mesafe ve yakınlık dengesi zor', 'Güven inşası zaman alabilir']
    }
  };

  // Burçlar arası açı (aspekt) – mesafe 0..6
  const ASPECTS = [
    {
      name: 'Aynı burç (Kavuşum)', mods: [0, 3, 2, -2, 2, 5, 0, 4],
      text: 'Aynı burçtan olduğunuz için birbirinize ayna tutarsınız. Değerleriniz, tepkileriniz ve ihtiyaçlarınız çok benzer; anlaşmak kolaydır. Ancak aynı zayıflıkları da paylaştığınız için kör noktalarınızı birbirinize gösteremeyebilirsiniz.',
      advice: 'Benzerliklerinizin rahatlığını yaşarken ilişkiye dışarıdan yeni deneyimler katmayı ihmal etmeyin.'
    },
    {
      name: 'Komşu burçlar (Yarım altmışlık)', mods: [-1, 0, 0, -2, 0, 0, 0, 1],
      text: 'Komşu burçlar olarak birbirinize çok yakın ama çok farklısınız. Biriniz, diğerinin henüz öğrenmediği dersleri taşır. Bu ilişki öğretici ve gelişim odaklıdır; başta tuhaf gelen farklılıklar zamanla değerli bir tamamlanmaya dönüşür.',
      advice: 'Farklılıkları düzeltilmesi gereken hatalar olarak değil, öğrenme fırsatları olarak görün.'
    },
    {
      name: 'Altmışlık (Sekstil)', mods: [1, 4, 0, 0, 0, 1, 0, 5],
      text: 'Aranızda dostça ve destekleyici bir altmışlık açı var. Birbirinizle konuşmak kolaydır, ortak ilgi alanları bulmak zahmetsizdir. Bu ilişki arkadaşlık temelinde büyür ve doğal bir akışa sahiptir.',
      advice: 'Arkadaşlığınızı ilişkinin temeli olarak koruyun; birlikte yeni projeler ve hobiler edinin.'
    },
    {
      name: 'Kare (Doksanlık)', mods: [-2, -3, -2, 6, -3, -3, -3, -3],
      text: 'Burçlarınız birbirine kare açı yapıyor: bu, sürtünme ve meydan okuma demektir. Aranızda güçlü bir çekim ve elektrik vardır ama ihtiyaçlarınız ve yöntemleriniz sık sık çatışabilir. Bu ilişki emek ister; emek verildiğinde ise ikinizi de büyüten bir güce dönüşür.',
      advice: 'Kazanmak yerine anlamaya odaklanın. Tartışmalarda “ben haklıyım” yerine “ne istiyoruz?” sorusunu sorun.'
    },
    {
      name: 'Üçgen (Trigon)', mods: [2, 2, 2, 1, 2, 2, 2, 2],
      text: 'Burçlarınız birbirine üçgen açı yapıyor; astrolojideki en uyumlu ilişkilerden biri! Aynı elementi paylaştığınız için doğal bir akış, anlayış ve rahatlık vardır. Birbirinizi açıklamaya gerek kalmadan anlarsınız.',
      advice: 'Uyumunuz o kadar kolay ki ilişkiyi “otomatik pilota” bırakmayın; birbirinizi şaşırtmaya devam edin.'
    },
    {
      name: 'Yüz elli (Quincunx)', mods: [-2, -2, -1, 1, -2, -2, -1, -2],
      text: 'Burçlarınız arasında “quincunx” denen garip bir açı var: ne element ne de nitelik ortak. Birbirinizi ilginç ve gizemli bulursunuz ama sürekli küçük ayarlamalar yapmanız gerekir. Doğru iletişimle bu ilişki ikinizi de yeni alanlara taşır.',
      advice: 'Varsayımlarda bulunmak yerine sorun. Birbirinizin ihtiyaçlarını açıkça konuşmak bu ilişkinin anahtarıdır.'
    },
    {
      name: 'Karşıt burçlar (Opozisyon)', mods: [3, 0, -1, 8, -2, -3, 0, -2],
      text: 'Zodyak\'ta karşı karşıya duruyorsunuz: zıtlar birbirini çeker! Biriniz diğerinin eksik yarısını temsil eder. Aranızdaki manyetik çekim çok güçlüdür ve birbirinizden çok şey öğrenebilirsiniz. Denge kurulduğunda bu ilişki bir bütünün iki yarısına dönüşür.',
      advice: 'Uçlara savrulmak yerine ortada buluşun. Birbirinizin bakış açısını değiştirmeye değil, tamamlamaya çalışın.'
    }
  ];

  const MODALITY_PAIRS = {
    'Öncü-Öncü': { mods: [0, -2, 0, 2, -2, 0, -3, 0], text: 'İkiniz de öncü burçsunuz: başlatan, yönlendiren taraf olmak istersiniz. Ortak hedefe kilitlendiğinizde durdurulamazsınız; ama kimin lider olacağı konusunda güç mücadelesi yaşayabilirsiniz.' },
    'Sabit-Sabit': { mods: [0, -3, 0, 2, 4, 0, 0, -1], text: 'İkiniz de sabit burçsunuz: kararlı, sadık ve dayanıklı. Bir kez bağlandığınızda ilişki kaya gibi sağlam olur; ancak anlaşmazlıkta ikiniz de geri adım atmakta zorlanırsınız.' },
    'Değişken-Değişken': { mods: [0, 4, 0, 0, -3, 0, -2, 3], text: 'İkiniz de değişken burçsunuz: esnek, uyumlu ve meraklı. Birbirinize kolayca ayak uydurursunuz ama ilişkiye yön verecek kararlılık zaman zaman eksik kalabilir.' },
    'Öncü-Sabit': { mods: [0, 0, 0, 0, 1, 0, 1, 0], text: 'Biriniz başlatır, diğeri sürdürür. Öncü burç ilişkiye hareket ve yön, sabit burç ise süreklilik ve sadakat getirir. Doğru dengelendiğinde güçlü bir takım olursunuz.' },
    'Öncü-Değişken': { mods: [0, 1, 0, 0, 0, 0, 0, 1], text: 'Öncü burç yön belirler, değişken burç uyum sağlar ve yeni olasılıklar ekler. Bu dinamik genellikle akıcıdır; yeter ki değişken taraf kendini sadece takip eden konumunda hissetmesin.' },
    'Sabit-Değişken': { mods: [0, 0, 0, 0, 0, 0, 0, 0], text: 'Sabit burç istikrar, değişken burç esneklik getirir. Biri köklenmek isterken diğeri akmak ister; birbirinize hem güven hem de esneklik öğretebilirsiniz.' }
  };

  const PLANET_NATURE = {
    'Mars': 'cesaret ve eylem', 'Venüs': 'sevgi ve uyum', 'Merkür': 'zihin ve iletişim', 'Ay': 'duygu ve şefkat',
    'Güneş': 'öz benlik ve yaratıcılık', 'Jüpiter': 'genişleme ve iyimserlik', 'Satürn': 'disiplin ve sorumluluk',
    'Uranüs / Satürn': 'özgünlük ve özgürlük', 'Plüton / Mars': 'dönüşüm ve tutku', 'Neptün / Jüpiter': 'hayal ve maneviyat'
  };

  /* Gezegen yerleşimlerinin burçlara göre kısa yorumları */
  const PLACEMENTS = {
    moon: [
      'Duygularını hızlı ve açık yaşarsın; bekletilmek seni sabırsızlaştırır.',
      'Duygusal huzurun için istikrar, konfor ve dokunuşa ihtiyaç duyarsın.',
      'Duygularını konuşarak işlersin; zihinsel bağ seni rahatlatır.',
      'Son derece hassas ve şefkatlisin; yuva ve aidiyet duygusu senin için hayati.',
      'Sevildiğini ve takdir edildiğini hissetmek duygusal olarak seni besler.',
      'Duygularını düzen ve hizmetle ifade edersin; endişelerini paylaşınca hafiflersin.',
      'Duygusal dengen ilişkilerindeki uyuma bağlıdır; çatışma seni yorar.',
      'Duyguların derin ve yoğundur; tam güven duymadan açılmazsın.',
      'Duygusal özgürlüğe ihtiyaç duyarsın; iyimserliğin en büyük gücündür.',
      'Duygularını kontrol altında tutarsın; güvende hissettiğinde çok sadıksın.',
      'Duygularına mantıkla yaklaşırsın; alan ve dostluk sana iyi gelir.',
      'Sezgilerin çok güçlü; başkalarının duygularını kendi duyguların gibi hissedersin.'
    ],
    venus: [
      'Aşkta ilk adımı atan, heyecan ve kovalamacayı seven tarafsın.',
      'Aşkta sadakat, şefkat ve duyusal zevkler senin için en önemlisi.',
      'Zekâ ve sohbetle aşık olursun; flört etmek senin için bir oyun.',
      'Aşkta güven, şefkat ve yuva arayışındasın.',
      'Aşkta romantizm, büyük jestler ve hayranlık beklersin.',
      'Sevgini özenle ve emekle gösterirsin; detaylar senin aşk dilin.',
      'Aşkta zarafet, uyum ve eşit ortaklık ararsın.',
      'Aşkta tutku, derinlik ve tam bağlılık istersin; yarım sevgi sana göre değil.',
      'Aşkta özgürlük, macera ve birlikte büyümek ararsın.',
      'Aşkta ciddi, sadık ve uzun vadeli düşünürsün.',
      'Aşkta önce arkadaşlık ve özgünlük ararsın.',
      'Aşkta romantik, fedakâr ve ruhsal bir bağ ararsın.'
    ],
    mars: [
      'Arzu ve enerjin doğrudan ve ateşli; meydan okumalar seni harekete geçirir.',
      'Sabırlı ama dayanıklı bir tutkun var; istediğinden kolay vazgeçmezsin.',
      'Zihinsel uyarım seni tutuşturur; esprili meydan okumalar sana çekici gelir.',
      'Tutkunu duygularla harmanlarsın; güven duyduğunda çok yoğun olursun.',
      'Tutkun gösterişli ve cömert; takdir edildiğinde alev alırsın.',
      'Enerjini planlı kullanırsın; özen ve incelik seni çeker.',
      'Uyum ve estetik seni harekete geçirir; kaba yaklaşımlardan soğursun.',
      'Arzun derin, yoğun ve manyetik; tam bir bütünleşme ararsın.',
      'Macera ve spontanlık arzunu körükler; rutin seni söndürür.',
      'Kararlı ve sabırlısın; tutkunu zamanla ve kontrollü gösterirsin.',
      'Sıra dışı ve özgür bir tutkun var; beklenmedik olan seni heyecanlandırır.',
      'Tutkunu romantizm ve hayal gücüyle yaşarsın; duygusal bağ şarttır.'
    ],
    mercury: [
      'Hızlı, doğrudan ve açık sözlü konuşursun.',
      'Yavaş ama sağlam düşünür, net ve pratik konuşursun.',
      'Zihnin çok hızlı; konuşmayı, öğrenmeyi ve tartışmayı seversin.',
      'Hafızan güçlü; duygularla düşünür, sezgilerle konuşursun.',
      'Etkileyici ve kendinden emin konuşursun; anlatıcılığın güçlü.',
      'Analitik ve detaycısın; her şeyi mantık süzgecinden geçirirsin.',
      'Diplomatik ve kibar konuşursun; her iki tarafı da görürsün.',
      'Derinlemesine düşünür, az ama öz konuşursun; sırları çözersin.',
      'Büyük resmi görür, felsefi ve dürüst konuşursun.',
      'Ciddi, stratejik ve planlı düşünürsün.',
      'Özgün ve yenilikçi fikirlerin var; kalıpların dışında düşünürsün.',
      'Sezgisel ve imgesel düşünürsün; sözlerin şiirsel olabilir.'
    ],
    asc: [
      'Dışarıdan enerjik, cesur ve doğrudan görünürsün.',
      'Sakin, güven veren ve zarif bir izlenim bırakırsın.',
      'Canlı, meraklı ve konuşkan görünürsün.',
      'Sıcak, korumacı ve hassas bir ilk izlenim verirsin.',
      'Karizmatik ve dikkat çekici bir duruşun var.',
      'Ölçülü, düzenli ve zeki bir izlenim bırakırsın.',
      'Çekici, kibar ve sosyal görünürsün.',
      'Gizemli, yoğun ve manyetik bir havan var.',
      'Neşeli, açık ve maceracı görünürsün.',
      'Ciddi, olgun ve güvenilir bir izlenim verirsin.',
      'Farklı, özgün ve biraz mesafeli görünürsün.',
      'Yumuşak, rüya gibi ve empatik bir havan var.'
    ]
  };

  const PLANET_LABELS = {
    sun: { name: 'Güneş', icon: '☉', desc: 'Öz benliğin, kimliğin ve yaşam enerjin' },
    moon: { name: 'Ay', icon: '☽', desc: 'Duygusal dünyan ve iç ihtiyaçların' },
    asc: { name: 'Yükselen', icon: 'AC', desc: 'Dışa yansıyan yüzün ve ilk izlenimin' },
    venus: { name: 'Venüs', icon: '♀', desc: 'Aşk tarzın ve neyi çekici bulduğun' },
    mars: { name: 'Mars', icon: '♂', desc: 'Tutkun, arzun ve harekete geçme biçimin' },
    mercury: { name: 'Merkür', icon: '☿', desc: 'Düşünme ve iletişim tarzın' }
  };

  global.ZodiacData = { SIGNS, RAW, CATEGORIES, ELEMENT_PAIRS, ASPECTS, MODALITY_PAIRS, PLANET_NATURE, PLACEMENTS, PLANET_LABELS };
  if (typeof module !== 'undefined') module.exports = global.ZodiacData;
})(typeof window !== 'undefined' ? window : globalThis);
