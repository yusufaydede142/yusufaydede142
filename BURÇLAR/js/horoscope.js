/*
 * Kişiye özel günlük / haftalık yorum.
 * O günün gerçek gezegen konumları (transitler) doğum haritasıyla karşılaştırılır.
 */
(function (global) {
  'use strict';
  const A = global.Astro;
  const { SIGNS, PLANET_LABELS } = global.ZodiacData;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Ay'ın geçtiği ev (yükselen biliniyorsa ondan, değilse Güneş burcundan sayılır)
  const HOUSES = [
    { theme: 'Kendine odaklanma', text: 'Ay kendi alanında: duyguların yüzeyde, enerjin yüksek. Kendine zaman ayırmak, imajını yenilemek ve yeni bir şeye başlamak için uygun bir gün.', love: 4, work: 3, mood: 6 },
    { theme: 'Para ve konfor', text: 'Gündemde para, alışveriş ve kendini güvende hissetme isteği var. Bütçeni gözden geçirmek ve küçük keyiflerle kendini şımartmak iyi gelir.', love: 0, work: 4, mood: 2 },
    { theme: 'İletişim', text: 'Telefonlar, mesajlar ve kısa görüşmeler artıyor. Aklındakini söylemek, yazışmak ve yakın çevrenle bağ kurmak için verimli bir gün.', love: 2, work: 3, mood: 3 },
    { theme: 'Ev ve aile', text: 'İçine dönmek, evde vakit geçirmek ve ailenle ilgilenmek isteyebilirsin. Duygusal olarak hassas olabilirsin; kendini yorma.', love: 1, work: -3, mood: -1 },
    { theme: 'Aşk ve eğlence', text: 'Flört, romantizm ve eğlence için iyi bir gün. Sevdiğinle vakit geçirmek ya da yaratıcı bir işle uğraşmak sana iyi gelir.', love: 8, work: 0, mood: 6 },
    { theme: 'Düzen ve sağlık', text: 'Yapılacaklar listesi, iş düzeni ve sağlık ön planda. Ertelediğin işleri bitirmek ve vücuduna iyi bakmak için uygun bir gün.', love: -2, work: 6, mood: 0 },
    { theme: 'İlişkiler', text: 'Ay ilişkiler alanında: partnerin ya da yakın çevrendeki biriyle bağ kurmak, birlikte karar almak ve uzlaşmak ön planda. İlişki konuşmaları için iyi bir zaman.', love: 7, work: 2, mood: 3 },
    { theme: 'Derinlik ve tutku', text: 'Duygular yoğun, sezgiler güçlü. Derin konuşmalar ve tutku öne çıkabilir; kıskançlık ve kontrol isteğine dikkat et.', love: 3, work: 0, mood: -2 },
    { theme: 'Keşif ve öğrenme', text: 'Ufkunu genişletmek, yeni bir şey öğrenmek, seyahat planlamak ya da farklı bir bakış açısı kazanmak için ilham verici bir gün.', love: 2, work: 2, mood: 5 },
    { theme: 'Kariyer ve hedefler', text: 'Gözler senin üzerinde: kariyerin, hedeflerin ve itibarın ön planda. Önemli bir sunum, görüşme ya da iş adımı için güçlü bir gün.', love: -1, work: 8, mood: 2 },
    { theme: 'Arkadaşlar ve sosyal çevre', text: 'Arkadaşlarla buluşmak, gruplara katılmak ve geleceğe dair hayaller kurmak için keyifli bir gün. Sosyal çevrenden güzel haberler gelebilir.', love: 3, work: 1, mood: 6 },
    { theme: 'Dinlenme ve iç gözlem', text: 'Enerjin biraz düşük olabilir; dinlenmek, yalnız kalmak, meditasyon ya da uyku sana iyi gelir. Büyük kararları birkaç gün ertele.', love: -2, work: -3, mood: -3 }
  ];

  const TRANSIT = {
    sun: { name: 'Güneş', area: 'enerji, öz güven ve görünürlük', good: 'Kendini göstermekten çekinme.', hard: 'Ego çatışmalarından uzak dur.', w: { love: 1, work: 3, mood: 3 } },
    moon: { name: 'Ay', area: 'duygular ve ruh hali', good: 'Sezgilerine güvenebilirsin.', hard: 'Ani duygusal tepkiler vermeden önce bir nefes al.', w: { love: 2, work: 0, mood: 3 } },
    mercury: { name: 'Merkür', area: 'iletişim, haberler ve düşünceler', good: 'Konuşmalar, yazışmalar ve anlaşmalar kolay akar.', hard: 'Yanlış anlaşılmalara karşı sözlerini dikkatle seç.', w: { love: 1, work: 3, mood: 1 } },
    venus: { name: 'Venüs', area: 'aşk, uyum ve keyif', good: 'Romantik jestler ve buluşmalar için güzel bir enerji.', hard: 'Aşırı harcama ve ilişkide beklentilere dikkat.', w: { love: 4, work: 1, mood: 2 } },
    mars: { name: 'Mars', area: 'enerji, cesaret ve tutku', good: 'Harekete geçmek ve cesur adımlar atmak için güç sende.', hard: 'Sabırsızlık ve tartışmalara karşı dikkatli ol.', w: { love: 2, work: 2, mood: 1 } }
  };

  const NATAL_AREA = {
    sun: 'öz güvenini ve kişisel hedeflerini', moon: 'duygularını ve ev hayatını', venus: 'aşk hayatını ve ilişkilerini',
    mars: 'motivasyonunu ve tutkunu', mercury: 'düşüncelerini ve konuşmalarını', asc: 'imajını ve ilk izlenimlerini'
  };

  const ASP = [
    { angle: 0, name: 'kavuşum', harm: 0.7, verb: 'kavuşuyor' },
    { angle: 60, name: 'altmışlık', harm: 0.8, verb: 'altmışlık açı yapıyor' },
    { angle: 90, name: 'kare', harm: -1, verb: 'kare açı yapıyor' },
    { angle: 120, name: 'üçgen', harm: 1, verb: 'üçgen açı yapıyor' },
    { angle: 180, name: 'karşıt', harm: -0.7, verb: 'karşıt açı yapıyor' }
  ];
  const ORB = { sun: 3, moon: 5, mercury: 3, venus: 3, mars: 3 };

  function utNoonFor(date) {
    // Kullanıcının yerel öğle saatini UT'ye çevir
    return 12 + date.getTimezoneOffset() / 60;
  }

  function transitsFor(date) {
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    const p = A.positionsAtUT(y, m, d, utNoonFor(date));
    // Merkür geri hareket kontrolü
    const next = A.positionsAtUT(y, m, d, utNoonFor(date) + 24);
    let dm = next.mercury - p.mercury;
    if (dm > 180) dm -= 360; if (dm < -180) dm += 360;
    return { sun: p.sun, moon: p.moon, mercury: p.mercury, venus: p.venus, mars: p.mars, mercuryRetro: dm < 0 };
  }

  function natalPoints(chart) {
    const pts = {};
    ['sun', 'venus', 'mars', 'mercury'].forEach((k) => { pts[k] = chart.planets[k].lon; });
    // Saat bilinmiyorsa Ay'ın derecesi güvenilir değil
    if (chart.timeKnown) { pts.moon = chart.planets.moon.lon; pts.asc = chart.planets.asc.lon; }
    return pts;
  }

  function houseOf(chart, lon) {
    const ref = chart.planets.asc ? chart.planets.asc.sign : chart.planets.sun.sign;
    return (A.signIndex(lon) - ref + 12) % 12;
  }

  function daily(chart, date) {
    const t = transitsFor(date);
    const natal = natalPoints(chart);
    const house = houseOf(chart, t.moon);
    const H = HOUSES[house];
    const scores = { love: 62 + H.love * 2, work: 62 + H.work * 2, mood: 62 + H.mood * 2 };
    const aspects = [];

    Object.keys(TRANSIT).forEach((tk) => {
      Object.keys(natal).forEach((nk) => {
        if (tk === 'moon' && !['sun', 'moon', 'venus', 'asc'].includes(nk)) return;
        let d = Math.abs(t[tk] - natal[nk]) % 360;
        if (d > 180) d = 360 - d;
        const asp = ASP.find((a) => Math.abs(d - a.angle) <= ORB[tk]);
        if (!asp) return;
        const orb = Math.abs(d - asp.angle);
        const strength = 1 - orb / (ORB[tk] + 1);
        const T = TRANSIT[tk];
        const harm = asp.harm;
        Object.keys(T.w).forEach((c) => { scores[c] += T.w[c] * harm * strength * 3; });
        aspects.push({
          strength: Math.abs(harm) * strength * (tk === 'moon' ? 0.7 : 1), harm,
          text: `<b>Gökyüzündeki ${T.name}, doğum haritandaki ${PLANET_LABELS[nk].name} ile ${asp.verb}.</b> ${T.area[0].toLocaleUpperCase('tr') + T.area.slice(1)} konusundaki ${harm > 0 ? 'destekleyici' : 'zorlayıcı'} etkiler ${NATAL_AREA[nk]} etkiliyor. ${harm > 0 ? T.good : T.hard}`
        });
      });
    });
    aspects.sort((a, b) => b.strength - a.strength);

    Object.keys(scores).forEach((k) => { scores[k] = Math.round(clamp(scores[k], 25, 98)); });
    const overall = Math.round((scores.love + scores.work + scores.mood) / 3);

    return {
      date, moonSign: A.signIndex(t.moon), house, houseInfo: H, aspects: aspects.slice(0, 4), scores, overall,
      mercuryRetro: t.mercuryRetro
    };
  }

  function weekly(chart, start) {
    const days = [];
    const events = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      days.push(daily(chart, dt));
      if (i > 0) {
        const prev = transitsFor(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i - 1));
        const cur = transitsFor(dt);
        ['sun', 'mercury', 'venus', 'mars'].forEach((k) => {
          const s1 = A.signIndex(prev[k]), s2 = A.signIndex(cur[k]);
          if (s1 !== s2) events.push({ date: dt, text: `${TRANSIT[k].name}, ${SIGNS[s2].name} burcuna geçiyor: ${TRANSIT[k].area} konularında yeni bir dönem başlıyor.` });
        });
        if (prev.mercuryRetro !== cur.mercuryRetro) {
          events.push({ date: dt, text: cur.mercuryRetro ? 'Merkür geri harekete başlıyor: yazışmalarda, sözleşmelerde ve teknolojide dikkatli ol.' : 'Merkür düz harekete dönüyor: iletişimdeki aksaklıklar azalıyor.' });
        }
      }
    }
    const best = (key) => days.reduce((a, b) => (b.scores[key] > a.scores[key] ? b : a));
    return { days, events, bestLove: best('love'), bestWork: best('work'), bestMood: best('mood') };
  }


  /* ---------- Gökyüzü takvimi ---------- */

  const norm = (x) => ((x % 360) + 360) % 360;
  const PHASES = [
    { max: 10, name: 'Yeni ay' }, { max: 80, name: 'Hilal' }, { max: 100, name: 'İlk dördün' },
    { max: 170, name: 'Şişkin ay' }, { max: 190, name: 'Dolunay' }, { max: 260, name: 'Şişkin ay (küçülen)' },
    { max: 280, name: 'Son dördün' }, { max: 350, name: 'Hilal (küçülen)' }, { max: 361, name: 'Yeni ay' }
  ];

  // Belirli bir yerel tarihin başından itibaren h saat sonrasındaki konumlar
  function posAt(base, h) {
    return A.positionsAtUT(base.getFullYear(), base.getMonth() + 1, base.getDate(), h + base.getTimezoneOffset() / 60);
  }
  const dateAt = (base, h) => new Date(base.getTime() + h * 3600 * 1000);

  function moonPhase(date) {
    const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const p = posAt(base, date.getHours() + date.getMinutes() / 60);
    const elong = norm(p.moon - p.sun);
    const illum = Math.round(((1 - Math.cos(elong * Math.PI / 180)) / 2) * 100);
    return { elong, illum, name: PHASES.find((x) => elong < x.max).name, sign: A.signIndex(p.moon) };
  }

  // f(h) işaret değiştirdiğinde ikiye bölme ile anı bul
  function refine(f, lo, hi) {
    let flo = f(lo);
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2, fm = f(mid);
      if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
    }
    return (lo + hi) / 2;
  }
  const wrap = (x) => { const v = norm(x); return v > 180 ? v - 360 : v; };

  function skyCalendar(chart, start, days) {
    const base = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const events = [];
    const ref = chart.planets.asc ? chart.planets.asc.sign : chart.planets.sun.sign;
    const step = 6; // saat
    let prev = posAt(base, 0);
    let prevMerc = posAt(base, -24).mercury;
    for (let h = step; h <= days * 24; h += step) {
      const cur = posAt(base, h);
      // Yeni ay ve dolunay
      [[0, 'new'], [180, 'full']].forEach(([target, kind]) => {
        const f = (x) => wrap(norm(posAt(base, x).moon - posAt(base, x).sun) - target);
        const a = wrap(norm(prev.moon - prev.sun) - target), b = wrap(norm(cur.moon - cur.sun) - target);
        if (a < 0 && b >= 0) {
          const t = refine(f, h - step, h);
          const p = posAt(base, t);
          const sign = A.signIndex(p.moon);
          const house = (sign - ref + 12) % 12;
          events.push({
            date: dateAt(base, t), kind,
            title: kind === 'new' ? `Yeni ay, ${SIGNS[sign].name} burcunda` : `Dolunay, ${SIGNS[sign].name} burcunda`,
            text: kind === 'new'
              ? `Senin ${house + 1}. evinde: ${HOUSES[house].theme.toLocaleLowerCase('tr')} konusunda yeni bir başlangıç için uygun bir zaman.`
              : `Senin ${house + 1}. evinde: ${HOUSES[house].theme.toLocaleLowerCase('tr')} konusunda bir şeyler netleşebilir ya da tamamlanabilir.`
          });
        }
      });
      // Burç geçişleri
      ['sun', 'mercury', 'venus', 'mars'].forEach((k) => {
        const s1 = A.signIndex(prev[k]), s2 = A.signIndex(cur[k]);
        if (s1 !== s2) {
          const boundary = (s2 === (s1 + 1) % 12 ? s2 : s1) * 30;
          const t = refine((x) => wrap(posAt(base, x)[k] - boundary), h - step, h);
          events.push({ date: dateAt(base, t), kind: 'ingress', title: `${TRANSIT[k].name} ${SIGNS[s2].name} burcuna geçiyor`, text: `${TRANSIT[k].area[0].toLocaleUpperCase('tr') + TRANSIT[k].area.slice(1)} konularında yeni bir dönem.` });
        }
      });
      // Merkür geri / düz
      if (h % 24 === 0) {
        const d1 = wrap(prev.mercury - prevMerc), d2 = wrap(cur.mercury - prev.mercury);
        if ((d1 >= 0) !== (d2 >= 0)) {
          // Hızın işaret değiştirdiği anı bul
          const speed = (x) => wrap(posAt(base, x + 1).mercury - posAt(base, x).mercury);
          const t = refine(speed, h - 48, h);
          events.push(d2 < 0
            ? { date: dateAt(base, t), kind: 'retro', title: 'Merkür geri harekete başlıyor', text: 'Yaklaşık üç hafta boyunca yazışmalarda, imzalarda ve teknolojide dikkatli ol.' }
            : { date: dateAt(base, t), kind: 'retro', title: 'Merkür düz harekete dönüyor', text: 'İletişimdeki aksaklıklar azalmaya başlar.' });
        }
        prevMerc = prev.mercury;
        prev = cur;
      } else {
        prev = cur;
      }
    }
    return events.sort((a, b) => a.date - b.date);
  }

  global.Horoscope = { daily, weekly, HOUSES, moonPhase, skyCalendar };
})(typeof window !== 'undefined' ? window : globalThis);
