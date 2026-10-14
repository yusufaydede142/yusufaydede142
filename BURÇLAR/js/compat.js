/* Uyum hesaplama motoru: doğum haritasını kullanarak 12 burcu kişiye özel sıralar */
(function (global) {
  'use strict';
  const D = global.ZodiacData || (typeof require !== 'undefined' ? require('./data.js') : null);
  const { SIGNS, RAW, CATEGORIES, ELEMENT_PAIRS, ASPECTS, MODALITY_PAIRS, SYN_PAIRS, SYN_ASPECTS, PLANET_LABELS } = D;

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const ELEMENT_ORDER = ['Ateş', 'Toprak', 'Hava', 'Su'];
  const MODALITY_ORDER = ['Öncü', 'Sabit', 'Değişken'];

  function pairKey(a, b, order) {
    return order.indexOf(a) <= order.indexOf(b) ? a + '-' + b : b + '-' + a;
  }

  function aspectDistance(a, b) {
    const d = Math.abs(a - b) % 12;
    return Math.min(d, 12 - d);
  }

  // Belirsiz gezegen (saat bilinmiyorsa) için olası burçların ortalama uyumu
  function rawFor(planet, S) {
    if (!planet) return null;
    if (planet.options) return planet.options.reduce((s, o) => s + RAW[o][S], 0) / planet.options.length;
    return RAW[planet.sign][S];
  }

  function levelOf(score) {
    if (score >= 90) return { label: 'Ruh Eşi Uyumu', cls: 'lvl-6' };
    if (score >= 80) return { label: 'Çok Yüksek Uyum', cls: 'lvl-5' };
    if (score >= 70) return { label: 'Yüksek Uyum', cls: 'lvl-4' };
    if (score >= 60) return { label: 'Orta Uyum', cls: 'lvl-3' };
    if (score >= 50) return { label: 'Emek İsteyen Uyum', cls: 'lvl-2' };
    return { label: 'Zorlayıcı Uyum', cls: 'lvl-1' };
  }

  /**
   * Sadece iki güneş burcu arasındaki genel (kişisel olmayan) uyum
   */
  function signPair(U, S) {
    const a = SIGNS[U], b = SIGNS[S];
    const elem = ELEMENT_PAIRS[pairKey(a.element, b.element, ELEMENT_ORDER)];
    const dist = aspectDistance(U, S);
    const aspect = ASPECTS[dist];
    const mod = MODALITY_PAIRS[pairKey(a.modality, b.modality, MODALITY_ORDER)];
    return { base: RAW[U][S], elem, aspect, dist, mod };
  }

  /**
   * chart: Astro.computeChart çıktısı
   * userGender: 'kadin' | 'erkek', partnerGender: 'kadin' | 'erkek'
   */
  function analyze(chart, userGender, partnerGender) {
    const P = chart.planets;
    const withOptions = (key) => {
      const p = P[key];
      if (!p) return null;
      if (chart.uncertain && chart.uncertain[key]) return { sign: p.sign, options: chart.uncertain[key] };
      return p;
    };
    const sun = withOptions('sun');
    const moon = withOptions('moon');
    const venus = withOptions('venus');
    const mars = withOptions('mars');
    const mercury = withOptions('mercury');
    const asc = P.asc || null;
    const U = sun.sign;

    // Partner cinsiyetine göre çekim gezegeni: erkeğe çekimi Mars, kadına çekimi Venüs anlatır (geleneksel yorum)
    const attractKey = partnerGender === 'erkek' ? 'mars' : 'venus';
    const attract = attractKey === 'mars' ? mars : venus;
    const otherLove = attractKey === 'mars' ? venus : mars;
    const attractName = attractKey === 'mars' ? 'Mars' : 'Venüs';
    const otherName = attractKey === 'mars' ? 'Venüs' : 'Mars';
    const descendant = asc ? (asc.sign + 6) % 12 : null;

    const results = SIGNS.map((sign, S) => {
      const pair = signPair(U, S);
      const reasons = [];

      const moonRaw = rawFor(moon, S);
      const attractRaw = rawFor(attract, S);
      const otherRaw = rawFor(otherLove, S);
      const mercRaw = rawFor(mercury, S);
      const ascRaw = asc ? RAW[asc.sign][S] : null;

      let score;
      if (asc) score = 0.50 * pair.base + 0.15 * moonRaw + 0.15 * attractRaw + 0.08 * otherRaw + 0.12 * ascRaw;
      else score = 0.58 * pair.base + 0.15 * moonRaw + 0.17 * attractRaw + 0.10 * otherRaw;

      // Kişisel bonuslar
      if (descendant === S) {
        score += 5;
        reasons.push({ type: 'plus', text: `Alçalan burcun (7. ev – evlilik ve ortaklık evi) ${sign.name}. Bu burç senin için doğal “eş” enerjisini temsil eder.` });
      }
      if (!attract.options && attract.sign === S) {
        score += 4;
        reasons.push({ type: 'plus', text: `${attractName} gezegenin ${sign.name} burcunda: ${partnerGender === 'erkek' ? 'erkeklerde' : 'kadınlarda'} çekici bulduğun özellikler bu burcun özellikleriyle örtüşüyor.` });
      } else if (SIGNS[attract.sign].element === sign.element && !attract.options) {
        score += 2;
        reasons.push({ type: 'plus', text: `${attractName} gezegenin ${SIGNS[attract.sign].name} burcunda; ${sign.name} ile aynı element (${sign.element}) olduğu için bu burca doğal bir çekim duyarsın.` });
      }
      if (!moon.options && moon.sign === S) {
        score += 2;
        reasons.push({ type: 'plus', text: `Ay burcun da ${sign.name}: bu burçtan biriyle duygusal olarak kendini “evde” hissedersin.` });
      }
      if (moonRaw >= 85) reasons.push({ type: 'plus', text: `Ay burcun (${SIGNS[moon.sign].name}) ile ${sign.name} arasında güçlü duygusal uyum var.` });
      else if (moonRaw <= 50) reasons.push({ type: 'minus', text: `Ay burcun (${SIGNS[moon.sign].name}) ile ${sign.name} arasındaki duygusal ihtiyaçlar farklı; sabır gerekebilir.` });
      if (attractRaw >= 85 && attract.sign !== S) reasons.push({ type: 'plus', text: `${attractName} burcun (${SIGNS[attract.sign].name}) bu burçla güçlü bir çekim yaratıyor.` });
      else if (attractRaw <= 50) reasons.push({ type: 'minus', text: `${attractName} burcun (${SIGNS[attract.sign].name}) ile bu burcun aşk dili farklı işliyor.` });
      if (asc) {
        if (ascRaw >= 85) reasons.push({ type: 'plus', text: `Yükselen burcun (${SIGNS[asc.sign].name}) bu burçla çok uyumlu; ilk izlenimde birbirinizi seversiniz.` });
        else if (ascRaw <= 50) reasons.push({ type: 'minus', text: `Yükselen burcun (${SIGNS[asc.sign].name}) bu burçla zıt bir tarzda; ilk izlenimler yanıltıcı olabilir.` });
      }
      if (mercRaw >= 88) reasons.push({ type: 'plus', text: `Merkür'ün (${SIGNS[mercury.sign].name}) sayesinde bu burçla iletişimin çok akıcı.` });

      score = Math.round(clamp(score, 20, 99));

      // Kategoriler: genel uyum + kişisel gezegen düzeltmeleri
      const cats = {};
      CATEGORIES.forEach((c, i) => {
        let v = score + pair.elem.mods[i] + pair.aspect.mods[i] + pair.mod.mods[i];
        if (c.key === 'duygu') v += (moonRaw - score) * 0.2;
        if (c.key === 'tutku') v += (rawFor(mars, S) - score) * 0.2;
        if (c.key === 'ask') v += (rawFor(venus, S) - score) * 0.2;
        if (c.key === 'iletisim') v += (mercRaw - score) * 0.2;
        if (c.key === 'evlilik' && descendant === S) v += 4;
        cats[c.key] = Math.round(clamp(v, 15, 98));
      });

      const friendship = Math.round(clamp(0.6 * cats.arkadas + 0.2 * mercRaw + 0.2 * moonRaw, 15, 99));

      return {
        sign: S, score, level: levelOf(score), base: pair.base,
        categories: cats, friendship, reasons,
        elementText: pair.elem, aspect: pair.aspect, aspectDist: pair.dist, modality: pair.mod
      };
    });

    const ranking = results.slice().sort((a, b) => b.score - a.score || b.base - a.base);
    const friendRanking = results.slice().sort((a, b) => b.friendship - a.friendship || b.base - a.base);
    return { results, ranking, friendRanking, attractName, otherName, descendant };
  }

  // Doğum haritasındaki element ve nitelik dağılımı
  function balance(chart) {
    const weights = { sun: 3, moon: 3, asc: 3, venus: 2, mars: 2, mercury: 2 };
    const el = { 'Ateş': 0, 'Toprak': 0, 'Hava': 0, 'Su': 0 };
    const mo = { 'Öncü': 0, 'Sabit': 0, 'Değişken': 0 };
    let total = 0;
    Object.keys(weights).forEach((k) => {
      const p = chart.planets[k];
      if (!p) return;
      el[SIGNS[p.sign].element] += weights[k];
      mo[SIGNS[p.sign].modality] += weights[k];
      total += weights[k];
    });
    const pct = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round((v / total) * 100)]));
    return { elements: pct(el), modalities: pct(mo) };
  }


  /**
   * İki kişinin doğum haritasını karşılaştırır (sinastri).
   * A = kullanıcı, B = partner
   */
  function synastry(A, B) {
    const PA = A.planets, PB = B.planets;
    // Saat bilinmiyorsa Ay'ın derecesi ±6° oynayabilir; derece açılarında Ay'ı kullanma
    const degreeOk = (chart, key) => chart.timeKnown || (key !== 'moon' && key !== 'asc');

    const catSum = {}, catW = {};
    CATEGORIES.forEach((c) => { catSum[c.key] = 0; catW[c.key] = 0; });
    const addCat = (keys, val, w) => keys.forEach((k) => { catSum[k] += val * w; catW[k] += w; });

    const signRows = [];
    const aspects = [];
    let total = 0, totalW = 0, aspectEffect = 0;

    const checkPair = (pair, x, y, who) => {
      const px = (who === 'AB' ? PA : PB)[x];
      const py = (who === 'AB' ? PB : PA)[y];
      if (!px || !py) return;
      const raw = RAW[px.sign][py.sign];
      total += raw * pair.weight; totalW += pair.weight;
      addCat(pair.cats, raw, pair.weight);
      const cx = who === 'AB' ? A : B, cy = who === 'AB' ? B : A;
      if (!degreeOk(cx, x) || !degreeOk(cy, y)) return;
      let d = Math.abs(px.lon - py.lon) % 360;
      if (d > 180) d = 360 - d;
      const asp = SYN_ASPECTS.find((s) => Math.abs(d - s.angle) <= s.orb);
      if (!asp) return;
      const orb = Math.abs(d - asp.angle);
      const strength = 1 - orb / (asp.orb + 1); // tam açıya yakınlık
      const eff = asp.effect * pair.weight * strength;
      aspectEffect += eff;
      pair.cats.forEach((k) => { catSum[k] += eff * 2.5 + (k === 'tutku' ? asp.tutku * 2 : 0); });
      aspects.push({ x, y, who, aspect: asp, orb, pair, effect: eff });
    };

    SYN_PAIRS.forEach((pair) => {
      checkPair(pair, pair.a, pair.b, 'AB');
      if (pair.both) checkPair(pair, pair.a, pair.b, 'BA');
    });

    // Gezegen karşılaştırma tablosu
    ['sun', 'moon', 'asc', 'mercury', 'venus', 'mars'].forEach((k) => {
      if (PA[k] && PB[k]) signRows.push({ key: k, a: PA[k].sign, b: PB[k].sign, raw: RAW[PA[k].sign][PB[k].sign] });
      else signRows.push({ key: k, a: PA[k] ? PA[k].sign : null, b: PB[k] ? PB[k].sign : null, raw: null });
    });

    // 7. ev (alçalan) bağlantıları
    const notes = [];
    let houseBonus = 0;
    const descLink = (from, to, toOwner, fromOwner) => {
      if (!from.planets.asc) return;
      const desc = (from.planets.asc.sign + 6) % 12;
      ['sun', 'venus', 'moon'].forEach((k) => {
        if (to.planets[k].sign === desc) {
          houseBonus += k === 'moon' ? 2 : 3;
          notes.push(`${toOwner} ${PLANET_LABELS[k].name}, ${fromOwner} 7. evine (evlilik ve ortaklık evi) düşüyor; ${fromOwner === 'senin' ? 'senin için' : 'onun için'} “aranan eş” enerjisini taşıyor.`);
        }
      });
    };
    descLink(A, B, 'Onun', 'senin');
    descLink(B, A, 'Senin', 'onun');

    const base = total / totalW;
    const score = Math.round(clamp(base + clamp(aspectEffect, -12, 14) + houseBonus, 20, 99));

    const cats = {};
    CATEGORIES.forEach((c) => {
      let v = catW[c.key] ? catSum[c.key] / catW[c.key] : base;
      v = v + (score - base) * 0.4;
      if (c.key === 'evlilik') v += houseBonus;
      cats[c.key] = Math.round(clamp(v, 15, 98));
    });

    aspects.sort((p, q) => Math.abs(q.effect) - Math.abs(p.effect));
    const sunPair = signPair(PA.sun.sign, PB.sun.sign);
    return { score, level: levelOf(score), categories: cats, signRows, aspects, notes, sunPair };
  }

  global.Compat = { synastry, analyze, signPair, balance, levelOf, aspectDistance };
  if (typeof module !== 'undefined') module.exports = global.Compat;
})(typeof window !== 'undefined' ? window : globalThis);
