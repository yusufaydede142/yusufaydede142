/* Arayüz: form, sonuç ekranı ve uyum raporları */
(function () {
  'use strict';
  const { SIGNS, CATEGORIES, PLACEMENTS, PLANET_LABELS, PLANET_NATURE } = window.ZodiacData;
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = 'burc-uyum-son-giris';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const genderWord = (g) => (g === 'erkek' ? 'erkeği' : 'kadını');
  const genderPlural = (g) => (g === 'erkek' ? 'Erkek' : 'Kadın');

  /* ---------- Form hazırlığı ---------- */

  function buildPlaceOptions(sel) {
    const og1 = document.createElement('optgroup');
    og1.label = 'Türkiye';
    window.Cities.turkey.forEach((c, i) => og1.appendChild(new Option(c.name, 'tr:' + i)));
    const og2 = document.createElement('optgroup');
    og2.label = 'Yurtdışı';
    window.Cities.world.forEach((c, i) => og2.appendChild(new Option(`${c.name} (${c.country})`, 'w:' + i)));
    const og3 = document.createElement('optgroup');
    og3.label = 'Diğer';
    og3.appendChild(new Option('Listede yok – koordinat gireceğim', 'custom'));
    sel.append(new Option('Şehir seçin…', ''), og1, og2, og3);
  }

  function fillPlaces() {
    buildPlaceOptions($('birthPlace'));
    const off = $('manualOffset');
    off.appendChild(new Option('Otomatik (önerilir)', ''));
    for (let h = -12; h <= 14; h += 0.5) {
      if (h % 1 !== 0 && ![-3.5, 3.5, 4.5, 5.5, 9.5].includes(h)) continue;
      off.appendChild(new Option('UTC' + (h >= 0 ? '+' : '') + h, String(h)));
    }
  }

  function getPlace(prefix) {
    const id = (x) => (prefix ? prefix + x : x.charAt(0).toLowerCase() + x.slice(1));
    const v = $(id('BirthPlace')).value;
    if (v.startsWith('tr:')) return window.Cities.turkey[+v.slice(3)];
    if (v.startsWith('w:')) return window.Cities.world[+v.slice(2)];
    if (v === 'custom') {
      const lat = parseFloat($(id('CustomLat')).value);
      const lon = parseFloat($(id('CustomLon')).value);
      const tz = parseFloat($(id('CustomTz')).value);
      if ([lat, lon, tz].some(Number.isNaN) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
      return { name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, lat, lon, tz, dst: 'NONE' };
    }
    return null;
  }

  function bindForm() {
    const today = new Date().toISOString().slice(0, 10);
    $('birthDate').max = today;

    $('timeUnknown').addEventListener('change', (e) => { $('birthTime').disabled = e.target.checked; });
    $('birthPlace').addEventListener('change', (e) => { $('customPlace').classList.toggle('hidden', e.target.value !== 'custom'); });
    document.querySelectorAll('input[name="gender"]').forEach((r) => r.addEventListener('change', () => {
      const g = document.querySelector('input[name="gender"]:checked').value;
      document.querySelector(`input[name="partner"][value="${g === 'kadin' ? 'erkek' : 'kadin'}"]`).checked = true;
    }));

    $('birthForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const err = $('formError');
      err.textContent = '';
      const dateStr = $('birthDate').value;
      if (!dateStr) { err.textContent = 'Lütfen doğum tarihini gir.'; return; }
      const [year, month, day] = dateStr.split('-').map(Number);
      if (year < 1900 || dateStr > today) { err.textContent = 'Lütfen 1900 ile bugün arasında geçerli bir tarih gir.'; return; }
      const timeKnown = !$('timeUnknown').checked;
      let hour = 12, minute = 0;
      if (timeKnown) {
        if (!$('birthTime').value) { err.textContent = 'Lütfen doğum saatini gir ya da “bilmiyorum” kutusunu işaretle.'; return; }
        [hour, minute] = $('birthTime').value.split(':').map(Number);
      }
      const place = getPlace('');
      if (!place) { err.textContent = $('birthPlace').value === 'custom' ? 'Lütfen geçerli enlem, boylam ve UTC farkı gir.' : 'Lütfen doğum yerini seç.'; return; }

      const input = {
        name: $('name').value.trim(),
        gender: document.querySelector('input[name="gender"]:checked').value,
        partner: document.querySelector('input[name="partner"]:checked').value,
        year, month, day, hour, minute, timeKnown, place,
        manualOffset: $('manualOffset').value
      };
      saveInput();
      run(input);
    });
  }

  function saveInput() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        name: $('name').value, gender: document.querySelector('input[name="gender"]:checked').value,
        partner: document.querySelector('input[name="partner"]:checked').value,
        date: $('birthDate').value, time: $('birthTime').value, unknown: $('timeUnknown').checked,
        place: $('birthPlace').value, lat: $('customLat').value, lon: $('customLon').value, tz: $('customTz').value,
        offset: $('manualOffset').value
      }));
    } catch (e) { /* depolama kullanılamıyor olabilir */ }
  }

  function restoreInput() {
    let s;
    try { s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { s = null; }
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

  /* ---------- Hesaplama ve çizim ---------- */

  function run(input) {
    const chart = window.Astro.computeChart(input);
    const analysis = window.Compat.analyze(chart, input.gender, input.partner);
    const bal = window.Compat.balance(chart);
    const out = $('results');
    out.innerHTML = renderHero(input, chart) + renderDailyCard() + renderPlanets(chart) + renderBalance(bal) +
      renderProfile(input, chart) + renderRankings(input, chart, analysis) + renderPartnerCard(input) + renderCelebCard(input);
    out.classList.remove('hidden');
    bindResults(input, chart, analysis);
    bindPartner(input, chart);
    bindDaily(chart);
    bindCelebs(input, chart, analysis);
    bindShare('heroShare', () => shareTextForResults(input, chart, analysis));
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function signLabel(chart, key) {
    const p = chart.planets[key];
    const u = chart.uncertain[key];
    if (u) return `${SIGNS[u[0]].name} / ${SIGNS[u[1]].name}`;
    return SIGNS[p.sign].name;
  }

  function renderHero(input, chart) {
    const sun = SIGNS[chart.planets.sun.sign];
    const who = input.name ? esc(input.name) : 'Merhaba';
    const dateStr = `${String(input.day).padStart(2, '0')}.${String(input.month).padStart(2, '0')}.${input.year}`;
    const timeStr = input.timeKnown ? `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}` : 'saat bilinmiyor';
    const off = chart.utcOffset;
    let notes = '';
    if (chart.cusp) notes += `<div class="note">☄ Güneş'in burç sınırına çok yakın (${SIGNS[chart.cusp.other].name} geçişi). Kuspe doğumlular her iki burcun özelliklerini de taşıyabilir.</div>`;
    if (!input.timeKnown) {
      notes += '<div class="note">🕰 Doğum saatin bilinmediği için Yükselen burcun hesaplanamadı ve sonuçlar öğle saatine göre yapıldı.';
      if (chart.uncertain.moon) notes += ` O gün Ay burç değiştirdiği için Ay burcun <b>${SIGNS[chart.uncertain.moon[0]].name}</b> veya <b>${SIGNS[chart.uncertain.moon[1]].name}</b> olabilir; uyum puanlarında ikisinin ortalaması kullanıldı.`;
      notes += '</div>';
    }
    const chips = [
      `☉ Güneş: ${signLabel(chart, 'sun')}`, `☽ Ay: ${signLabel(chart, 'moon')}`,
      chart.planets.asc ? `AC Yükselen: ${SIGNS[chart.planets.asc.sign].name}` : null
    ].filter(Boolean).map((c) => `<span class="chip">${c}</span>`).join('');
    return `
      <div class="card hero">
        <div class="big-symbol">${sun.symbol}</div>
        <h1>${who}${input.name ? ',' : '!'} sen bir ${sun.name} ${genderWord(input.gender)}sin</h1>
        <p class="muted">${dateStr} · ${timeStr} · ${esc(input.place.name)} · UTC${off >= 0 ? '+' : ''}${off}</p>
        <div class="chips">${chips}</div>
        ${notes}
        <div class="actions">
          <button class="btn ghost" type="button" id="btnEdit">✏️ Bilgileri düzenle</button>
          <button class="btn ghost" type="button" id="btnPrint">🖨️ Yazdır / PDF</button>
        </div>
        ${shareBar('heroShare')}
      </div>`;
  }

  function renderPlanets(chart) {
    const order = ['sun', 'moon', 'asc', 'venus', 'mars', 'mercury'];
    const cards = order.map((k) => {
      const p = chart.planets[k];
      const L = PLANET_LABELS[k];
      if (!p) {
        return `<div class="planet"><div class="p-head"><div class="p-icon">${L.icon}</div><div><div class="p-name">${L.name}</div><div class="p-sign">Bilinmiyor</div></div></div>
          <div class="p-desc">${L.desc}</div><p>Yükselen burç için doğum saatine ihtiyaç var.</p></div>`;
      }
      const s = SIGNS[p.sign];
      const u = chart.uncertain[k];
      const text = k === 'sun' ? s.summary.split('. ')[0] + '.' : (PLACEMENTS[k] ? PLACEMENTS[k][p.sign] : '');
      return `<div class="planet">
        <div class="p-head"><div class="p-icon">${L.icon}</div>
          <div><div class="p-name">${L.name}</div><div class="p-sign">${s.symbol} ${u ? signLabel(chart, k) : s.name} <small class="muted">${u ? '' : window.Astro.formatDegree(p.lon)}</small></div></div></div>
        <div class="p-desc">${L.desc}</div>
        <p>${text}</p>
      </div>`;
    }).join('');
    return `<div class="card"><h2>🪐 Doğum Haritan</h2><div class="planets">${cards}</div></div>`;
  }

  function bars(obj, elClass) {
    return Object.entries(obj).map(([k, v]) => `
      <div class="bar-row"><span class="${elClass ? 'el-' + k : ''}">${k}</span><div class="bar ${elClass ? 'el-' + k : ''}"><i style="width:${v}%"></i></div><b>%${v}</b></div>`).join('');
  }

  function renderBalance(bal) {
    const domEl = Object.entries(bal.elements).sort((a, b) => b[1] - a[1])[0][0];
    const lowEl = Object.entries(bal.elements).sort((a, b) => a[1] - b[1])[0][0];
    const domMod = Object.entries(bal.modalities).sort((a, b) => b[1] - a[1])[0][0];
    const elText = {
      'Ateş': 'tutkulu, cesur ve hareket odaklı', 'Toprak': 'pratik, güvenilir ve istikrarlı',
      'Hava': 'zihinsel, sosyal ve iletişim odaklı', 'Su': 'duygusal, sezgisel ve şefkatli'
    };
    const lowText = {
      'Ateş': 'Hayatına heyecan ve cesaret katan partnerler sana iyi gelir.',
      'Toprak': 'Ayaklarını yere bastıran, güven veren partnerler seni dengeler.',
      'Hava': 'Seni konuşturan, bakış açını genişleten partnerler seni dengeler.',
      'Su': 'Duygularını açmana yardım eden şefkatli partnerler seni dengeler.'
    };
    const modText = { 'Öncü': 'başlatan ve yön veren', 'Sabit': 'kararlı ve sadık', 'Değişken': 'esnek ve uyumlu' };
    return `<div class="card">
      <h2>⚖️ Enerji Dağılımın</h2>
      <div class="two-col">
        <div><h3>Elementler</h3><div class="bars">${bars(bal.elements, true)}</div></div>
        <div><h3>Nitelikler</h3><div class="bars">${bars(bal.modalities, false)}</div></div>
      </div>
      <p style="margin-top:14px">Haritanda <b class="el-${domEl}">${domEl}</b> elementi baskın: ${elText[domEl]} bir yapın var. İlişkilerde ${modText[domMod]} bir tavır sergilersin.
      ${bal.elements[lowEl] <= 10 ? `<b class="el-${lowEl}">${lowEl}</b> elementin zayıf. ${lowText[lowEl]}` : ''}</p>
    </div>`;
  }

  function renderProfile(input, chart) {
    const s = SIGNS[chart.planets.sun.sign];
    const g = input.gender;
    return `<div class="card">
      <h2>${s.symbol} ${s.name} ${g === 'erkek' ? 'Erkeği' : 'Kadını'} Olarak Sen</h2>
      <div>${s.keywords.map((k) => `<span class="badge">${k}</span>`).join('')}</div>
      <p>${s.summary}</p>
      <p>${g === 'erkek' ? s.male : s.female}</p>
      <p><b>Aşkta:</b> ${s.inLove}</p>
      <p><b>İlişkide ihtiyaçların:</b> ${s.needs}</p>
      <div class="two-col">
        <div><h3>Güçlü yönlerin</h3><ul class="list-plus">${s.strengths.map((x) => `<li>${x}</li>`).join('')}</ul></div>
        <div><h3>Dikkat etmen gerekenler</h3><ul class="list-minus">${s.weaknesses.map((x) => `<li>${x}</li>`).join('')}</ul></div>
      </div>
      <div class="info-grid">
        <div class="info"><b>${s.element}</b>Element</div>
        <div class="info"><b>${s.modality}</b>Nitelik</div>
        <div class="info"><b>${s.ruler}</b>Yönetici gezegen</div>
        <div class="info"><b>${s.dates}</b>Tarih aralığı</div>
        <div class="info"><b>${s.color}</b>Şanslı renk</div>
        <div class="info"><b>${s.stone}</b>Şanslı taş</div>
        <div class="info"><b>${s.day}</b>Şanslı gün</div>
        <div class="info"><b>${s.polarity}</b>Polarite</div>
      </div>
    </div>`;
  }

  function renderRankings(input, chart, a) {
    const pg = input.partner;
    const top = a.ranking.slice(0, 3);
    const medals = ['🥇', '🥈', '🥉'];
    const podium = [1, 0, 2].map((i) => {
      const r = top[i];
      const s = SIGNS[r.sign];
      return `<div class="pod ${i === 0 ? 'first' : ''}"><div class="medal">${medals[i]}</div><div class="sym">${s.symbol}</div>
        <div class="nm">${s.name} ${genderWord(pg)}</div><div class="pct">%${r.score}</div><div class="${r.level.cls}" style="font-size:.78rem">${r.level.label}</div></div>`;
    }).join('');

    const loveList = a.ranking.map((r, i) => rankItem(r, i, pg, r.score, r.level, 'love')).join('');
    const friendList = a.friendRanking.map((r, i) => rankItem(r, i, null, r.friendship, window.Compat.levelOf(r.friendship), 'friend')).join('');
    const worst = a.ranking.slice(-3).reverse().map((r) => `${SIGNS[r.sign].name} (%${r.score})`).join(', ');

    return `<div class="card" id="rankingCard">
      <h2>💞 Sana En Uygun ${genderPlural(pg)} Burçları</h2>
      <p class="muted">Sıralama; Güneş burcunun yanında Ay${chart.planets.asc ? ', Yükselen' : ''}, ${a.attractName} ve ${a.otherName} konumların hesaba katılarak kişiselleştirildi. Detaylı uyum raporu için bir burca dokun.</p>
      <div class="tabs" role="tablist">
        <button class="btn ghost tab rtab" type="button" role="tab" data-tab="love" aria-selected="true">💘 Aşk & İlişki Uyumu</button>
        <button class="btn ghost tab rtab" type="button" role="tab" data-tab="friend" aria-selected="false">🌟 Arkadaşlık Uyumu</button>
      </div>
      <div data-panel="love">
        <div class="podium">${podium}</div>
        ${loveList}
        <p class="muted" style="margin-top:12px">En çok emek isteyen eşleşmeler: <b>${worst}</b>. Bu, ilişkinin imkânsız olduğu anlamına gelmez; sadece daha fazla anlayış ve iletişim gerektirir.</p>
      </div>
      <div data-panel="friend" class="hidden">
        <p class="muted">Cinsiyetten bağımsız olarak; sohbet, ortak ilgi alanları ve duygusal anlayış açısından en iyi anlaşabileceğin burçlar.</p>
        ${friendList}
      </div>
    </div>`;
  }

  function rankItem(r, i, pg, score, level, mode) {
    const s = SIGNS[r.sign];
    const title = pg ? `${s.name} ${genderWord(pg)}` : s.name;
    return `<details class="rank-item" data-sign="${r.sign}" data-mode="${mode}">
      <summary>
        <span class="rank-no">${i + 1}</span>
        <span class="rank-sym">${s.symbol}</span>
        <span><span class="rank-title">${title}</span><br><span class="rank-sub">${s.element} · ${s.modality} · ${s.dates}</span></span>
        <span class="rank-score"><b class="${level.cls}">%${score}</b><span class="lvl ${level.cls}">${level.label}</span><span class="expand-hint">Detay</span></span>
        <span class="mini-bar bar"><i style="width:${score}%"></i></span>
      </summary>
      <div class="detail"></div>
    </details>`;
  }

  /* ---------- Detaylı uyum raporu ---------- */

  function renderDetail(input, chart, a, signIdx, mode) {
    const r = a.results[signIdx];
    const me = SIGNS[chart.planets.sun.sign];
    const s = SIGNS[signIdx];
    const pg = input.partner;
    const isFriend = mode === 'friend';
    const score = isFriend ? r.friendship : r.score;
    const lvl = window.Compat.levelOf(score);
    const partnerTitle = isFriend ? s.name : `${s.name} ${genderWord(pg)}`;

    const catBars = CATEGORIES.map((c) => `
      <div class="bar-row"><span>${c.icon} ${c.label}</span><div class="bar"><i style="width:${r.categories[c.key]}%"></i></div><b>%${r.categories[c.key]}</b></div>`).join('');

    const intro = isFriend
      ? `${me.name} ve ${s.name} arasındaki arkadaşlık uyumu <b class="${lvl.cls}">%${score} – ${lvl.label}</b>.`
      : `Sen (${me.name} ${genderWord(input.gender)}) ve ${partnerTitle} arasındaki kişisel uyum puanı <b class="${lvl.cls}">%${score} – ${lvl.label}</b>. Sadece Güneş burçlarına bakıldığında genel uyum %${r.base}.`;

    const reasons = r.reasons.length
      ? `<h3>🔭 Doğum Haritandan Kişisel Notlar</h3><ul class="reasons ${''}" style="list-style:none;padding:0">${r.reasons.map((x) => `<li>${x.type === 'plus' ? '✅' : '⚠️'} ${x.text}</li>`).join('')}</ul>`
      : '';

    const plus = r.elementText.plus.concat(r.aspectDist === 4 || r.aspectDist === 2 ? ['Doğal ve zahmetsiz bir uyum akışı'] : []);
    const minus = r.elementText.minus.concat(r.aspectDist === 3 ? ['Farklı yöntemler sık sürtüşme yaratabilir'] : r.aspectDist === 6 ? ['Zıt bakış açıları kutuplaşmaya dönüşebilir'] : []);

    const planetText = me.ruler === s.ruler
      ? `İki burç da ${me.ruler} tarafından yönetiliyor: ${PLANET_NATURE[me.ruler]} konusunda aynı dili konuşuyorsunuz.`
      : `Senin yönetici gezegenin ${me.ruler} (${PLANET_NATURE[me.ruler]}), ${s.name} burcununki ise ${s.ruler} (${PLANET_NATURE[s.ruler]}). Bu iki enerji birleştiğinde ilişkiye hem ${PLANET_NATURE[me.ruler].split(' ve ')[0]} hem de ${PLANET_NATURE[s.ruler].split(' ve ')[0]} katılır.`;

    const aboutPartner = isFriend ? s.summary : (pg === 'erkek' ? s.male : s.female);
    const winText = pg === 'erkek' ? s.winMale : s.winFemale;

    return `
      <h3>📊 Uyum Puanları</h3>
      <p>${intro}</p>
      <div class="bars">${catBars}</div>

      <h3>🌌 Genel Değerlendirme</h3>
      <p><span class="badge">${r.aspect.name}</span><span class="badge">${me.element} + ${s.element}</span><span class="badge">${me.modality} + ${s.modality}</span></p>
      <p>${r.aspect.text}</p>
      <p>${r.elementText.text}</p>
      <p>${r.modality.text}</p>
      <p>${planetText}</p>

      ${reasons}

      <div class="two-col">
        <div><h3>💪 Güçlü Yönleriniz</h3><ul class="list-plus">${plus.map((x) => `<li>${x}</li>`).join('')}</ul></div>
        <div><h3>⚡ Zorlayıcı Noktalar</h3><ul class="list-minus">${minus.map((x) => `<li>${x}</li>`).join('')}</ul></div>
      </div>

      <h3>${s.symbol} ${partnerTitle} Hakkında</h3>
      <p>${aboutPartner}</p>
      <p><b>Anahtar kelimeler:</b> ${s.keywords.join(', ')} · <b>İhtiyaçları:</b> ${s.needs}</p>
      ${isFriend ? '' : `<p><b>Aşkta:</b> ${s.inLove}</p><h3>💝 Onun Kalbini Nasıl Kazanırsın?</h3><p>${winText}</p>`}

      <h3>🧭 Tavsiye</h3>
      <p>${r.aspect.advice} ${adviceForElements(me.element, s.element)}</p>`;
  }

  function adviceForElements(a, b) {
    const set = [a, b].sort().join('-');
    const map = {
      'Ateş-Ateş': 'Rekabeti ilişkinin dışında tutun ve birbirinize sakinleşme alanı tanıyın.',
      'Toprak-Toprak': 'Rutini kırmak için düzenli olarak yeni deneyimler planlayın.',
      'Hava-Hava': 'Konuşmalarınızı duygulara da taşıyın; “ne düşünüyorsun” kadar “ne hissediyorsun” da sorun.',
      'Su-Su': 'Duygularınızı tahmin etmek yerine sözle ifade etmeyi alışkanlık edinin.',
      'Ateş-Hava': 'Planlarınızı hayata geçirirken birbirinizin duygusal ihtiyaçlarını gözden kaçırmayın.',
      'Su-Toprak': 'Güvenli limanınızı korurken birbirinizi konfor alanının dışına davet edin.',
      'Ateş-Toprak': 'Tempo farkınızı kabul edin: biri gaz, diğeri fren olabilir — ikisi de gerekli.',
      'Ateş-Su': 'Sözlerinizin tonuna dikkat edin; doğrudanlık ile hassasiyet arasında köprü kurun.',
      'Hava-Toprak': 'Fikirleri somut planlara dönüştürmek için birlikte çalışın; bu ikinizi de güçlendirir.',
      'Hava-Su': 'Mantık ile duyguyu yarıştırmayın; ikisinin de haklı olabileceği alanlar olduğunu kabul edin.'
    };
    return map[set] || '';
  }

  function bindResults(input, chart, a) {
    $('btnEdit').addEventListener('click', () => $('formCard').scrollIntoView({ behavior: 'smooth' }));
    $('btnPrint').addEventListener('click', () => {
      document.querySelectorAll('.rank-item[data-sign]').forEach((d) => {
        if (!d.querySelector('.detail').innerHTML) d.querySelector('.detail').innerHTML = renderDetail(input, chart, a, +d.dataset.sign, d.dataset.mode);
      });
      window.print();
    });
    document.querySelectorAll('.rank-item[data-sign]').forEach((d) => {
      d.addEventListener('toggle', () => {
        const box = d.querySelector('.detail');
        if (d.open && !box.innerHTML) box.innerHTML = renderDetail(input, chart, a, +d.dataset.sign, d.dataset.mode);
      });
    });
    document.querySelectorAll('.rtab').forEach((t) => t.addEventListener('click', () => {
      document.querySelectorAll('.rtab').forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      document.querySelectorAll('[data-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.panel !== t.dataset.tab));
    }));
  }


  /* ---------- Belirli biriyle karşılaştırma (sinastri) ---------- */

  const PARTNER_KEY = 'burc-uyum-partner';

  function renderPartnerCard(input) {
    const pg = input.partner;
    return `<div class="card" id="partnerCard">
      <h2>💑 Belirli Biriyle Uyumunu Hesapla</h2>
      <p class="muted">Sevgilinin, eşinin ya da hoşlandığın kişinin doğum bilgilerini gir; iki doğum haritası gezegen gezegen karşılaştırılsın.</p>
      <form id="partnerForm" novalidate>
        <div class="grid">
          <label class="field"><span>Onun adı <small>(isteğe bağlı)</small></span><input type="text" id="pName" maxlength="40" placeholder="Örn. Mehmet"></label>
          <div class="field"><span>Cinsiyeti</span>
            <div class="segmented" role="radiogroup">
              <label><input type="radio" name="pGender" value="kadin" ${pg === 'kadin' ? 'checked' : ''}><span>♀ Kadın</span></label>
              <label><input type="radio" name="pGender" value="erkek" ${pg === 'erkek' ? 'checked' : ''}><span>♂ Erkek</span></label>
            </div>
          </div>
          <label class="field"><span>Doğum tarihi</span><input type="date" id="pBirthDate" min="1900-01-01"></label>
          <div class="field"><span>Doğum saati</span><input type="time" id="pBirthTime" value="12:00">
            <label class="check"><input type="checkbox" id="pTimeUnknown"> Doğum saatini bilmiyorum</label></div>
          <label class="field full"><span>Doğum yeri</span><select id="pBirthPlace"></select></label>
          <div class="field full hidden" id="pCustomPlace"><div class="grid three">
            <label class="field"><span>Enlem (Kuzey +)</span><input type="number" id="pCustomLat" step="0.01" min="-90" max="90"></label>
            <label class="field"><span>Boylam (Doğu +)</span><input type="number" id="pCustomLon" step="0.01" min="-180" max="180"></label>
            <label class="field"><span>UTC farkı (saat)</span><input type="number" id="pCustomTz" step="0.5" min="-12" max="14"></label>
          </div></div>
        </div>
        <p class="error" id="pError" role="alert"></p>
        <button type="submit" class="btn primary">💞 Uyumumuzu Hesapla</button>
      </form>
      <div id="synResult"></div>
    </div>`;
  }

  function bindPartner(input, chartA) {
    buildPlaceOptions($('pBirthPlace'));
    $('pBirthDate').max = new Date().toISOString().slice(0, 10);
    $('pTimeUnknown').addEventListener('change', (e) => { $('pBirthTime').disabled = e.target.checked; });
    $('pBirthPlace').addEventListener('change', (e) => { $('pCustomPlace').classList.toggle('hidden', e.target.value !== 'custom'); });

    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(PARTNER_KEY) || 'null'); } catch (e) { saved = null; }
    if (saved) {
      $('pName').value = saved.name || '';
      const g = document.querySelector(`input[name="pGender"][value="${saved.gender}"]`); if (g) g.checked = true;
      $('pBirthDate').value = saved.date || '';
      $('pBirthTime').value = saved.time || '12:00';
      $('pTimeUnknown').checked = !!saved.unknown; $('pBirthTime').disabled = !!saved.unknown;
      $('pBirthPlace').value = saved.place || '';
      $('pCustomPlace').classList.toggle('hidden', saved.place !== 'custom');
      $('pCustomLat').value = saved.lat || ''; $('pCustomLon').value = saved.lon || ''; $('pCustomTz').value = saved.tz || '';
    }

    $('partnerForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const err = $('pError');
      err.textContent = '';
      const dateStr = $('pBirthDate').value;
      const today = new Date().toISOString().slice(0, 10);
      if (!dateStr || dateStr < '1900-01-01' || dateStr > today) { err.textContent = 'Lütfen onun geçerli doğum tarihini gir.'; return; }
      const [year, month, day] = dateStr.split('-').map(Number);
      const timeKnown = !$('pTimeUnknown').checked;
      let hour = 12, minute = 0;
      if (timeKnown) {
        if (!$('pBirthTime').value) { err.textContent = 'Lütfen doğum saatini gir ya da “bilmiyorum” kutusunu işaretle.'; return; }
        [hour, minute] = $('pBirthTime').value.split(':').map(Number);
      }
      const place = getPlace('p');
      if (!place) { err.textContent = $('pBirthPlace').value === 'custom' ? 'Lütfen geçerli enlem, boylam ve UTC farkı gir.' : 'Lütfen onun doğum yerini seç.'; return; }
      const pInput = {
        name: $('pName').value.trim(),
        gender: document.querySelector('input[name="pGender"]:checked').value,
        year, month, day, hour, minute, timeKnown, place
      };
      try {
        localStorage.setItem(PARTNER_KEY, JSON.stringify({
          name: pInput.name, gender: pInput.gender, date: dateStr, time: $('pBirthTime').value, unknown: !timeKnown,
          place: $('pBirthPlace').value, lat: $('pCustomLat').value, lon: $('pCustomLon').value, tz: $('pCustomTz').value
        }));
      } catch (e2) { /* depolama kullanılamıyor olabilir */ }

      const chartB = window.Astro.computeChart(pInput);
      const syn = window.Compat.synastry(chartA, chartB);
      $('synResult').innerHTML = renderSynastry(input, chartA, pInput, chartB, syn) + shareBar('synShare');
      bindShare('synShare', () => shareTextForSynastry(input, chartA, pInput, chartB, syn));
      $('synResult').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function renderSynastry(inA, A, inB, B, syn) {
    const sa = SIGNS[A.planets.sun.sign], sb = SIGNS[B.planets.sun.sign];
    const nameA = inA.name ? esc(inA.name) : 'Sen';
    const nameB = inB.name ? esc(inB.name) : 'O';
    const sp = syn.sunPair;
    const cell = (k, sign, chart) => {
      if (sign === null) return '<span class="muted">Saat gerekli</span>';
      const u = chart.uncertain[k];
      return u ? `${SIGNS[u[0]].symbol} ${SIGNS[u[0]].name} / ${SIGNS[u[1]].name}` : `${SIGNS[sign].symbol} ${SIGNS[sign].name}`;
    };
    const rows = syn.signRows.map((r) => {
      const lvl = r.raw === null ? null : window.Compat.levelOf(r.raw);
      return `<tr><td>${PLANET_LABELS[r.key].icon} ${PLANET_LABELS[r.key].name}</td><td>${cell(r.key, r.a, A)}</td><td>${cell(r.key, r.b, B)}</td>
        <td>${lvl ? `<b class="${lvl.cls}">%${r.raw}</b>` : '–'}</td></tr>`;
    }).join('');

    const catBars = CATEGORIES.map((c) => `
      <div class="bar-row"><span>${c.icon} ${c.label}</span><div class="bar"><i style="width:${syn.categories[c.key]}%"></i></div><b>%${syn.categories[c.key]}</b></div>`).join('');

    const ownerName = (who, side) => (who === 'AB') === (side === 'x') ? 'Senin' : 'Onun';
    const aspectItems = syn.aspects.map((a) => {
      const good = a.effect >= 0;
      return `<li><b>${good ? '✅' : '⚠️'} ${ownerName(a.who, 'x')} ${PLANET_LABELS[a.x].name} ↔ ${ownerName(a.who, 'y').toLowerCase()} ${PLANET_LABELS[a.y].name}: ${a.aspect.name}</b>
        <small class="muted">(orb ${a.orb.toFixed(1)}°)</small><br>${a.aspect.text} ${a.pair.theme}</li>`;
    }).join('');

    const strongest = syn.aspects.filter((a) => a.effect > 0).slice(0, 1)[0];
    const hardest = syn.aspects.filter((a) => a.effect < 0)[0];
    const bestCat = CATEGORIES.slice().sort((x, y) => syn.categories[y.key] - syn.categories[x.key])[0];
    const worstCat = CATEGORIES.slice().sort((x, y) => syn.categories[x.key] - syn.categories[y.key])[0];

    let warn = '';
    if (!inB.timeKnown || !inA.timeKnown) warn = '<div class="note">🕰 Doğum saatlerinden en az biri bilinmediği için Yükselen ve Ay ile ilgili derece açıları hesaba katılmadı; Ay burcu yalnızca burç düzeyinde karşılaştırıldı.</div>';

    return `
      <div class="syn">
        <div class="syn-head">
          <div class="syn-person"><div class="sym">${sa.symbol}</div><b>${nameA}</b><small class="muted">${sa.name} ${genderWord(inA.gender)}</small></div>
          <div class="syn-score"><div class="pct ${syn.level.cls}">%${syn.score}</div><div class="${syn.level.cls}">${syn.level.label}</div></div>
          <div class="syn-person"><div class="sym">${sb.symbol}</div><b>${nameB}</b><small class="muted">${sb.name} ${genderWord(inB.gender)}</small></div>
        </div>
        ${warn}
        <h3>📝 Özet</h3>
        <p>İkinizin harita uyumu <b class="${syn.level.cls}">%${syn.score} – ${syn.level.label}</b>. En güçlü olduğunuz alan <b>${bestCat.label}</b> (%${syn.categories[bestCat.key]}), en çok özen isteyen alan ise <b>${worstCat.label}</b> (%${syn.categories[worstCat.key]}).
        ${strongest ? `Aranızdaki en güçlü olumlu bağ: <b>${ownerName(strongest.who, 'x')} ${PLANET_LABELS[strongest.x].name} – ${ownerName(strongest.who, 'y').toLowerCase()} ${PLANET_LABELS[strongest.y].name} ${strongest.aspect.name.toLowerCase()}</b>.` : ''}
        ${hardest ? `Üzerinde çalışmanız gereken nokta: <b>${ownerName(hardest.who, 'x')} ${PLANET_LABELS[hardest.x].name} – ${ownerName(hardest.who, 'y').toLowerCase()} ${PLANET_LABELS[hardest.y].name} ${hardest.aspect.name.toLowerCase()}</b>.` : ''}</p>

        <h3>📊 Kategori Puanları</h3>
        <div class="bars">${catBars}</div>

        <h3>🪐 Haritalarınız Yan Yana</h3>
        <div class="table-wrap"><table class="syn-table">
          <thead><tr><th>Gezegen</th><th>${nameA}</th><th>${nameB}</th><th>Uyum</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>

        ${syn.notes.length ? `<h3>💍 Evlilik Evi Bağlantıları</h3><ul class="list-plus">${syn.notes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''}

        <h3>✨ Aranızdaki Gezegen Açıları</h3>
        ${aspectItems ? `<ul class="aspect-list">${aspectItems}</ul>` : '<p class="muted">Ana gezegenler arasında dar açı bulunamadı; uyumunuz daha çok burç düzeyindeki etkileşimlerle şekilleniyor.</p>'}

        <h3>☉ Güneş Burçlarınız: ${sa.name} & ${sb.name}</h3>
        <p><span class="badge">${sp.aspect.name}</span><span class="badge">${sa.element} + ${sb.element}</span><span class="badge">${sa.modality} + ${sb.modality}</span></p>
        <p>${sp.aspect.text}</p>
        <p>${sp.elem.text}</p>
        <p>${sp.mod.text}</p>
        <div class="two-col">
          <div><h3>💪 Güçlü Yönleriniz</h3><ul class="list-plus">${sp.elem.plus.map((x) => `<li>${x}</li>`).join('')}</ul></div>
          <div><h3>⚡ Zorlayıcı Noktalar</h3><ul class="list-minus">${sp.elem.minus.map((x) => `<li>${x}</li>`).join('')}</ul></div>
        </div>

        <h3>${sb.symbol} ${nameB === 'O' ? 'Onu Tanı' : nameB + ' Hakkında'}</h3>
        <p>${inB.gender === 'erkek' ? sb.male : sb.female}</p>
        <p><b>İhtiyaçları:</b> ${sb.needs} · <b>Ay burcu:</b> ${signLabel(B, 'moon')} — ${B.uncertain.moon ? 'o gün Ay burç değiştirdiği için kesin değil.' : 'duygusal olarak ihtiyacı: ' + SIGNS[B.planets.moon.sign].needs.toLowerCase()}</p>
        <p><b>Kalbini kazanmak için:</b> ${inB.gender === 'erkek' ? sb.winMale : sb.winFemale}</p>

        <h3>🧭 Tavsiye</h3>
        <p>${sp.aspect.advice} ${adviceForElements(sa.element, sb.element)}</p>
      </div>`;
  }

  /* ---------- Günlük / haftalık yorum ---------- */

  const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const fmtDay = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${DAY_NAMES[d.getDay()]}`;
  const todayLocal = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

  function renderDailyCard() {
    return `<div class="card" id="dailyCard">
      <h2>🔮 Sana Özel Burç Yorumu</h2>
      <p class="muted">Yorumlar, gökyüzündeki gezegenlerin bugünkü gerçek konumları senin doğum haritanla karşılaştırılarak hazırlanır.</p>
      <div class="tabs" role="tablist">
        <button class="btn ghost tab htab" type="button" data-h="today" aria-selected="true">Bugün</button>
        <button class="btn ghost tab htab" type="button" data-h="tomorrow" aria-selected="false">Yarın</button>
        <button class="btn ghost tab htab" type="button" data-h="week" aria-selected="false">Bu Hafta</button>
      </div>
      <div id="horoContent"></div>
    </div>`;
  }

  function scoreBars(scores) {
    const L = { love: '💘 Aşk', work: '💼 İş & Para', mood: '😊 Ruh Hali' };
    return Object.keys(L).map((k) => `<div class="bar-row"><span>${L[k]}</span><div class="bar"><i style="width:${scores[k]}%"></i></div><b>%${scores[k]}</b></div>`).join('');
  }

  function renderDay(d) {
    const lvl = window.Compat.levelOf(d.overall);
    const ms = SIGNS[d.moonSign];
    return `<div class="horo-day">
      <div class="horo-top"><div><b>${fmtDay(d.date)}</b><br><small class="muted">Ay bugün ${ms.symbol} ${ms.name} burcunda · ${d.house + 1}. evinde</small></div>
        <div class="horo-score ${lvl.cls}">%${d.overall}</div></div>
      <h3>🌙 Günün teması: ${d.houseInfo.theme}</h3>
      <p>${d.houseInfo.text}</p>
      ${d.mercuryRetro ? '<div class="note">☿ Merkür şu an geri hareket ediyor: yazışmalarda, imza ve alışverişlerde, teknolojide ekstra dikkatli ol; eski konular ve kişiler gündeme gelebilir.</div>' : ''}
      ${d.aspects.length ? `<h3>✨ Gökyüzünden sana gelen etkiler</h3><ul class="aspect-list">${d.aspects.map((a) => `<li>${a.harm > 0 ? '✅' : '⚠️'} ${a.text}</li>`).join('')}</ul>` : '<p class="muted">Bugün haritanda belirgin bir gezegen etkisi yok; sakin ve dengeli bir gün.</p>'}
      <h3>📊 Günün enerjisi</h3>
      <div class="bars">${scoreBars(d.scores)}</div>
      <div class="info-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">
        <div class="info"><b>${d.lucky.number}</b>Şanslı sayı</div>
        <div class="info"><b>${d.lucky.color}</b>Şanslı renk</div>
        <div class="info"><b>${d.lucky.hour}</b>Şanslı saat</div>
      </div>
    </div>`;
  }

  function renderWeek(w) {
    const rows = w.days.map((d) => {
      const lvl = window.Compat.levelOf(d.overall);
      return `<details class="rank-item week-day"><summary>
        <span class="rank-no">${SIGNS[d.moonSign].symbol}</span>
        <span><span class="rank-title">${fmtDay(d.date)}</span><br><span class="rank-sub">${d.houseInfo.theme}</span></span>
        <span class="rank-score"><b class="${lvl.cls}">%${d.overall}</b><span class="expand-hint">Detay</span></span>
      </summary><div class="detail">${renderDay(d)}</div></details>`;
    }).join('');
    const ev = w.events.length
      ? `<h3>🪐 Bu haftanın gökyüzü olayları</h3><ul class="list-plus">${w.events.map((e) => `<li><b>${fmtDay(e.date)}:</b> ${e.text}</li>`).join('')}</ul>` : '';
    return `<div class="info-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin:0 0 14px">
        <div class="info"><b>${fmtDay(w.bestLove.date)}</b>💘 Aşk için en iyi gün</div>
        <div class="info"><b>${fmtDay(w.bestWork.date)}</b>💼 İş için en iyi gün</div>
        <div class="info"><b>${fmtDay(w.bestMood.date)}</b>😊 En keyifli gün</div>
      </div>${ev}<h3>📅 Gün gün</h3>${rows}`;
  }

  function bindDaily(chart) {
    const show = (mode) => {
      const t = todayLocal();
      let html;
      if (mode === 'week') html = renderWeek(window.Horoscope.weekly(chart, t));
      else html = renderDay(window.Horoscope.daily(chart, mode === 'tomorrow' ? new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1) : t));
      $('horoContent').innerHTML = html;
    };
    document.querySelectorAll('.htab').forEach((b) => b.addEventListener('click', () => {
      document.querySelectorAll('.htab').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      show(b.dataset.h);
    }));
    show('today');
  }

  /* ---------- Paylaşım ---------- */

  function shareBar(id) {
    return `<div class="share-bar" id="${id}">
      <button class="btn share wa" type="button" data-act="wa">🟢 WhatsApp'ta Paylaş</button>
      <button class="btn ghost" type="button" data-act="copy">📋 Metni Kopyala</button>
      ${navigator.share ? '<button class="btn ghost" type="button" data-act="native">📤 Diğer</button>' : ''}
      <span class="share-msg muted" aria-live="polite"></span>
    </div>`;
  }

  function bindShare(id, getText) {
    const bar = $(id);
    if (!bar) return;
    const msg = bar.querySelector('.share-msg');
    bar.addEventListener('click', (e) => {
      const act = e.target.closest('button') && e.target.closest('button').dataset.act;
      if (!act) return;
      const text = getText();
      if (act === 'wa') window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
      if (act === 'native') navigator.share({ title: 'Burç Uyum Rehberi', text }).catch(() => {});
      if (act === 'copy') {
        const done = () => { msg.textContent = 'Kopyalandı ✔'; setTimeout(() => { msg.textContent = ''; }, 2500); };
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

  function shareTextForResults(input, chart, a) {
    const s = SIGNS[chart.planets.sun.sign];
    const extra = [`Ay: ${signLabel(chart, 'moon')}`];
    if (chart.planets.asc) extra.push(`Yükselen: ${SIGNS[chart.planets.asc.sign].name}`);
    const top = a.ranking.slice(0, 3).map((r, i) => `${['🥇', '🥈', '🥉'][i]} ${SIGNS[r.sign].name} ${SIGNS[r.sign].symbol} – %${r.score}`).join('\n');
    return `✦ Burç Uyum Rehberi ✦\n\n${input.name ? input.name + ': ' : ''}Ben bir ${s.name} ${genderWord(input.gender)}yim ${s.symbol} (${extra.join(', ')})\n\nBana en uygun ${genderPlural(input.partner).toLowerCase()} burçları:\n${top}\n\nSen de kendi burç uyumunu keşfet! 💫`;
  }

  function shareTextForSynastry(inA, A, inB, B, syn) {
    const sa = SIGNS[A.planets.sun.sign], sb = SIGNS[B.planets.sun.sign];
    const best = CATEGORIES.slice().sort((x, y) => syn.categories[y.key] - syn.categories[x.key]).slice(0, 3)
      .map((c) => `${c.icon} ${c.label}: %${syn.categories[c.key]}`).join('\n');
    return `✦ Burç Uyum Rehberi ✦\n\n${inA.name || 'Ben'} ${sa.symbol} ${sa.name} & ${inB.name || 'O'} ${sb.symbol} ${sb.name}\n💞 Harita uyumumuz: %${syn.score} – ${syn.level.label}\n\nEn güçlü alanlarımız:\n${best}\n\nSen de kendi uyumunu hesapla! 💫`;
  }

  /* ---------- Ünlülerle uyum ---------- */

  function renderCelebCard(input) {
    return `<div class="card" id="celebCard">
      <h2>⭐ Ünlülerle Uyumun</h2>
      <p class="muted">Ünlülerin Güneş burçlarıyla senin kişisel uyum puanın. Bir ünlüye dokunarak aranızdaki uyumun nedenini gör.</p>
      <div class="grid three celeb-filters">
        <label class="field"><span>Ara</span><input type="search" id="celebSearch" placeholder="Örn. Tarkan"></label>
        <label class="field"><span>Cinsiyet</span><select id="celebGender">
          <option value="${input.partner}">${genderPlural(input.partner)}</option>
          <option value="${input.partner === 'erkek' ? 'kadin' : 'erkek'}">${genderPlural(input.partner === 'erkek' ? 'kadin' : 'erkek')}</option>
          <option value="">Hepsi</option></select></label>
        <label class="field"><span>Köken</span><select id="celebOrigin">
          <option value="">Hepsi</option><option value="tr">Türkiye</option><option value="w">Dünya</option></select></label>
      </div>
      <div id="celebList" class="celeb-list"></div>
      <button class="btn ghost hidden" type="button" id="celebMore" style="width:100%;margin-top:10px">Daha fazla göster</button>
    </div>`;
  }

  function bindCelebs(input, chart, a) {
    const me = SIGNS[chart.planets.sun.sign];
    let limit = 12;
    const draw = () => {
      const q = $('celebSearch').value.trim().toLocaleLowerCase('tr');
      const g = $('celebGender').value, o = $('celebOrigin').value;
      const list = window.Celebs
        .filter((c) => (!g || c.gender === g) && (!o || c.origin === o) && (!q || c.name.toLocaleLowerCase('tr').includes(q)))
        .map((c) => ({ c, r: a.results[c.sign] }))
        .sort((x, y) => y.r.score - x.r.score || x.c.name.localeCompare(y.c.name, 'tr'));
      $('celebList').innerHTML = list.length ? list.slice(0, limit).map(({ c, r }) => {
        const s = SIGNS[c.sign];
        const [yy, mm, dd] = c.date.split('-').map(Number);
        return `<details class="rank-item celeb"><summary>
          <span class="rank-no">${c.origin === 'tr' ? '🇹🇷' : '🌍'}</span>
          <span class="rank-sym">${s.symbol}</span>
          <span><span class="rank-title">${esc(c.name)}</span><br><span class="rank-sub">${c.job} · ${s.name} · ${dd} ${MONTHS[mm - 1]} ${yy}</span></span>
          <span class="rank-score"><b class="${r.level.cls}">%${r.score}</b><span class="lvl ${r.level.cls}">${r.level.label}</span></span>
        </summary><div class="detail">
          <p><span class="badge">${r.aspect.name}</span><span class="badge">${me.element} + ${s.element}</span></p>
          <p>${r.aspect.text}</p><p>${r.elementText.text}</p>
          <p><b>${s.name} ${genderWord(c.gender)}:</b> ${c.gender === 'erkek' ? s.male : s.female}</p>
        </div></details>`;
      }).join('') : '<p class="muted">Aramana uygun ünlü bulunamadı.</p>';
      $('celebMore').classList.toggle('hidden', list.length <= limit);
    };
    ['celebSearch', 'celebGender', 'celebOrigin'].forEach((id) => $(id).addEventListener('input', () => { limit = 12; draw(); }));
    $('celebMore').addEventListener('click', () => { limit += 12; draw(); });
    draw();
  }

  /* ---------- Tema ---------- */

  function bindTheme() {
    const btn = $('themeToggle');
    const apply = (t) => {
      document.documentElement.setAttribute('data-theme', t);
      btn.textContent = t === 'light' ? '🌙' : '☀️';
      btn.setAttribute('aria-label', t === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç');
    };
    apply(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    btn.addEventListener('click', () => {
      const t = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(t);
      try { localStorage.setItem('burc-uyum-tema', t); } catch (e) { /* depolama kullanılamıyor olabilir */ }
    });
  }

  bindTheme();
  fillPlaces();
  bindForm();
  restoreInput();
})();
