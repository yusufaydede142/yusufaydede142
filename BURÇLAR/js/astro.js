/*
 * Astroloji hesaplama motoru
 * Güneş, Ay, Merkür, Venüs, Mars konumları ve Yükselen burç hesaplanır.
 * Formüller: Jean Meeus "Astronomical Algorithms" (düşük hassasiyet) ve
 * NASA/JPL yaklaşık Kepler elemanları (1800–2050). Hassasiyet burç tespiti için yeterlidir (~1°).
 */
(function (global) {
  'use strict';

  const DEG = Math.PI / 180;
  const norm = (x) => ((x % 360) + 360) % 360;
  const sin = (d) => Math.sin(d * DEG);
  const cos = (d) => Math.cos(d * DEG);

  /* ---------- Zaman ---------- */

  function julianDay(y, m, d, hourUT) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + hourUT / 24 + B - 1524.5;
  }

  // Ayın n. pazarı (n = -1 → son pazar)
  function nthSunday(year, month, n) {
    if (n > 0) {
      const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
      return 1 + ((7 - first) % 7) + (n - 1) * 7;
    }
    const lastDate = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const lastDow = new Date(Date.UTC(year, month - 1, lastDate)).getUTCDay();
    return lastDate - lastDow;
  }

  // Yaz saati kuralları; tarih yerel saattir. Dönüş: eklenecek saat (0 veya 1)
  function dstOffset(rule, y, m, d, hour) {
    const key = m * 10000 + d * 100 + hour; // karşılaştırma anahtarı
    const k = (mm, dd, hh) => mm * 10000 + dd * 100 + hh;
    if (rule === 'EU') {
      const start = k(3, nthSunday(y, 3, -1), 2);
      const end = k(10, nthSunday(y, 10, -1), 3);
      return key >= start && key < end ? 1 : 0;
    }
    if (rule === 'US') {
      let start, end;
      if (y >= 2007) { start = k(3, nthSunday(y, 3, 2), 2); end = k(11, nthSunday(y, 11, 1), 2); }
      else { start = k(4, nthSunday(y, 4, 1), 2); end = k(10, nthSunday(y, 10, -1), 2); }
      return key >= start && key < end ? 1 : 0;
    }
    if (rule === 'AU') { // Güney yarımküre: Ekim başı → Nisan başı
      const start = k(10, nthSunday(y, 10, 1), 2);
      const end = k(4, nthSunday(y, 4, 1), 3);
      return key >= start || key < end ? 1 : 0;
    }
    return 0;
  }

  // Türkiye saat dilimi geçmişi (sadeleştirilmiş)
  function turkeyOffset(y, m, d, hour) {
    // 7 Eylül 2016'dan itibaren kalıcı UTC+3
    if (y > 2016 || (y === 2016 && (m > 9 || (m === 9 && d >= 7)))) return 3;
    return 2 + dstOffset('EU', y, m, d, hour);
  }

  function utcOffsetFor(place, y, m, d, hour) {
    if (place.tz === 'TR') return turkeyOffset(y, m, d, hour);
    return place.tz + dstOffset(place.dst || 'NONE', y, m, d, hour);
  }

  /* ---------- Güneş ---------- */

  function sunLongitude(T) {
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M)
      + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
    const omega = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * sin(omega));
  }

  /* ---------- Ay ---------- */

  function moonLongitude(T) {
    const Lp = 218.3164477 + 481267.88123421 * T;
    const D = 297.8501921 + 445267.1114034 * T;
    const M = 357.5291092 + 35999.0502909 * T;
    const Mp = 134.9633964 + 477198.8675055 * T;
    const F = 93.2720950 + 483202.0175233 * T;
    const lon = Lp
      + 6.289 * sin(Mp)
      + 1.274 * sin(2 * D - Mp)
      + 0.658 * sin(2 * D)
      + 0.214 * sin(2 * Mp)
      - 0.186 * sin(M)
      - 0.114 * sin(2 * F)
      + 0.059 * sin(2 * D - 2 * Mp)
      + 0.057 * sin(2 * D - M - Mp)
      + 0.053 * sin(2 * D + Mp)
      + 0.046 * sin(2 * D - M)
      + 0.041 * sin(Mp - M)
      - 0.035 * sin(D)
      - 0.030 * sin(Mp + M)
      - 0.015 * sin(2 * F - 2 * D)
      + 0.011 * sin(Mp - 4 * D);
    return norm(lon);
  }

  /* ---------- Gezegenler (JPL yaklaşık Kepler elemanları) ---------- */
  // [a, a', e, e', I, I', L, L', varpi, varpi', Omega, Omega']
  const ELEMENTS = {
    mercury: [0.38709927, 0.00000037, 0.20563593, 0.00001906, 7.00497902, -0.00594749, 252.25032350, 149472.67411175, 77.45779628, 0.16047689, 48.33076593, -0.12534081],
    venus: [0.72333566, 0.00000390, 0.00677672, -0.00004107, 3.39467605, -0.00078890, 181.97909950, 58517.81538729, 131.60246718, 0.00268329, 76.67984255, -0.27769418],
    earth: [1.00000261, 0.00000562, 0.01671123, -0.00004392, -0.00001531, -0.01294668, 100.46457166, 35999.37244981, 102.93768193, 0.32327364, 0, 0],
    mars: [1.52371034, 0.00001847, 0.09339410, 0.00007882, 1.84969142, -0.00813131, -4.55343205, 19140.30268499, -23.94362959, 0.44441088, 49.55953891, -0.29257343]
  };

  function helio(name, T) {
    const el = ELEMENTS[name];
    const a = el[0] + el[1] * T;
    const e = el[2] + el[3] * T;
    const I = el[4] + el[5] * T;
    const L = el[6] + el[7] * T;
    const varpi = el[8] + el[9] * T;
    const Om = el[10] + el[11] * T;
    const w = varpi - Om;
    let M = norm(L - varpi);
    if (M > 180) M -= 360;
    // Kepler denklemi
    const eDeg = e / DEG;
    let E = M + eDeg * sin(M);
    for (let i = 0; i < 12; i++) {
      const dM = M - (E - eDeg * sin(E));
      const dE = dM / (1 - e * cos(E));
      E += dE;
      if (Math.abs(dE) < 1e-7) break;
    }
    const xp = a * (cos(E) - e);
    const yp = a * Math.sqrt(1 - e * e) * sin(E);
    const x = (cos(w) * cos(Om) - sin(w) * sin(Om) * cos(I)) * xp + (-sin(w) * cos(Om) - cos(w) * sin(Om) * cos(I)) * yp;
    const y = (cos(w) * sin(Om) + sin(w) * cos(Om) * cos(I)) * xp + (-sin(w) * sin(Om) + cos(w) * cos(Om) * cos(I)) * yp;
    const z = (sin(w) * sin(I)) * xp + (cos(w) * sin(I)) * yp;
    return [x, y, z];
  }

  function planetLongitude(name, T) {
    const p = helio(name, T);
    const e = helio('earth', T);
    const lon = Math.atan2(p[1] - e[1], p[0] - e[0]) / DEG;
    // J2000 ekvinoksundan tarih ekvinoksuna presesyon
    return norm(lon + 1.3970 * T);
  }

  /* ---------- Yükselen ---------- */

  function ascendant(JD, T, latDeg, lonDeg) {
    const gmst = norm(280.46061837 + 360.98564736629 * (JD - 2451545) + 0.000387933 * T * T - (T * T * T) / 38710000);
    const ramc = norm(gmst + lonDeg);
    const eps = 23.439291 - 0.0130042 * T;
    const asc = Math.atan2(cos(ramc), -(sin(ramc) * cos(eps) + Math.tan(latDeg * DEG) * sin(eps))) / DEG;
    const mc = Math.atan2(sin(ramc), cos(ramc) * cos(eps)) / DEG;
    return { asc: norm(asc), mc: norm(mc) };
  }

  /* ---------- Ana fonksiyon ---------- */

  function signIndex(lon) { return Math.floor(norm(lon) / 30); }

  function positionsAtUT(y, m, d, hourUT) {
    const JD = julianDay(y, m, d, hourUT);
    const T = (JD - 2451545.0) / 36525;
    return {
      JD, T,
      sun: sunLongitude(T),
      moon: moonLongitude(T),
      mercury: planetLongitude('mercury', T),
      venus: planetLongitude('venus', T),
      mars: planetLongitude('mars', T)
    };
  }

  /**
   * opts: { year, month, day, hour, minute, timeKnown, place:{lat, lon, tz, dst}, manualOffset }
   */
  function computeChart(opts) {
    const { year, month, day, place } = opts;
    const timeKnown = !!opts.timeKnown;
    const hour = timeKnown ? opts.hour : 12;
    const minute = timeKnown ? opts.minute : 0;
    const offset = (opts.manualOffset !== null && opts.manualOffset !== undefined && opts.manualOffset !== '')
      ? Number(opts.manualOffset)
      : utcOffsetFor(place, year, month, day, hour);
    const hourUT = hour + minute / 60 - offset;

    const p = positionsAtUT(year, month, day, hourUT);
    const chart = {
      utcOffset: offset,
      timeKnown,
      planets: {
        sun: { lon: p.sun, sign: signIndex(p.sun) },
        moon: { lon: p.moon, sign: signIndex(p.moon) },
        mercury: { lon: p.mercury, sign: signIndex(p.mercury) },
        venus: { lon: p.venus, sign: signIndex(p.venus) },
        mars: { lon: p.mars, sign: signIndex(p.mars) }
      },
      uncertain: {}
    };

    if (timeKnown) {
      const a = ascendant(p.JD, p.T, place.lat, place.lon);
      chart.planets.asc = { lon: a.asc, sign: signIndex(a.asc) };
      chart.planets.mc = { lon: a.mc, sign: signIndex(a.mc) };
    } else {
      // Saat bilinmiyorsa gün içinde burç değiştiren gezegenleri işaretle
      const start = positionsAtUT(year, month, day, 0 - offset);
      const end = positionsAtUT(year, month, day, 23.99 - offset);
      ['sun', 'moon', 'mercury', 'venus', 'mars'].forEach((k) => {
        const s1 = signIndex(start[k]);
        const s2 = signIndex(end[k]);
        if (s1 !== s2) chart.uncertain[k] = [s1, s2];
      });
    }

    // Kuspe (burç sınırı) uyarısı – Güneş sınıra 1°'den yakınsa
    const sunDeg = p.sun % 30;
    if (sunDeg < 1) chart.cusp = { other: (signIndex(p.sun) + 11) % 12 };
    else if (sunDeg > 29) chart.cusp = { other: (signIndex(p.sun) + 1) % 12 };

    return chart;
  }

  function formatDegree(lon) {
    const inSign = norm(lon) % 30;
    const deg = Math.floor(inSign);
    const min = Math.floor((inSign - deg) * 60);
    return deg + '°' + String(min).padStart(2, '0') + "'";
  }

  global.Astro = { computeChart, signIndex, formatDegree, julianDay, positionsAtUT, utcOffsetFor };
  if (typeof module !== 'undefined') module.exports = global.Astro;
})(typeof window !== 'undefined' ? window : globalThis);
