/* Arayüz: form, sonuç sekmeleri ve raporlar */
(function () {
  'use strict';
  const { SIGNS, CATEGORIES, PLACEMENTS, PLANET_LABELS } = window.ZodiacData;
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'burc-uyum-son-giris';
  const PARTNER_KEY = 'burc-uyum-partner';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const genderWord = (g) => (g === 'erkek' ? 'erkeği' : 'kadını');
  const plural = (g) => (g === 'erkek' ? 'erkek' : 'kadın');
  const cap = (s) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
  const levelShort = (score) => (score >= 90 ? 'Çok güçlü' : score >= 80 ? 'Çok iyi' : score >= 70 ? 'İyi' : score >= 60 ? 'Orta' : score >= 50 ? 'Emek ister' : 'Zor');

  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const fmtDay = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${DAYS[d.getDay()]}`;
  const todayLocal = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const todayISO = () => { const t = todayLocal(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };

  const store = {
    get(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* depolama yok */ } }
  };

  /* ---------- Yer seçimi ---------- */

  function buildPlaceOptions(sel) {
    const og1 = document.createElement('optgroup');
    og1.label = 'Türkiye';
    window.Cities.turkey.forEach((c, i) => og1.appendChild(new Option(c.name, 'tr:' + i)));
    const og2 = document.createElement('optgroup');
    og2.label = 'Yurtdışı';
    window.Cities.world.forEach((c, i) => og2.appendChild(new Option(`${c.name} (${c.country})`, 'w:' + i)));
    const og3 = document.createElement('optgroup');
    og3.label = 'Diğer';
    og3.appendChild(new Option('Listede yok, koordinat gireceğim', 'custom'));
    sel.append(new Option('Şehir seç', ''), og1, og2, og3);
  }

  // prefix '' → ana form, 'p' → partner formu
  function placeIds(prefix) {
    return prefix
      ? { sel: 'pBirthPlace', lat: 'pCustomLat', lon: 'pCustomLon', tz: 'pCustomTz', box: 'pCustomPlace' }
      : { sel: 'birthPlace', lat: 'customLat', lon: 'customLon', tz: 'customTz', box: 'customPlace' };
  }

  function getPlace(prefix) {
    const id = placeIds(prefix);
    const v = $(id.sel).value;
    if (v.startsWith('tr:')) return window.Cities.turkey[+v.slice(3)];
    if (v.startsWith('w:')) return window.Cities.world[+v.slice(2)];
    if (v === 'custom') {
      const lat = parseFloat($(id.lat).value), lon = parseFloat($(id.lon).value), tz = parseFloat($(id.tz).value);
      if ([lat, lon, tz].some(Number.isNaN) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
      return { name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, lat, lon, tz, dst: 'NONE' };
    }
    return null;
  }

  // Ortak tarih/saat/yer okuma. Hata varsa { error } döner.
  function readBirth(prefix) {
    const ids = prefix
      ? { date: 'pBirthDate', time: 'pBirthTime', unknown: 'pTimeUnknown' }
      : { date: 'birthDate', time: 'birthTime', unknown: 'timeUnknown' };
    const dateStr = $(ids.date).value;
    if (!dateStr) return { error: 'Doğum tarihini gir.' };
    if (dateStr < '1900-01-01' || dateStr > todayISO()) return { error: '1900 ile bugün arasında bir tarih gir.' };
    const [year, month, day] = dateStr.split('-').map(Number);
    const timeKnown = !$(ids.unknown).checked;
    let hour = 12, minute = 0;
    if (timeKnown) {
      if (!$(ids.time).value) return { error: 'Doğum saatini gir ya da “Bilmiyorum”u işaretle.' };
      [hour, minute] = $(ids.time).value.split(':').map(Number);
    }
    const place = getPlace(prefix);
    if (!place) return { error: $(placeIds(prefix).sel).value === 'custom' ? 'Enlem, boylam ve UTC farkını kontrol et.' : 'Doğum yerini seç.' };
    return { year, month, day, hour, minute, timeKnown, place };
  }

  /* ---------- Ana form ---------- */

  function setupForm() {
    buildPlaceOptions($('birthPlace'));
    const off = $('manualOffset');
    off.appendChild(new Option('Otomatik', ''));
    for (let h = -12; h <= 14; h += 0.5) {
      if (h % 1 !== 0 && ![-3.5, 3.5, 4.5, 5.5, 9.5].includes(h)) continue;
      off.appendChild(new Option('UTC' + (h >= 0 ? '+' : '') + h, String(h)));
    }
    $('birthDate').max = todayISO();
    $('timeUnknown').addEventListener('change', (e) => { $('birthTime').disabled = e.target.checked; });
    $('birthPlace').addEventListener('change', (e) => { $('customPlace').classList.toggle('hidden', e.target.value !== 'custom'); });
    document.querySelectorAll('input[name="gender"]').forEach((r) => r.addEventListener('change', () => {
      const g = document.querySelector('input[name="gender"]:checked').value;
      document.querySelector(`input[name="partner"][value="${g === 'kadin' ? 'erkek' : 'kadin'}"]`).checked = true;
    }));

    $('birthForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const b = readBirth('');
      $('formError').textContent = b.error || '';
      if (b.error) return;
      const input = Object.assign(b, {
        name: $('name').value.trim(),
        gender: document.querySelector('input[name="gender"]:checked').value,
        partner: document.querySelector('input[name="partner"]:checked').value,
        manualOffset: $('manualOffset').value
      });
      store.set(STORAGE_KEY, {
        name: input.name, gender: input.gender, partner: input.partner,
        date: $('birthDate').value, time: $('birthTime').value, unknown: !input.timeKnown,
        place: $('birthPlace').value, lat: $('customLat').value, lon: $('customLon').value, tz: $('customTz').value,
        offset: $('manualOffset').value
      });
      run(input);
    });

    const s = store.get(STORAGE_KEY);
    if (!s) return;
    $('name').value = s.name || '';
    const g = document.querySelector(`input[name="gender"][value="${s.gender}"]`); if (g) g.checked = true;
    const p = document.querySelector(`input[name="partner"][value="${s.partner}"]`); if (p) p.checked = true;
    $('birthDate').value = s.date || '';
    $('birthTime').value = s.time || '12:00';
    $('timeUnknown').checked = !!s.unknown; $('birthTime').disabled = !!s.unknown;
    $('birthPlace').value = s.place || '';
    $('customPlace').classList.toggle('hidden', s.place !== 'custom');
    $('customLat').value = s.lat || ''; $('customLon').value = s.lon || ''; $('customTz').value = s.tz || '';
    $('manualOffset').value = s.offset || '';
  }

  /* ---------- Sonuç ekranı ---------- */

  const TABS = [
    { key: 'uyum', label: 'Uyum' },
    { key: 'harita', label: 'Haritan' },
    { key: 'gunluk', label: 'Günlük' },
    { key: 'partner', label: 'Biriyle karşılaştır' },
    { key: 'unlu', label: 'Ünlüler' }
  ];

  function run(input) {
    const chart = window.Astro.computeChart(input);
    const analysis = window.Compat.analyze(chart, input.gender, input.partner);
    const ctx = { input, chart, analysis };
    const out = $('results');
    out.innerHTML = renderSummary(ctx) +
      `<nav class="tabs" role="tablist">${TABS.map((t, i) => `<button class="tab" type="button" role="tab" data-tab="${t.key}" aria-selected="${i === 0}">${t.label}</button>`).join('')}</nav>` +
      `<div class="tab-panel" data-panel="uyum">${renderMatches(ctx)}</div>` +
      `<div class="tab-panel hidden" data-panel="harita">${renderChart(ctx)}</div>` +
      `<div class="tab-panel hidden" data-panel="gunluk">${renderDailyShell()}</div>` +
      `<div class="tab-panel hidden" data-panel="partner">${renderPartnerForm(input)}</div>` +
      `<div class="tab-panel hidden" data-panel="unlu">${renderCelebShell(input)}</div>`;
    $('formCard').classList.add('hidden');
    out.classList.remove('hidden');

    $('editBtn').addEventListener('click', () => {
      out.classList.add('hidden');
      $('formCard').classList.remove('hidden');
      $('formCard').scrollIntoView({ behavior: 'smooth' });
    });
    out.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => {
      out.querySelectorAll('.tab').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      out.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== t.dataset.tab));
    }));
    bindMatches(ctx);
    bindDaily(ctx);
    bindPartner(ctx);
    bindCelebs(ctx);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function signLabel(chart, key) {
    const u = chart.uncertain[key];
    return u ? `${SIGNS[u[0]].name} ya da ${SIGNS[u[1]].name}` : SIGNS[chart.planets[key].sign].name;
  }

  function renderSummary({ input, chart }) {
    const sun = SIGNS[chart.planets.sun.sign];
    const date = `${input.day} ${MONTHS[input.month - 1]} ${input.year}`;
    const time = input.timeKnown ? `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}` : 'saat bilinmiyor';
    const parts = [`Ay ${signLabel(chart, 'moon')}`];
    if (chart.planets.asc) parts.push(`Yükselen ${SIGNS[chart.planets.asc.sign].name}`);
    let notes = '';
    if (chart.cusp) notes += `<p class="note">Güneş burç sınırına çok yakın; ${SIGNS[chart.cusp.other].name} özellikleri de sende görülebilir.</p>`;
    if (!input.timeKnown) notes += '<p class="note">Doğum saati olmadan yükselen burç hesaplanamaz. Sonuçlar öğle saatine göre hesaplandı.</p>';
    return `<div class="summary">
      <h1><span class="glyph">${sun.symbol}</span>${input.name ? esc(input.name) + ', ' : ''}${sun.name} ${genderWord(input.gender)}sin</h1>
      <p class="muted">${parts.join(' · ')}<br>${date}, ${time}, ${esc(input.place.name)}</p>
      ${notes}
      <button class="link-btn" type="button" id="editBtn">Bilgileri değiştir</button>
    </div>`;
  }

  /* ---------- Uyum sekmesi ---------- */

  function renderMatches({ input, chart, analysis }) {
    const pg = input.partner;
    return `
      <div class="segmented inline-seg" role="radiogroup">
        <label><input type="radio" name="matchMode" value="love" checked><span>İlişki</span></label>
        <label><input type="radio" name="matchMode" value="friend"><span>Arkadaşlık</span></label>
      </div>
      <p class="muted" id="matchIntro">Sana en uygun ${plural(pg)} burçları, yukarıdan aşağıya. Ayrıntı için birine dokun.</p>
      <div class="list" id="matchList">${matchRows(analysis.ranking, 'love', pg)}</div>
      <p class="muted" style="margin-top:12px;font-size:.9rem">Sıralama yalnızca Güneş burcuna değil; Ay${chart.planets.asc ? ', yükselen' : ''}, Venüs ve Mars konumlarına da bakılarak yapıldı.</p>
      ${shareBar('shareMatches')}`;
  }

  function matchRows(list, mode, pg) {
    return list.map((r, i) => {
      const s = SIGNS[r.sign];
      const score = mode === 'love' ? r.score : r.friendship;
      return `<details class="row" data-sign="${r.sign}">
        <summary>
          <span class="row-no">${i + 1}</span>
          <span class="row-glyph">${s.symbol}</span>
          <span><span class="row-title">${s.name}${mode === 'love' ? ' ' + genderWord(pg) : ''}</span><span class="row-sub">${s.element} · ${s.dates}</span></span>
          <span class="row-score"><b>${score}</b><span>${levelShort(score)}</span></span>
        </summary>
        <div class="detail"></div>
      </details>`;
    }).join('');
  }

  function meters(cats) {
    return `<div class="meters">${CATEGORIES.map((c) => `
      <div class="meter"><div class="meter-head"><span>${c.label}</span><b>${cats[c.key]}</b></div><div class="track"><i style="width:${cats[c.key]}%"></i></div></div>`).join('')}</div>`;
  }

  function matchDetail({ input, chart, analysis }, signIdx, mode) {
    const r = analysis.results[signIdx];
    const me = SIGNS[chart.planets.sun.sign];
    const s = SIGNS[signIdx];
    const pg = input.partner;
    const friend = mode === 'friend';
    const plus = r.elementText.plus.slice(0, 3);
    const minus = r.elementText.minus.slice(0, 3);

    let html = friend
      ? `<p>Arkadaşlık uyumunuz: <b>${r.friendship}</b> (${levelShort(r.friendship).toLocaleLowerCase('tr')}).</p>`
      : `<p>Senin haritana göre uyum: <b>${r.score}</b>. Yalnızca Güneş burçlarına bakınca: ${r.base}.</p>`;
    html += meters(r.categories);
    html += `<h3>Neden?</h3><p>${r.aspect.text}</p><p>${r.elementText.text}</p>`;
    if (!friend && r.reasons.length) {
      html += `<ul class="plain pm">${r.reasons.map((x) => `<li class="${x.type}">${x.text}</li>`).join('')}</ul>`;
    }
    html += `<div class="two">
        <div><h3>İyi giden</h3><ul class="plain pm">${plus.map((x) => `<li class="plus">${x}</li>`).join('')}</ul></div>
        <div><h3>Dikkat</h3><ul class="plain pm">${minus.map((x) => `<li class="minus">${x}</li>`).join('')}</ul></div>
      </div>`;
    if (friend) {
      html += `<h3>${s.name}</h3><p>${s.summary}</p>`;
    } else {
      html += `<h3>${s.name} ${genderWord(pg)}</h3><p>${pg === 'erkek' ? s.male : s.female}</p>
        <p><b>Yaklaşırken:</b> ${pg === 'erkek' ? s.winMale : s.winFemale}</p>`;
    }
    html += `<h3>Öneri</h3><p>${r.aspect.advice} ${adviceForElements(me.element, s.element)}</p>`;
    return html;
  }

  function bindMatches(ctx) {
    const list = $('matchList');
    let mode = 'love';
    const bindRows = () => list.querySelectorAll('.row').forEach((d) => d.addEventListener('toggle', () => {
      const box = d.querySelector('.detail');
      if (d.open && !box.innerHTML) box.innerHTML = matchDetail(ctx, +d.dataset.sign, mode);
    }));
    document.querySelectorAll('input[name="matchMode"]').forEach((r) => r.addEventListener('change', () => {
      mode = document.querySelector('input[name="matchMode"]:checked').value;
      const data = mode === 'love' ? ctx.analysis.ranking : ctx.analysis.friendRanking;
      list.innerHTML = matchRows(data, mode, ctx.input.partner);
      $('matchIntro').textContent = mode === 'love'
        ? `Sana en uygun ${plural(ctx.input.partner)} burçları, yukarıdan aşağıya. Ayrıntı için birine dokun.`
        : 'Arkadaş olarak en iyi anlaşabileceğin burçlar.';
      bindRows();
    }));
    bindRows();
    bindShare('shareMatches', () => shareTextForResults(ctx));
  }

  function adviceForElements(a, b) {
    const map = {
      'Ateş-Ateş': 'Rekabeti ilişkinin dışında tutun.',
      'Toprak-Toprak': 'Ara sıra rutini bozacak yeni şeyler planlayın.',
      'Hava-Hava': '“Ne düşünüyorsun” kadar “ne hissediyorsun” da sorun.',
      'Su-Su': 'Duygularınızı tahmin etmek yerine söyleyin.',
      'Ateş-Hava': 'Planların arasında birbirinizin duygularını atlamayın.',
      'Su-Toprak': 'Rahat alanınızın dışına birlikte çıkmayı deneyin.',
      'Ateş-Toprak': 'Tempo farkınızı kabul edin; birinin hızı, diğerinin sabrı ikinize de lazım.',
      'Ateş-Su': 'Söylediklerinizin tonuna dikkat edin.',
      'Hava-Toprak': 'Fikirleri birlikte somut planlara dönüştürün.',
      'Hava-Su': 'Mantıkla duyguyu yarıştırmayın; ikisinin de yeri var.'
    };
    return map[[a, b].sort().join('-')] || '';
  }

  /* ---------- Harita sekmesi ---------- */

  function renderChart({ input, chart }) {
    const s = SIGNS[chart.planets.sun.sign];
    const rows = ['sun', 'moon', 'asc', 'venus', 'mars', 'mercury'].map((k) => {
      const p = chart.planets[k];
      const L = PLANET_LABELS[k];
      if (!p) return `<tr><th>${L.name}</th><td>Bilinmiyor<small>Doğum saati gerekli.</small></td></tr>`;
      const sign = SIGNS[p.sign];
      const deg = chart.uncertain[k] ? '' : ` <span class="muted">${window.Astro.formatDegree(p.lon)}</span>`;
      const text = k === 'sun' ? L.desc + '.' : (PLACEMENTS[k] ? PLACEMENTS[k][p.sign] : '');
      return `<tr><th>${L.name}</th><td>${sign.symbol} ${signLabel(chart, k)}${deg}<small>${text}</small></td></tr>`;
    }).join('');

    const bal = window.Compat.balance(chart);
    const elMeters = Object.entries(bal.elements).map(([k, v]) => `
      <div class="meter"><div class="meter-head"><span>${k}</span><b>%${v}</b></div><div class="track"><i style="width:${v}%"></i></div></div>`).join('');
    const dom = Object.entries(bal.elements).sort((a, b) => b[1] - a[1])[0][0];
    const domText = { 'Ateş': 'hareketli ve cesur', 'Toprak': 'pratik ve sağlam', 'Hava': 'sosyal ve meraklı', 'Su': 'duygusal ve sezgisel' }[dom];

    return `
      <div class="panel">
        <h2>Doğum haritan</h2>
        <table class="table"><tbody>${rows}</tbody></table>
      </div>
      <div class="panel">
        <h2>Element dengen</h2>
        <p class="muted">Haritanda ${dom} ağır basıyor: ${domText} bir yapın var.</p>
        <div class="meters">${elMeters}</div>
      </div>
      <div class="panel">
        <h2>${s.name} ${genderWord(input.gender)} olarak</h2>
        <p>${s.summary}</p>
        <p>${input.gender === 'erkek' ? s.male : s.female}</p>
        <div class="two">
          <div><h3>Güçlü yanların</h3><ul class="plain pm">${s.strengths.map((x) => `<li class="plus">${x}</li>`).join('')}</ul></div>
          <div><h3>Zorlandığın yerler</h3><ul class="plain pm">${s.weaknesses.map((x) => `<li class="minus">${x}</li>`).join('')}</ul></div>
        </div>
        <p class="tags" style="margin-top:16px">${s.element} · ${s.modality} · Yönetici: ${s.ruler} · ${s.dates}</p>
      </div>`;
  }

  /* ---------- Günlük sekmesi ---------- */

  function renderDailyShell() {
    return `
      <div class="segmented inline-seg" role="radiogroup">
        <label><input type="radio" name="dayMode" value="today" checked><span>Bugün</span></label>
        <label><input type="radio" name="dayMode" value="tomorrow"><span>Yarın</span></label>
        <label><input type="radio" name="dayMode" value="week"><span>Bu hafta</span></label>
      </div>
      <div id="horoContent"></div>`;
  }

  function dayMeters(sc) {
    const L = { love: 'Aşk', work: 'İş ve para', mood: 'Ruh hali' };
    return `<div class="meters">${Object.keys(L).map((k) => `
      <div class="meter"><div class="meter-head"><span>${L[k]}</span><b>${sc[k]}</b></div><div class="track"><i style="width:${sc[k]}%"></i></div></div>`).join('')}</div>`;
  }

  function renderDay(d, compact) {
    const ms = SIGNS[d.moonSign];
    return `${compact ? '' : `<h2>${fmtDay(d.date)}</h2>`}
      <p class="muted">Ay ${ms.name} burcunda, senin ${d.house + 1}. evinde.</p>
      <h3>${d.houseInfo.theme}</h3>
      <p>${d.houseInfo.text}</p>
      ${d.mercuryRetro ? '<p class="note">Merkür geri hareket ediyor. Yazışmalarda, imzalarda ve alışverişte biraz daha dikkatli ol.</p>' : ''}
      ${d.aspects.length ? `<h3>Gökyüzünden etkiler</h3><ul class="plain pm">${d.aspects.map((a) => `<li class="${a.harm > 0 ? 'plus' : 'minus'}">${a.text}</li>`).join('')}</ul>` : ''}
      ${dayMeters(d.scores)}`;
  }

  function renderWeek(w) {
    const rows = w.days.map((d) => `<details class="row simple"><summary>
        <span><span class="row-title">${fmtDay(d.date)}</span><span class="row-sub">${d.houseInfo.theme}</span></span>
        <span class="row-score"><b>${d.overall}</b></span>
      </summary><div class="detail">${renderDay(d, true)}</div></details>`).join('');
    const ev = w.events.length
      ? `<h3>Bu hafta gökyüzünde</h3><ul class="plain">${w.events.map((e) => `<li><b>${fmtDay(e.date)}:</b> ${e.text}</li>`).join('')}</ul>` : '';
    return `<div class="panel">
        <table class="table"><tbody>
          <tr><th>Aşk için</th><td>${fmtDay(w.bestLove.date)}</td></tr>
          <tr><th>İş için</th><td>${fmtDay(w.bestWork.date)}</td></tr>
          <tr><th>Keyif için</th><td>${fmtDay(w.bestMood.date)}</td></tr>
        </tbody></table>
        ${ev}
      </div>
      <div class="list">${rows}</div>`;
  }

  function bindDaily({ chart }) {
    const show = () => {
      const mode = document.querySelector('input[name="dayMode"]:checked').value;
      const t = todayLocal();
      $('horoContent').innerHTML = mode === 'week'
        ? renderWeek(window.Horoscope.weekly(chart, t))
        : `<div class="panel">${renderDay(window.Horoscope.daily(chart, mode === 'tomorrow' ? new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1) : t))}
           <p class="muted" style="font-size:.85rem;margin-top:16px">Gezegenlerin o günkü gerçek konumları senin doğum haritanla karşılaştırılarak hesaplandı.</p></div>`;
    };
    document.querySelectorAll('input[name="dayMode"]').forEach((r) => r.addEventListener('change', show));
    show();
  }

  /* ---------- Biriyle karşılaştır ---------- */

  function renderPartnerForm(input) {
    const pg = input.partner;
    return `<div class="panel">
      <h2>Biriyle karşılaştır</h2>
      <p class="muted">Sevgilinin, eşinin ya da merak ettiğin birinin doğum bilgilerini gir.</p>
      <form id="partnerForm" novalidate>
        <div class="grid">
          <label class="field"><span>Adı <small>(isteğe bağlı)</small></span><input type="text" id="pName" maxlength="40"></label>
          <div class="field"><span>Cinsiyeti</span>
            <div class="segmented" role="radiogroup">
              <label><input type="radio" name="pGender" value="kadin" ${pg === 'kadin' ? 'checked' : ''}><span>Kadın</span></label>
              <label><input type="radio" name="pGender" value="erkek" ${pg === 'erkek' ? 'checked' : ''}><span>Erkek</span></label>
            </div>
          </div>
          <label class="field"><span>Doğum tarihi</span><input type="date" id="pBirthDate" min="1900-01-01"></label>
          <div class="field"><span>Doğum saati</span><input type="time" id="pBirthTime" value="12:00">
            <label class="check"><input type="checkbox" id="pTimeUnknown"> Bilmiyorum</label></div>
          <label class="field full"><span>Doğum yeri</span><select id="pBirthPlace"></select></label>
          <div class="field full hidden" id="pCustomPlace"><div class="grid three">
            <label class="field"><span>Enlem</span><input type="number" id="pCustomLat" step="0.01" min="-90" max="90"></label>
            <label class="field"><span>Boylam</span><input type="number" id="pCustomLon" step="0.01" min="-180" max="180"></label>
            <label class="field"><span>UTC farkı</span><input type="number" id="pCustomTz" step="0.5" min="-12" max="14"></label>
          </div></div>
        </div>
        <p class="error" id="pError" role="alert"></p>
        <button type="submit" class="btn">Karşılaştır</button>
      </form>
    </div>
    <div id="synResult"></div>`;
  }

  function bindPartner(ctx) {
    buildPlaceOptions($('pBirthPlace'));
    $('pBirthDate').max = todayISO();
    $('pTimeUnknown').addEventListener('change', (e) => { $('pBirthTime').disabled = e.target.checked; });
    $('pBirthPlace').addEventListener('change', (e) => { $('pCustomPlace').classList.toggle('hidden', e.target.value !== 'custom'); });

    const s = store.get(PARTNER_KEY);
    if (s) {
      $('pName').value = s.name || '';
      const g = document.querySelector(`input[name="pGender"][value="${s.gender}"]`); if (g) g.checked = true;
      $('pBirthDate').value = s.date || '';
      $('pBirthTime').value = s.time || '12:00';
      $('pTimeUnknown').checked = !!s.unknown; $('pBirthTime').disabled = !!s.unknown;
      $('pBirthPlace').value = s.place || '';
      $('pCustomPlace').classList.toggle('hidden', s.place !== 'custom');
      $('pCustomLat').value = s.lat || ''; $('pCustomLon').value = s.lon || ''; $('pCustomTz').value = s.tz || '';
    }

    $('partnerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const b = readBirth('p');
      $('pError').textContent = b.error || '';
      if (b.error) return;
      const pInput = Object.assign(b, { name: $('pName').value.trim(), gender: document.querySelector('input[name="pGender"]:checked').value });
      store.set(PARTNER_KEY, {
        name: pInput.name, gender: pInput.gender, date: $('pBirthDate').value, time: $('pBirthTime').value, unknown: !pInput.timeKnown,
        place: $('pBirthPlace').value, lat: $('pCustomLat').value, lon: $('pCustomLon').value, tz: $('pCustomTz').value
      });
      const chartB = window.Astro.computeChart(pInput);
      const syn = window.Compat.synastry(ctx.chart, chartB);
      $('synResult').innerHTML = renderSynastry(ctx.input, ctx.chart, pInput, chartB, syn) + shareBar('shareSyn');
      bindShare('shareSyn', () => shareTextForSynastry(ctx.input, ctx.chart, pInput, chartB, syn));
      $('synResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function renderSynastry(inA, A, inB, B, syn) {
    const sa = SIGNS[A.planets.sun.sign], sb = SIGNS[B.planets.sun.sign];
    const nameA = inA.name ? esc(inA.name) : 'Sen';
    const nameB = inB.name ? esc(inB.name) : 'O';
    const sp = syn.sunPair;
    const owner = (who, side) => ((who === 'AB') === (side === 'x') ? 'senin' : 'onun');

    const cell = (k, sign, chart) => (sign === null ? '<span class="muted">Saat gerekli</span>' : `${SIGNS[sign].symbol} ${signLabel(chart, k)}`);
    const rows = syn.signRows.map((r) => `<tr><th>${PLANET_LABELS[r.key].name}</th><td>${cell(r.key, r.a, A)}</td><td>${cell(r.key, r.b, B)}</td><td>${r.raw === null ? '–' : r.raw}</td></tr>`).join('');

    const sorted = CATEGORIES.slice().sort((x, y) => syn.categories[y.key] - syn.categories[x.key]);
    const aspects = syn.aspects.slice(0, 5).map((a) => `<li class="${a.effect >= 0 ? 'plus' : 'minus'}"><b>${cap(owner(a.who, 'x'))} ${PLANET_LABELS[a.x].name} ile ${owner(a.who, 'y')} ${PLANET_LABELS[a.y].name}: ${a.aspect.name.toLocaleLowerCase('tr')}.</b> ${a.aspect.text} ${a.pair.theme}</li>`).join('');

    return `<div class="panel">
      <div class="pair-head">
        <div><h2>${nameA} ve ${nameB}</h2><p class="muted">${sa.symbol} ${sa.name} · ${sb.symbol} ${sb.name}</p></div>
        <div style="text-align:right"><div class="big-score">${syn.score}</div><span class="muted">${levelShort(syn.score)}</span></div>
      </div>
      ${!inA.timeKnown || !inB.timeKnown ? '<p class="note">Doğum saatlerinden biri bilinmediği için Ay ve yükselenle ilgili açılar hesaba katılmadı.</p>' : ''}
      <p>En güçlü olduğunuz alan ${sorted[0].label.toLocaleLowerCase('tr')}, en çok özen isteyen alan ${sorted[sorted.length - 1].label.toLocaleLowerCase('tr')}.</p>
      ${meters(syn.categories)}

      <h3>Haritalarınız yan yana</h3>
      <table class="table"><thead><tr><th></th><th>${nameA}</th><th>${nameB}</th><th>Uyum</th></tr></thead><tbody>${rows}</tbody></table>

      ${syn.notes.length ? `<h3>Evlilik evi</h3><ul class="plain pm">${syn.notes.map((n) => `<li class="plus">${n}</li>`).join('')}</ul>` : ''}
      ${aspects ? `<h3>Aranızdaki açılar</h3><ul class="plain pm">${aspects}</ul>` : ''}

      <h3>${sa.name} ve ${sb.name}</h3>
      <p>${sp.aspect.text}</p>
      <p>${sp.elem.text}</p>

      <h3>${nameB === 'O' ? 'Onun hakkında' : nameB + ' hakkında'}</h3>
      <p>${inB.gender === 'erkek' ? sb.male : sb.female}</p>

      <h3>Öneri</h3>
      <p>${sp.aspect.advice} ${adviceForElements(sa.element, sb.element)}</p>
    </div>`;
  }

  /* ---------- Ünlüler ---------- */

  function renderCelebShell(input) {
    const other = input.partner === 'erkek' ? 'kadin' : 'erkek';
    return `<div class="grid three filters" style="margin-top:16px">
        <label class="field"><span>Ara</span><input type="search" id="celebSearch"></label>
        <label class="field"><span>Cinsiyet</span><select id="celebGender">
          <option value="${input.partner}">${cap(plural(input.partner))}</option>
          <option value="${other}">${cap(plural(other))}</option>
          <option value="">Hepsi</option></select></label>
        <label class="field"><span>Nereden</span><select id="celebOrigin">
          <option value="">Hepsi</option><option value="tr">Türkiye</option><option value="w">Dünya</option></select></label>
      </div>
      <p class="muted" style="margin-top:12px">Ünlülerin Güneş burcuyla senin uyumun.</p>
      <div class="list" id="celebList"></div>
      <button class="btn quiet hidden" type="button" id="celebMore" style="margin-top:12px">Daha fazla</button>`;
  }

  function bindCelebs({ chart, analysis }) {
    const me = SIGNS[chart.planets.sun.sign];
    let limit = 15;
    const draw = () => {
      const q = $('celebSearch').value.trim().toLocaleLowerCase('tr');
      const g = $('celebGender').value, o = $('celebOrigin').value;
      const list = window.Celebs
        .filter((c) => (!g || c.gender === g) && (!o || c.origin === o) && (!q || c.name.toLocaleLowerCase('tr').includes(q)))
        .map((c) => ({ c, r: analysis.results[c.sign] }))
        .sort((x, y) => y.r.score - x.r.score || x.c.name.localeCompare(y.c.name, 'tr'));
      $('celebList').innerHTML = list.length ? list.slice(0, limit).map(({ c, r }) => {
        const s = SIGNS[c.sign];
        return `<details class="row"><summary>
          <span class="row-no"></span>
          <span class="row-glyph">${s.symbol}</span>
          <span><span class="row-title">${esc(c.name)}</span><span class="row-sub">${c.job} · ${s.name}</span></span>
          <span class="row-score"><b>${r.score}</b><span>${levelShort(r.score)}</span></span>
        </summary><div class="detail">
          <p class="tags">${me.name} ve ${s.name} · ${me.element} ile ${s.element}</p>
          <p>${r.aspect.text}</p>
        </div></details>`;
      }).join('') : '<p class="muted" style="padding:16px;margin:0">Bu aramaya uyan kimse yok.</p>';
      $('celebMore').classList.toggle('hidden', list.length <= limit);
    };
    ['celebSearch', 'celebGender', 'celebOrigin'].forEach((id) => $(id).addEventListener('input', () => { limit = 15; draw(); }));
    $('celebMore').addEventListener('click', () => { limit += 15; draw(); });
    draw();
  }

  /* ---------- Paylaşım ---------- */

  function shareBar(id) {
    return `<div class="share" id="${id}">
      <button class="btn quiet" type="button" data-act="wa">WhatsApp'ta paylaş</button>
      <button class="btn quiet" type="button" data-act="copy">Kopyala</button>
      <span class="share-msg" aria-live="polite"></span>
    </div>`;
  }

  function bindShare(id, getText) {
    const bar = $(id);
    const msg = bar.querySelector('.share-msg');
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const text = getText();
      if (btn.dataset.act === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
      if (btn.dataset.act === 'copy') {
        const done = () => { msg.textContent = 'Kopyalandı'; setTimeout(() => { msg.textContent = ''; }, 2000); };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
        else fallbackCopy(text, done);
      }
    });
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* kopyalanamadı */ }
    ta.remove();
  }

  function shareTextForResults({ input, chart, analysis }) {
    const s = SIGNS[chart.planets.sun.sign];
    const top = analysis.ranking.slice(0, 3).map((r, i) => `${i + 1}. ${SIGNS[r.sign].name} (${r.score})`).join('\n');
    return `${s.name} ${genderWord(input.gender)}yim. Bana en uygun ${plural(input.partner)} burçları:\n${top}`;
  }

  function shareTextForSynastry(inA, A, inB, B, syn) {
    const sa = SIGNS[A.planets.sun.sign], sb = SIGNS[B.planets.sun.sign];
    return `${inA.name || 'Ben'} (${sa.name}) ve ${inB.name || 'o'} (${sb.name}): uyumumuz ${syn.score}, ${levelShort(syn.score).toLocaleLowerCase('tr')}.`;
  }

  /* ---------- Tema ---------- */

  function setupTheme() {
    const btn = $('themeToggle');
    const isDark = () => {
      const t = document.documentElement.getAttribute('data-theme');
      return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    const label = () => { btn.textContent = isDark() ? 'Açık tema' : 'Koyu tema'; };
    btn.addEventListener('click', () => {
      const t = isDark() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', t);
      try { localStorage.setItem('burc-uyum-tema', t); } catch (e) { /* depolama yok */ }
      label();
    });
    label();
  }

  setupTheme();
  setupForm();
})();
