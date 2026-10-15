/* Arayüz: form, sonuç sekmeleri ve raporlar */
(function () {
  'use strict';
  const { SIGNS, CATEGORIES, PLACEMENTS, PLANET_LABELS } = window.ZodiacData;
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'burc-uyum-son-giris';
  const PARTNER_KEY = 'burc-uyum-partner';
  const CIRCLE_KEY = 'burc-uyum-cevrem';
  const VISIT_KEY = 'burc-uyum-ziyaret';
  let invite = null; // davet bağlantısıyla gelen kişi

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const genderWord = (g) => (g === 'erkek' ? 'erkeği' : 'kadını');
  const plural = (g) => (g === 'erkek' ? 'erkek' : 'kadın');
  const cap = (s) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
  const levelShort = (score) => (score >= 90 ? 'Çok güçlü' : score >= 80 ? 'Çok iyi' : score >= 70 ? 'İyi' : score >= 60 ? 'Orta' : score >= 50 ? 'Emek ister' : 'Zor');

  // 8 kategori yerine tek cümle: en güçlü iki alan ve en zayıf alan
  function catSentence(cats, who, keys) {
    const sorted = CATEGORIES.filter((c) => !keys || keys.includes(c.key)).sort((x, y) => cats[y.key] - cats[x.key]);
    const lo = (c) => c.label.toLocaleLowerCase('tr');
    return `${who} en güçlü yanı ${lo(sorted[0])} ve ${lo(sorted[1])}, en çok özen isteyen yanı ${lo(sorted[sorted.length - 1])}.`;
  }

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
      if ([lat, lon, tz].some(Number.isNaN) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || tz < -12 || tz > 14) return null;
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

  /* ---------- Kişi kaydı ve davet bağlantısı ---------- */

  // Kayıt: { name, gender, date: 'YYYY-MM-DD', time: 'HH:MM' | '', place: şehir adı | null, lat, lon, tz }
  function placeKeyByName(name) {
    let i = window.Cities.turkey.findIndex((c) => c.name === name);
    if (i >= 0) return 'tr:' + i;
    i = window.Cities.world.findIndex((c) => c.name === name);
    return i >= 0 ? 'w:' + i : '';
  }

  function recordToInput(r) {
    if (!r || !/^\d{4}-\d{2}-\d{2}$/.test(r.date || '')) return null;
    const [year, month, day] = r.date.split('-').map(Number);
    const timeKnown = /^\d{2}:\d{2}$/.test(r.time || '');
    const [hour, minute] = timeKnown ? r.time.split(':').map(Number) : [12, 0];
    let place = null;
    if (r.place) {
      const key = placeKeyByName(r.place);
      place = key.startsWith('tr:') ? window.Cities.turkey[+key.slice(3)] : key.startsWith('w:') ? window.Cities.world[+key.slice(2)] : null;
    } else if ([r.lat, r.lon, r.tz].every((v) => typeof v === 'number' && !Number.isNaN(v))) {
      place = { name: `${r.lat.toFixed(2)}°, ${r.lon.toFixed(2)}°`, lat: r.lat, lon: r.lon, tz: r.tz, dst: 'NONE' };
    }
    if (!place) return null;
    return { name: String(r.name || '').replace(/[<>]/g, '').slice(0, 40), gender: r.gender === 'erkek' ? 'erkek' : 'kadin', year, month, day, hour, minute, timeKnown, place };
  }

  function inputToRecord(inp) {
    const pad = (n) => String(n).padStart(2, '0');
    const rec = {
      name: inp.name || '', gender: inp.gender,
      date: `${inp.year}-${pad(inp.month)}-${pad(inp.day)}`,
      time: inp.timeKnown ? `${pad(inp.hour)}:${pad(inp.minute)}` : ''
    };
    if (placeKeyByName(inp.place.name)) rec.place = inp.place.name;
    else Object.assign(rec, { lat: inp.place.lat, lon: inp.place.lon, tz: inp.place.tz });
    return rec;
  }

  const b64encode = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  function b64decode(str) {
    try { return JSON.parse(decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))))); } catch (e) { return null; }
  }

  function inviteLink(input) {
    return location.href.split('#')[0] + '#davet=' + b64encode(inputToRecord(input));
  }

  function readInvite() {
    const m = location.hash.match(/davet=([A-Za-z0-9_-]+)/);
    if (!m) return;
    const rec = b64decode(m[1]);
    const inp = recordToInput(rec);
    if (!inp) return;
    invite = { rec, inp };
    const who = inp.name ? esc(inp.name) : 'Bir arkadaşın';
    $('inviteNote').innerHTML = `<b>${who}</b> seni davet etti. Kendi bilgilerini gir; ikinizin uyumu hemen gösterilecek.`;
    $('inviteNote').classList.remove('hidden');
  }

  /* ---------- Ana form ---------- */

  function setupForm() {
    buildPlaceOptions($('birthPlace'));
    readInvite();
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
        name: $('name').value.replace(/[<>]/g, '').trim(),
        gender: document.querySelector('input[name="gender"]:checked').value,
        partner: document.querySelector('input[name="partner"]:checked').value,
        manualOffset: $('manualOffset').value
      });
      store.set(STORAGE_KEY, {
        name: input.name, gender: input.gender, partner: input.partner,
        date: $('birthDate').value, time: $('birthTime').value, unknown: !input.timeKnown,
        place: $('birthPlace').value, lat: $('customLat').value, lon: $('customLon').value, tz: $('customTz').value,
        offset: $('manualOffset').value,
        shown: true
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
    if (s.shown && $('birthDate').value) $('birthForm').requestSubmit();
  }

  /* ---------- Sonuç ekranı ---------- */

  const TABS = [
    { key: 'uyum', label: 'Uyum' },
    { key: 'harita', label: 'Haritan' },
    { key: 'gunluk', label: 'Günlük' },
    { key: 'partner', label: 'Karşılaştır' }
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
      `<div class="tab-panel hidden" data-panel="partner">${renderPartnerForm(input)}</div>`;
    $('formCard').classList.add('hidden');
    out.classList.remove('hidden');

    $('editBtn').addEventListener('click', () => {
      const saved = store.get(STORAGE_KEY);
      if (saved) store.set(STORAGE_KEY, Object.assign(saved, { shown: false }));
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (invite) openInvite(ctx);
  }

  function showTab(key) {
    const t = document.querySelector(`.tab[data-tab="${key}"]`);
    if (t) t.click();
  }

  // Davetle gelindiyse davet edeni karşılaştır sekmesinde göster
  function openInvite(ctx) {
    const inv = invite;
    invite = null;
    $('inviteNote').classList.add('hidden');
    history.replaceState(null, '', location.href.split('#')[0]);
    showTab('partner');
    showSynastry(ctx, inv.inp);
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
      <h1><span class="glyph">${sun.symbol}</span>${input.name ? esc(input.name) + ', ' : ''}${sun.name} ${input.gender === 'erkek' ? 'erkeğisin' : 'kadınısın'}</h1>
      <p class="muted">${parts.join(' · ')}<br>${date}, ${time}, ${esc(input.place.name)}</p>
      ${notes}
      <button class="btn quiet" type="button" id="editBtn">Bilgileri değiştir</button>
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
      <p class="small-note">Sıralama yalnızca Güneş burcuna değil; Ay${chart.planets.asc ? ', yükselen' : ''}, Venüs ve Mars konumlarına da bakılarak yapıldı.</p>
      ${shareBar('shareMatches', true)}
      <div class="panel invite">
        <h2>Arkadaşını davet et</h2>
        <p class="muted">Bu bağlantıyı açan kişi sadece kendi doğum bilgilerini girer ve ikinizin uyumunu hemen görür.</p>
        <div class="share" id="shareInvite">
          <button class="btn quiet" type="button" data-act="wa">WhatsApp'ta gönder</button>
          <button class="btn quiet" type="button" data-act="copy">Bağlantıyı kopyala</button>
          <span class="share-msg" aria-live="polite"></span>
        </div>
        <p class="small-note">Bağlantı doğum tarihini, saatini ve şehrini içerir. Sadece güvendiğin kişilere gönder.</p>
      </div>
      <details class="more">
        <summary>Ünlülerle uyumun</summary>
        ${renderCelebShell()}
      </details>`;
  }

  function matchRows(list, mode, pg) {
    return list.map((r) => {
      const s = SIGNS[r.sign];
      const score = mode === 'love' ? r.score : r.friendship;
      return `<details class="row" data-sign="${r.sign}">
        <summary>
          <span class="row-glyph">${s.symbol}</span>
          <span><span class="row-title">${s.name}${mode === 'love' ? ' ' + genderWord(pg) : ''}</span><span class="row-sub">${s.element}</span></span>
          <span class="row-score">${score}</span>
        </summary>
        <div class="detail"></div>
      </details>`;
    }).join('');
  }

  function matchDetail({ input, chart, analysis }, signIdx, mode) {
    const r = analysis.results[signIdx];
    const me = SIGNS[chart.planets.sun.sign];
    const s = SIGNS[signIdx];
    const pg = input.partner;
    const friend = mode === 'friend';
    const score = friend ? r.friendship : r.score;

    let html = `<p>Uyumunuz: ${levelShort(score).toLocaleLowerCase('tr')}. ${friend ? catSentence(r.categories, 'Arkadaşlığınızın', ['iletisim', 'deger', 'guven', 'duygu']) : catSentence(r.categories, 'İlişkinizin')}</p>`;
    html += `<h3>Neden?</h3><p>${r.aspect.text} ${r.elementText.text}</p>`;
    if (!friend && r.reasons.length) {
      html += `<ul class="plain pm">${r.reasons.map((x) => `<li class="${x.type}">${x.text}</li>`).join('')}</ul>`;
    }
    html += `<p><b>Öneri:</b> ${r.aspect.advice} ${adviceForElements(me.element, s.element)}</p>`;
    if (friend) {
      html += `<h3>${s.name}</h3><p>${s.summary}</p>`;
    } else {
      html += `<h3>${s.name} ${genderWord(pg)}</h3><p>${pg === 'erkek' ? s.male : s.female}</p>
        <p><b>Yaklaşırken:</b> ${pg === 'erkek' ? s.winMale : s.winFemale}</p>`;
      const names = window.Celebs.filter((c) => c.sign === signIdx && c.gender === pg).slice(0, 4).map((c) => esc(c.name));
      if (names.length) html += `<p class="small-note">Bu burçtan tanıdık isimler: ${names.join(', ')}.</p>`;
    }
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
    bindShare('shareMatches', () => shareTextForResults(ctx), () => cardForResults(ctx));
    bindShare('shareInvite', () => `Benimle burç uyumuna bak: ${inviteLink(ctx.input)}`);
    bindCelebs(ctx);
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
        ${chartWheel(chart)}
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
        <p class="tags">${s.modality} · Yönetici: ${s.ruler}</p>
      </div>`;
  }

  // Sade doğum haritası çizimi (SVG). Yükselen biliniyorsa sola, bilinmiyorsa Koç sola gelir.
  function chartWheel(chart) {
    const P = chart.planets;
    const ref = P.asc ? P.asc.lon : 0;
    const C = 160, R1 = 150, R2 = 118, R3 = 96, R4 = 70;
    const pt = (lon, r) => {
      const a = (180 + lon - ref) * Math.PI / 180;
      return [C + r * Math.cos(a), C - r * Math.sin(a)];
    };
    const f = (n) => n.toFixed(1);
    let svg = `<circle cx="${C}" cy="${C}" r="${R1}" class="w-line"/><circle cx="${C}" cy="${C}" r="${R2}" class="w-line"/><circle cx="${C}" cy="${C}" r="${R4}" class="w-line"/>`;
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = pt(i * 30, R2), [x2, y2] = pt(i * 30, R1), [tx, ty] = pt(i * 30 + 15, (R1 + R2) / 2);
      svg += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="w-line"/>`;
      svg += `<text x="${f(tx)}" y="${f(ty)}" class="w-sign">${SIGNS[i].symbol}</text>`;
    }
    const glyph = { sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂' };
    const keys = Object.keys(glyph).filter((k) => !chart.uncertain[k]);
    // Açı çizgileri (iç çember)
    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        let d = Math.abs(P[keys[i]].lon - P[keys[j]].lon) % 360; if (d > 180) d = 360 - d;
        const asp = [[60, 5, 'soft'], [90, 6, 'hard'], [120, 7, 'soft'], [180, 7, 'hard']].find(([a, o]) => Math.abs(d - a) <= o);
        if (!asp) continue;
        const [x1, y1] = pt(P[keys[i]].lon, R4), [x2, y2] = pt(P[keys[j]].lon, R4);
        svg += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="w-asp ${asp[2]}"/>`;
      }
    }
    // Gezegenler; birbirine çok yakın olanlar içe kaydırılır
    const placed = [];
    keys.slice().sort((a, b) => P[a].lon - P[b].lon).forEach((k) => {
      let r = R3 - 8;
      while (placed.some((q) => Math.abs(((P[k].lon - q.lon + 540) % 360) - 180) < 9 && q.r === r)) r -= 16;
      placed.push({ lon: P[k].lon, r });
      const [x, y] = pt(P[k].lon, r), [mx, my] = pt(P[k].lon, R2), [nx, ny] = pt(P[k].lon, R2 - 6);
      svg += `<line x1="${f(mx)}" y1="${f(my)}" x2="${f(nx)}" y2="${f(ny)}" class="w-tick"/>`;
      svg += `<text x="${f(x)}" y="${f(y)}" class="w-planet"><title>${PLANET_LABELS[k].name} ${SIGNS[P[k].sign].name}</title>${glyph[k]}︎</text>`;
    });
    if (P.asc) {
      const [x1, y1] = pt(P.asc.lon, R4), [x2, y2] = pt(P.asc.lon, R1 + 2);
      svg += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="w-axis"/><text x="${f(x2 - 4)}" y="${f(y2 - 8)}" class="w-label">AC</text>`;
    }
    return `<figure class="wheel"><svg viewBox="0 0 320 320" role="img" aria-label="Doğum haritası çizimi">${svg}</svg>
      <figcaption class="small-note">${P.asc ? 'Soldaki çizgi yükselen burcun.' : 'Doğum saati olmadığı için yükselen gösterilmiyor.'} Düz çizgiler uyumlu, kesikli çizgiler gerilimli açıları gösterir.</figcaption></figure>`;
  }

  /* ---------- Günlük sekmesi ---------- */

  function renderDailyShell() {
    return `
      <div class="segmented inline-seg" role="radiogroup">
        <label><input type="radio" name="dayMode" value="today" checked><span>Bugün</span></label>
        <label><input type="radio" name="dayMode" value="tomorrow"><span>Yarın</span></label>
        <label><input type="radio" name="dayMode" value="week"><span>Hafta</span></label>
        <label><input type="radio" name="dayMode" value="sky"><span>Takvim</span></label>
      </div>
      <p class="small-note streak hidden" id="streakNote"></p>
      <div id="horoContent"></div>`;
  }

  function dayWords(sc) {
    const word = (v) => (v >= 72 ? 'iyi' : v >= 55 ? 'dengeli' : 'zayıf');
    return `<p class="day-words">Aşk: <b>${word(sc.love)}</b> · İş ve para: <b>${word(sc.work)}</b> · Ruh hali: <b>${word(sc.mood)}</b></p>`;
  }

  function renderDay(d) {
    const ms = SIGNS[d.moonSign];
    return `<h2>${fmtDay(d.date)}</h2>
      <p class="muted">Ay ${ms.name} burcunda, senin ${d.house + 1}. evinde.</p>
      <h3>${d.houseInfo.theme}</h3>
      <p>${d.houseInfo.text}</p>
      ${d.mercuryRetro ? '<p class="note">Merkür geri hareket ediyor. Yazışmalarda, imzalarda ve alışverişte biraz daha dikkatli ol.</p>' : ''}
      ${d.aspects.length ? `<h3>Gökyüzünden etkiler</h3><ul class="plain pm">${d.aspects.map((a) => `<li class="${a.harm > 0 ? 'plus' : 'minus'}">${a.text}</li>`).join('')}</ul>` : ''}
      ${dayWords(d.scores)}`;
  }

  function renderWeek(w) {
    const rows = w.days.map((d) => `<li><b>${fmtDay(d.date)}</b><span class="row-sub">${d.houseInfo.theme}</span></li>`).join('');
    const ev = w.events.length
      ? `<h3>Bu hafta gökyüzünde</h3><ul class="plain">${w.events.map((e) => `<li><b>${fmtDay(e.date)}:</b> ${e.text}</li>`).join('')}</ul>` : '';
    const first = w.days[0].date, last = w.days[w.days.length - 1].date;
    const range = first.getMonth() === last.getMonth()
      ? `${first.getDate()}–${last.getDate()} ${MONTHS[last.getMonth()]}`
      : `${first.getDate()} ${MONTHS[first.getMonth()]} – ${last.getDate()} ${MONTHS[last.getMonth()]}`;
    return `<div class="panel">
        <h2>${range}</h2>
        <table class="table"><tbody>
          <tr><th>Aşk için</th><td>${fmtDay(w.bestLove.date)}</td></tr>
          <tr><th>İş için</th><td>${fmtDay(w.bestWork.date)}</td></tr>
          <tr><th>Keyif için</th><td>${fmtDay(w.bestMood.date)}</td></tr>
        </tbody></table>
        ${ev}
        <h3>Gün gün</h3>
        <ul class="plain">${rows}</ul>
        <p class="small-note">Bir günün ayrıntısı için “Bugün” ya da “Yarın”a bak.</p>
      </div>`;
  }

  function renderSky(chart) {
    const now = new Date();
    const ph = window.Horoscope.moonPhase(now);
    const events = window.Horoscope.skyCalendar(chart, todayLocal(), 60);
    const hm = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const rows = events.map((e) => `<li><b>${fmtDay(e.date)}${e.kind === 'new' || e.kind === 'full' ? ', ' + hm(e.date) : ''}</b><br>${e.title}. <span class="muted">${e.text}</span></li>`).join('');
    return `<div class="panel">
        <h2>Bugün Ay</h2>
        <p>${ph.name}, yüzde ${ph.illum} aydınlık. Ay şu an ${SIGNS[ph.sign].name} burcunda.</p>
        <h3>Önümüzdeki 60 gün</h3>
        <ul class="plain">${rows}</ul>
        <p class="small-note">Saatler senin cihazının saat dilimine göre.</p>
      </div>`;
  }

  // Üst üste kaç gündür bakıldığını say
  function updateStreak() {
    const today = todayISO();
    const v = store.get(VISIT_KEY) || {};
    if (v.last !== today) {
      const y = todayLocal(); y.setDate(y.getDate() - 1);
      const yISO = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      v.streak = v.last === yISO ? (v.streak || 1) + 1 : 1;
      v.last = today;
      store.set(VISIT_KEY, v);
    }
    return v.streak || 1;
  }

  function bindDaily({ chart }) {
    const streak = updateStreak();
    if (streak >= 2) {
      $('streakNote').textContent = `${streak} gündür üst üste bakıyorsun.`;
      $('streakNote').classList.remove('hidden');
    }
    const show = () => {
      const mode = document.querySelector('input[name="dayMode"]:checked').value;
      const t = todayLocal();
      $('horoContent').innerHTML = mode === 'sky' ? renderSky(chart) : mode === 'week'
        ? renderWeek(window.Horoscope.weekly(chart, t))
        : `<div class="panel">${renderDay(window.Horoscope.daily(chart, mode === 'tomorrow' ? new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1) : t))}
           <p class="small-note">Gezegenlerin o günkü gerçek konumları senin doğum haritanla karşılaştırılarak hesaplandı.</p></div>`;
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
    <div id="synResult"></div>
    <div class="panel" id="circlePanel"></div>`;
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
      const pInput = Object.assign(b, { name: $('pName').value.replace(/[<>]/g, '').trim(), gender: document.querySelector('input[name="pGender"]:checked').value });
      store.set(PARTNER_KEY, {
        name: pInput.name, gender: pInput.gender, date: $('pBirthDate').value, time: $('pBirthTime').value, unknown: !pInput.timeKnown,
        place: $('pBirthPlace').value, lat: $('pCustomLat').value, lon: $('pCustomLon').value, tz: $('pCustomTz').value
      });
      showSynastry(ctx, pInput);
    });
    renderCircle(ctx);
  }

  function fillPartnerForm(inp) {
    const pad = (n) => String(n).padStart(2, '0');
    $('pName').value = inp.name || '';
    const g = document.querySelector(`input[name="pGender"][value="${inp.gender}"]`); if (g) g.checked = true;
    $('pBirthDate').value = `${inp.year}-${pad(inp.month)}-${pad(inp.day)}`;
    $('pTimeUnknown').checked = !inp.timeKnown; $('pBirthTime').disabled = !inp.timeKnown;
    $('pBirthTime').value = inp.timeKnown ? `${pad(inp.hour)}:${pad(inp.minute)}` : '12:00';
    const key = placeKeyByName(inp.place.name);
    $('pBirthPlace').value = key || 'custom';
    $('pCustomPlace').classList.toggle('hidden', !!key);
    if (!key) { $('pCustomLat').value = inp.place.lat; $('pCustomLon').value = inp.place.lon; $('pCustomTz').value = inp.place.tz; }
  }

  function showSynastry(ctx, pInput) {
    fillPartnerForm(pInput);
    const chartB = window.Astro.computeChart(pInput);
    const syn = window.Compat.synastry(ctx.chart, chartB);
    $('synResult').innerHTML = renderSynastry(ctx.input, ctx.chart, pInput, chartB, syn);
    bindShare('shareSyn', () => shareTextForSynastry(ctx.input, ctx.chart, pInput, chartB, syn), () => cardForSynastry(ctx.input, ctx.chart, pInput, chartB, syn));
    const saveBtn = $('saveCircle');
    const circle = store.get(CIRCLE_KEY) || [];
    const rec = inputToRecord(pInput);
    const same = (r) => r.name === rec.name && r.date === rec.date && r.time === rec.time;
    if (circle.some(same)) { saveBtn.textContent = 'Çevrende kayıtlı'; saveBtn.disabled = true; }
    saveBtn.addEventListener('click', () => {
      const list = store.get(CIRCLE_KEY) || [];
      if (!list.some(same)) list.push(rec);
      store.set(CIRCLE_KEY, list.slice(-30));
      saveBtn.textContent = 'Çevrene eklendi'; saveBtn.disabled = true;
      renderCircle(ctx);
    });
    $('synResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Kaydedilen kişilerle uyum listesi ve grubun en uyumlu ikilisi
  function renderCircle(ctx) {
    const box = $('circlePanel');
    const list = (store.get(CIRCLE_KEY) || []).map((r) => ({ r, inp: recordToInput(r) })).filter((x) => x.inp);
    if (!list.length) {
      box.innerHTML = '<h2>Çevren</h2><p class="muted">Karşılaştırdığın kişileri “Çevreme ekle” ile kaydedersen hepsiyle uyumunu burada tek listede görürsün.</p>';
      return;
    }
    const me = { inp: ctx.input, chart: ctx.chart, label: ctx.input.name || 'Sen' };
    const people = list.map((x, i) => ({ i, inp: x.inp, chart: window.Astro.computeChart(x.inp), label: x.inp.name || `Kişi ${i + 1}` }));
    const withMe = people.map((p) => ({ p, score: window.Compat.synastry(me.chart, p.chart).score })).sort((a, b) => b.score - a.score);
    const rows = withMe.map(({ p, score }) => `<div class="row-line">
        <span class="row-glyph">${SIGNS[p.chart.planets.sun.sign].symbol}</span>
        <span><button class="link-btn row-title" type="button" data-open="${p.i}">${esc(p.label)}</button><span class="row-sub">${SIGNS[p.chart.planets.sun.sign].name}</span></span>
        <span class="row-score">${score} <button class="link-btn" type="button" data-del="${p.i}" aria-label="${esc(p.label)} kişisini sil">Sil</button></span>
      </div>`).join('');
    let pairs = '';
    const all = [me].concat(people);
    if (all.length >= 3) {
      const scored = [];
      for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) scored.push({ a: all[a], b: all[b], score: window.Compat.synastry(all[a].chart, all[b].chart).score });
      scored.sort((x, y) => y.score - x.score);
      const best = scored[0], worst = scored[scored.length - 1];
      pairs = `<h3>Grubunuzda</h3><ul class="plain">
        <li>En uyumlu ikili: <b>${esc(best.a.label)} ve ${esc(best.b.label)}</b> (${best.score})</li>
        <li>En çok emek isteyen ikili: <b>${esc(worst.a.label)} ve ${esc(worst.b.label)}</b> (${worst.score})</li></ul>`;
    }
    box.innerHTML = `<h2>Çevren</h2><p class="muted">Kaydettiğin kişilerle uyumun. Ayrıntı için isme dokun.</p><div class="list">${rows}</div>${pairs}`;
    box.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => showSynastry(ctx, people[+b.dataset.open].inp)));
    box.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
      const cur = store.get(CIRCLE_KEY) || [];
      cur.splice(+b.dataset.del, 1);
      store.set(CIRCLE_KEY, cur);
      renderCircle(ctx);
    }));
  }

  function renderSynastry(inA, A, inB, B, syn) {
    const sa = SIGNS[A.planets.sun.sign], sb = SIGNS[B.planets.sun.sign];
    const nameA = inA.name ? esc(inA.name) : 'Sen';
    const nameB = inB.name ? esc(inB.name) : 'O';
    const sp = syn.sunPair;
    const owner = (who, side) => ((who === 'AB') === (side === 'x') ? 'senin' : 'onun');

    const cell = (k, sign, chart) => (sign === null ? '<span class="muted">Saat gerekli</span>' : `${SIGNS[sign].symbol} ${signLabel(chart, k)}`);
    const rows = syn.signRows.map((r) => `<tr><th>${PLANET_LABELS[r.key].name}</th><td>${cell(r.key, r.a, A)}</td><td>${cell(r.key, r.b, B)}</td></tr>`).join('');

    const aspects = syn.aspects.slice(0, 3).map((a) => `<li class="${a.effect >= 0 ? 'plus' : 'minus'}"><b>${cap(owner(a.who, 'x'))} ${PLANET_LABELS[a.x].name} ile ${owner(a.who, 'y')} ${PLANET_LABELS[a.y].name}: ${a.aspect.name.toLocaleLowerCase('tr')}.</b> ${a.aspect.text} ${a.pair.theme}</li>`).join('');

    return `<div class="panel">
      <div class="pair-head">
        <div><h2>${nameA} ve ${nameB}</h2><p class="muted">${sa.symbol} ${sa.name} · ${sb.symbol} ${sb.name}</p></div>
        <div class="pair-score"><div class="big-score">${syn.score}</div><span class="muted">${levelShort(syn.score)}</span></div>
      </div>
      ${!inA.timeKnown || !inB.timeKnown ? '<p class="note">Doğum saatlerinden biri bilinmediği için Ay ve yükselenle ilgili açılar hesaba katılmadı.</p>' : ''}
      <p>${catSentence(syn.categories, 'İlişkinizin')}</p>
      ${syn.notes.length ? `<ul class="plain pm">${syn.notes.map((n) => `<li class="plus">${n}</li>`).join('')}</ul>` : ''}

      ${aspects ? `<details class="more"><summary>Aranızdaki açılar</summary><ul class="plain pm">${aspects}</ul></details>` : ''}
      <details class="more"><summary>Haritalarınız yan yana</summary>
        <table class="table"><thead><tr><th></th><th>${nameA}</th><th>${nameB}</th></tr></thead><tbody>${rows}</tbody></table>
      </details>

      <h3>${sa.name} ve ${sb.name}</h3>
      <p>${sp.aspect.text}</p>
      <p>${sp.elem.text}</p>

      <h3>${nameB === 'O' ? 'Onun hakkında' : nameB + ' hakkında'}</h3>
      <p>${inB.gender === 'erkek' ? sb.male : sb.female}</p>

      <h3>Öneri</h3>
      <p>${sp.aspect.advice} ${adviceForElements(sa.element, sb.element)}</p>
      ${shareBar('shareSyn', true)}
      <button class="btn quiet" type="button" id="saveCircle">Çevreme ekle</button>
    </div>`;
  }

  /* ---------- Ünlüler ---------- */

  function renderCelebShell() {
    return `<label class="field celeb-search"><span>İsim ara</span><input type="search" id="celebSearch"></label>
      <div class="list" id="celebList"></div>
      <button class="btn quiet hidden" type="button" id="celebMore">Daha fazla</button>`;
  }

  function bindCelebs({ input, analysis }) {
    let limit = 10;
    const draw = () => {
      const q = $('celebSearch').value.trim().toLocaleLowerCase('tr');
      const list = window.Celebs
        .filter((c) => (q ? c.name.toLocaleLowerCase('tr').includes(q) : c.gender === input.partner))
        .map((c) => ({ c, r: analysis.results[c.sign] }))
        .sort((x, y) => y.r.score - x.r.score || x.c.name.localeCompare(y.c.name, 'tr'));
      $('celebList').innerHTML = list.length ? list.slice(0, limit).map(({ c, r }) => {
        const s = SIGNS[c.sign];
        return `<div class="row-line">
          <span class="row-glyph">${s.symbol}</span>
          <span><span class="row-title">${esc(c.name)}</span><span class="row-sub">${c.job} · ${s.name}</span></span>
          <span class="row-score">${r.score}</span>
        </div>`;
      }).join('') : '<p class="empty">Bu isimde kimse yok.</p>';
      $('celebMore').classList.toggle('hidden', list.length <= limit);
    };
    $('celebSearch').addEventListener('input', () => { limit = 10; draw(); });
    $('celebMore').addEventListener('click', () => { limit += 10; draw(); });
    draw();
  }

  /* ---------- Paylaşım ---------- */

  function shareBar(id, withImage) {
    return `<div class="share" id="${id}">
      <button class="btn quiet" type="button" data-act="wa">WhatsApp'ta paylaş</button>
      <button class="btn quiet" type="button" data-act="copy">Kopyala</button>
      ${withImage ? '<button class="btn quiet" type="button" data-act="img">Görsel olarak kaydet</button>' : ''}
      <span class="share-msg" aria-live="polite"></span>
    </div>`;
  }

  function bindShare(id, getText, getCard) {
    const bar = $(id);
    const msg = bar.querySelector('.share-msg');
    const say = (t) => { msg.textContent = t; setTimeout(() => { msg.textContent = ''; }, 2500); };
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.act === 'img' && getCard) { saveCard(getCard(), say); return; }
      const text = getText();
      if (btn.dataset.act === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
      if (btn.dataset.act === 'copy') {
        const done = () => say('Kopyalandı');
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
        else fallbackCopy(text, done);
      }
    });
  }

  /* ---------- Paylaşılabilir görsel ---------- */

  function drawCard(lines) {
    // lines: [{ text, size, weight, color, gap }]
    const W = 1080, H = 1350, pad = 96;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const font = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    g.fillStyle = '#f7f6f2'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#3b3a8f'; g.fillRect(pad, pad, 72, 8);
    let y = pad + 60;
    lines.forEach((l) => {
      g.font = `${l.weight || 400} ${l.size}px ${font}`;
      g.fillStyle = l.color || '#1d1c1a';
      y += (l.gap || 0) + l.size;
      g.fillText(l.text, pad, y);
      y += l.size * 0.35;
    });
    g.font = `400 30px ${font}`; g.fillStyle = '#6c6862';
    g.fillText('Burç Uyumu', pad, H - pad);
    return cv;
  }

  function saveCard(cv, say) {
    cv.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'burc-uyumu.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'Burç Uyumu' }).catch(() => {});
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'burc-uyumu.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      say('Görsel indirildi');
    }, 'image/png');
  }

  function cardForResults({ input, chart, analysis }) {
    const s = SIGNS[chart.planets.sun.sign];
    const lines = [
      { text: `${input.name ? input.name + ', ' : ''}${s.name} ${input.gender === 'erkek' ? 'erkeği' : 'kadını'}`, size: 64, weight: 700 },
      { text: `Ay ${signLabel(chart, 'moon')}${chart.planets.asc ? ' · Yükselen ' + SIGNS[chart.planets.asc.sign].name : ''}`, size: 36, color: '#6c6862' },
      { text: `Bana en uygun ${plural(input.partner)} burçları`, size: 40, weight: 600, gap: 90 }
    ];
    analysis.ranking.slice(0, 3).forEach((r, i) => {
      lines.push({ text: `${i + 1}.  ${SIGNS[r.sign].symbol} ${SIGNS[r.sign].name}`, size: 72, weight: 700, color: '#3b3a8f', gap: i ? 10 : 30 });
      lines.push({ text: levelShort(r.score), size: 34, color: '#6c6862' });
    });
    return drawCard(lines);
  }

  function cardForSynastry(inA, A, inB, B, syn) {
    const sa = SIGNS[A.planets.sun.sign], sb = SIGNS[B.planets.sun.sign];
    return drawCard([
      { text: `${inA.name || 'Ben'} ${sa.symbol}`, size: 72, weight: 700 },
      { text: 've', size: 40, color: '#6c6862' },
      { text: `${inB.name || 'O'} ${sb.symbol}`, size: 72, weight: 700 },
      { text: `${sa.name} · ${sb.name}`, size: 36, color: '#6c6862', gap: 10 },
      { text: String(syn.score), size: 220, weight: 700, color: '#3b3a8f', gap: 120 },
      { text: levelShort(syn.score), size: 52, weight: 600 }
    ]);
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
    return `${s.name} ${input.gender === 'erkek' ? 'erkeğiyim' : 'kadınıyım'}. Bana en uygun ${plural(input.partner)} burçları:\n${top}`;
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
