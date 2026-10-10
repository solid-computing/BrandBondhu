/* Brandবন্ধু journey player. Embeds the app (app.html?world=journey&embed=1, same origin) and talks
   to it through window.BBAPP (journey.js). The app calls window.BBPLAYER.update() after every
   render, and the player redraws the diagram, the money meter and the caption from BBAPP.status(). */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var frame = $('#p-frame'), api = null, st = null, lang = 'en', autoT = null, raf = 0;
  var prevMoney = null, prevKey = '', sheetOpen = false;

  var T = {
    title: ['পুরো জার্নি', 'Journey demo'], restart: ['আবার শুরু', 'Restart'], back: ['আগে', 'Back'],
    next: ['পরের ধাপ', 'Next'], show: ['স্ক্রিনটা দেখান', 'Show me'], play: ['চালু', 'Play'], pause: ['থামান', 'Pause'],
    whatif: ['ভুল হলে কী হয়?', 'What if it goes wrong?'], toMain: ['মূল জার্নিতে ফিরুন', 'Back to the main journey'],
    replay: ['আবার দেখুন', 'Replay'], step: ['ধাপ', 'Step'], of: ['/', ' of '], done: ['শেষ', 'Finished'], wiStep: ['ভুল হলে', 'What if'],
    money: ['টাকা কোথায়', 'Where the money is'], fictional: ['সব কাল্পনিক', 'All fictional'],
    paidIn: ['সাদিয়া জমা দিলেন', 'Sadia paid in'], held: ['জমা আছে (পেমেন্ট পার্টনার)', 'Held (payment partner)'],
    creator: ['নুসরাত পেলেন', 'Nusrat got'], revenue: ['Brandবন্ধু-র আয়', 'Brandবন্ধু earned'], back2: ['সাদিয়া ফেরত পেলেন', 'Back to Sadia'],
    vat: ['ভ্যাট {v} সরকারকে যায়', 'VAT {v} goes to the government'],
    note: ['যেকোনো ধাপে ক্লিক করে সেখানে চলে যান। অ্যাপের ভেতরেও নিজে ক্লিক করতে পারেন।', 'Click any step to jump there. You can also click around inside the app yourself.'],
    offTrack: ['আপনি গল্পের বাইরে চলে গেছেন। "আবার শুরু" চাপলে ধাপে ধাপে দেখা যাবে।', 'You have gone off the script. Press Restart to follow the journey again.'],
    journey: ['জার্নি', 'Journey'], app: ['শুধু সেলার ডেমো', 'Seller demo only'],
    roles: { seller: ['সেলার', 'Seller'], team: ['টিম', 'Team'], creator: ['ইনফ্লুয়েন্সার', 'Influencer'] },
    chrome: ['Brandবন্ধু টিম কনসোল', 'Brandবন্ধু team console'], frame: ['Brandবন্ধু অ্যাপ (ডেমো)', 'Brandবন্ধু app (demo)']
  };
  function t(k) { var v = T[k]; return v[lang === 'bn' ? 0 : 1]; }
  function money(n) { return '৳' + Math.round(n).toLocaleString('en-US'); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v;
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c) e.append(c); });
    return e;
  }
  var ICON = {
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>', pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/>',
    next: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    restart: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/>', flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    check: '<path d="M5 12l5 5 9-10"/>'
  };
  function ico(name) { return el('span', { 'aria-hidden': 'true', style: 'display:inline-flex', html: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + ICON[name] + '</svg>' }); }
  function btn(cls, iconName, label, onclick, extra) {
    var b = el('button', Object.assign({ type: 'button', class: 'pbtn ' + cls, onclick: onclick }, extra || {}), [iconName ? ico(iconName) : null, el('span', { class: 'lbl', text: label })]);
    return b;
  }

  /* ---------- talking to the app ---------- */
  window.BBPLAYER = { update: function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; refresh(); }); } };
  frame.addEventListener('load', function () {
    api = frame.contentWindow.BBAPP;
    if (!api) return;
    frame.contentDocument.addEventListener('pointerdown', stopAuto, true);
    var m = location.hash.match(/^#\/(step|whatif)\/(\d+)/);
    if (m) api.goto(m[1] === 'whatif' ? 'whatif' : 'main', +m[2]); else api.show();
    refresh();
  });
  function act(fn) { return function () { stopAuto(); fn(); }; }

  /* ---------- autoplay ---------- */
  function startAuto() {
    if (!api || autoT) return;
    api.next();
    autoT = setInterval(function () {
      var s = api.status();
      if (s.complete || s.offTrack) { stopAuto(); return; }
      api.next();
    }, 4200);
    renderCaption();
  }
  function stopAuto() { if (autoT) { clearInterval(autoT); autoT = null; if (st) renderCaption(); } }

  /* ---------- drawing ---------- */
  function refresh() {
    if (!api) return;
    st = api.status();
    lang = st.lang;
    document.documentElement.lang = lang;
    document.title = 'Brandবন্ধু: ' + (lang === 'bn' ? 'পুরো জার্নি (ডেমো)' : 'the full journey (demo)');
    renderTop(); renderMoney(); renderDiagram(); renderCaption(); renderDevice();
    if (!st.complete) {
      var h = '#/' + (st.mode === 'whatif' ? 'whatif' : 'step') + '/' + st.idx;
      if (location.hash !== h) history.replaceState(null, '', h);
    }
  }

  function renderTop() {
    $('#p-title').textContent = t('title');
    var lb = $('#p-lang');
    lb.textContent = lang === 'bn' ? 'English' : 'বাংলা';
    lb.setAttribute('lang', lang === 'bn' ? 'en' : 'bn');
    lb.onclick = function () { api.setLang(lang === 'bn' ? 'en' : 'bn'); };
    var rb = $('#p-restart');
    rb.replaceChildren(ico('restart'), el('span', { class: 'lbl', text: t('restart') }));
    rb.setAttribute('aria-label', t('restart'));
    rb.onclick = act(function () { api.restart(); });
    var roles = $('#p-roles');
    roles.setAttribute('aria-label', lang === 'bn' ? 'কার স্ক্রিন' : 'Whose screen');
    roles.replaceChildren.apply(roles, ['seller', 'team', 'creator'].map(function (r) {
      return el('button', { type: 'button', class: 'lane-' + r, 'aria-pressed': st.role === r ? 'true' : 'false', onclick: act(function () { api.role(r); }) },
        [el('span', { class: 'rdot', 'aria-hidden': 'true' }), el('span', { text: T.roles[r][lang === 'bn' ? 0 : 1] })]);
    }));
  }

  function renderMoney() {
    var m = st.money, box = $('#p-money');
    var cells = [
      ['paidIn', 'in', m.paidIn],
      ['held', 'held', m.held],
      m.refunded ? ['back2', 'back', m.refunded] : ['creator', 'cr', m.creator],
      ['revenue', 'rev', m.revenue]
    ];
    box.replaceChildren.apply(box, [el('h2', null, [el('span', { text: t('money') }), el('span', { text: t('fictional') })])].concat(cells.map(function (c) {
      var changed = prevMoney && prevMoney[c[1]] !== c[2];
      return el('div', { class: 'pm ' + c[1] + (c[2] ? ' on' : '') + (changed ? ' flash' : '') }, [el('span', { class: 'k', text: t(c[0]) }), el('span', { class: 'v', text: money(c[2]) })]);
    })).concat([m.vat ? el('p', { class: 'pvat', text: t('vat').replace('{v}', money(m.vat)) }) : null].filter(Boolean)));
    prevMoney = { in: m.paidIn, held: m.held, cr: m.creator, back: m.refunded, rev: m.revenue };
  }

  var COL = { seller: 1, team: 2, creator: 3 };
  function renderDiagram() {
    var lanes = $('#p-lanes');
    lanes.replaceChildren.apply(lanes, ['seller', 'team', 'creator'].map(function (r) { return el('span', { class: 'lane-' + r, text: st.lanes[r] }); }));
    var ol = $('#p-steps'), items = [], row = 1, lastPhase = 0;
    function addNode(n, which) {
      if (n.phase !== lastPhase) {
        items.push(el('li', { class: 'ph' + (which === 'whatif' ? ' wi' : ''), style: 'grid-row:' + row, text: (which === 'whatif' ? '' : n.phase + ' · ') + st.phases[n.phase] }));
        row++; lastPhase = n.phase;
      }
      var cls = 'nd lane-' + n.lane + (n.done ? ' done' : '') + (n.current ? ' cur' : '') + (n.skipped ? ' skip' : '') + (which === 'whatif' ? ' wi' : '');
      var label = (which === 'whatif' ? t('wiStep') + ' ' : t('step') + ' ') + n.n + ': ' + n.title;
      items.push(el('li', { class: cls, style: 'grid-row:' + row + ';grid-column:' + COL[n.lane], 'data-key': which + n.n },
        [el('button', { type: 'button', 'aria-label': label, 'aria-current': n.current ? 'step' : null, onclick: act(function () { api.goto(which, n.n); if (sheetOpen) toggleSheet(); }) },
          [el('span', { class: 'dot', html: n.done ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>' : null, text: n.done ? null : (which === 'whatif' ? '!' : String(n.n)) }),
           el('span', { class: 'lbl', text: n.title })])]));
      row++;
    }
    st.main.forEach(function (n) { addNode(n, 'main'); });
    st.whatif.forEach(function (n) { addNode(n, 'whatif'); });
    ol.replaceChildren.apply(ol, items);
    $('#p-note').replaceChildren(document.createTextNode(t('note') + ' '), el('a', { href: 'app.html', text: t('app') + ' →' }));
    drawLines();
    var cur = ol.querySelector('.nd.cur'), key = st.mode + st.idx;
    if (cur && key !== prevKey) {
      prevKey = key;
      var flow = $('#p-flow'), r = cur.getBoundingClientRect(), fr = flow.getBoundingClientRect();
      if (r.top < fr.top + 150 || r.bottom > fr.bottom - 20) flow.scrollTo({ top: flow.scrollTop + (r.top - fr.top) - fr.height / 2 + 40, behavior: 'smooth' });
    }
  }
  // Lines from each step to the next, curving where the work passes to another lane.
  function drawLines() {
    var diag = $('#p-diag'), svg = $('#p-lines'), box = diag.getBoundingClientRect();
    if (!box.width) return;
    function pt(key) {
      var li = diag.querySelector('[data-key="' + key + '"]'), d = li && li.querySelector('.dot');
      if (!d) return null;
      var r = d.getBoundingClientRect(), lr = li.querySelector('button').getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, top: r.top - box.top, bot: lr.bottom - box.top - 3 };
    }
    function path(a, b, cls) {
      if (!a || !b) return '';
      var y1 = a.bot + 2, y2 = b.top - 2, my = (y1 + y2) / 2;
      var dd = a.x === b.x ? 'M' + a.x + ' ' + y1 + 'L' + b.x + ' ' + y2 : 'M' + a.x + ' ' + y1 + 'C' + a.x + ' ' + my + ',' + b.x + ' ' + my + ',' + b.x + ' ' + y2;
      return '<path class="' + cls + '" d="' + dd + '"/>';
    }
    var out = '';
    for (var i = 0; i < st.main.length - 1; i++) {
      var a = st.main[i], b = st.main[i + 1];
      out += path(pt('main' + a.n), pt('main' + b.n), a.done && b.done ? 'l-done' : a.done && b.current ? 'l-done' : 'l-todo');
    }
    for (i = 0; i < st.whatif.length - 1; i++) {
      var c = st.whatif[i], e = st.whatif[i + 1];
      out += path(pt('whatif' + c.n), pt('whatif' + e.n), c.done && (e.done || e.current) ? 'l-done' : 'l-branch');
    }
    svg.setAttribute('height', diag.scrollHeight);
    svg.innerHTML = out;
  }

  function renderCaption() {
    if (!st) return;
    var count = $('#p-count'), who = $('#p-who');
    if (st.complete) count.textContent = t('done');
    else if (st.mode === 'whatif') count.textContent = t('wiStep') + ' · ' + st.idx + t('of') + st.total;
    else count.textContent = t('step') + ' ' + st.idx + t('of') + st.total;
    who.className = 'who' + (st.lane ? ' lane-' + st.lane : '');
    who.textContent = st.laneName || '';
    who.hidden = !st.lane;
    $('#p-text').textContent = st.offTrack ? t('offTrack') : st.caption;
    $('#p-why').textContent = st.offTrack ? '' : st.why;
    var sb = $('#p-sheet');
    sb.textContent = t('journey') + ' ' + (st.complete ? '✓' : st.idx + '/' + st.total) + (sheetOpen ? ' ▼' : ' ▲');
    sb.onclick = toggleSheet;

    var c = $('#p-ctl'), kids = [];
    var firstMain = st.mode === 'main' && st.idx === 1;
    kids.push(btn('dark', 'back', t('back'), act(function () { api.back(); }), { disabled: firstMain || null }));
    if (st.offTrack) {
      kids.push(btn('yellow', 'restart', t('restart'), act(function () { api.restart(); })));
    } else if (st.complete) {
      kids.push(btn('dark', 'restart', t('replay'), act(function () { api.restart(); })));
      kids.push(st.mode === 'main' ? btn('yellow', 'flag', t('whatif'), act(function () { api.whatIf(); }))
                                   : btn('yellow', 'back', t('toMain'), act(function () { api.goto('main', 14); })));
    } else {
      kids.push(autoT ? btn('dark', 'pause', t('pause'), stopAuto) : btn('dark', 'play', t('play'), startAuto));
      kids.push(btn('yellow', 'next', st.onStep ? t('next') : t('show'), act(function () { api.next(); })));
      if (st.canWhatIf && st.mode === 'main') kids.push(btn('dark wide', 'flag', t('whatif'), act(function () { api.whatIf(); })));
      if (st.mode === 'whatif') kids.push(btn('dark wide', 'back', t('toMain'), act(function () { api.goto('main', 14); })));
    }
    c.replaceChildren.apply(c, kids);
    document.documentElement.style.setProperty('--caph', $('#p-cap').offsetHeight + 'px');
  }

  function renderDevice() {
    var dev = $('#p-device'), laptop = st.role === 'team';
    dev.className = 'device ' + (laptop ? 'laptop' : 'phone');
    $('#p-chrome').textContent = t('chrome');
    frame.title = t('frame');
  }

  function toggleSheet() {
    sheetOpen = !sheetOpen;
    $('#p-flow').classList.toggle('open', sheetOpen);
    $('#p-sheet').setAttribute('aria-expanded', String(sheetOpen));
    if (st) renderCaption();
    if (sheetOpen) requestAnimationFrame(drawLines);
  }

  /* ---------- links to a step, keyboard and resizing ---------- */
  window.addEventListener('hashchange', function () {
    var m = location.hash.match(/^#\/(step|whatif)\/(\d+)/);
    if (!api || !m || !st) return;
    var md = m[1] === 'whatif' ? 'whatif' : 'main';
    if (st.mode !== md || st.idx !== +m[2]) { stopAuto(); api.goto(md, +m[2]); }
  });
  document.addEventListener('keydown', function (e) {
    if (!api || e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight') { stopAuto(); api.next(); }
    else if (e.key === 'ArrowLeft') { stopAuto(); api.back(); }
  });
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (st) { drawLines(); renderCaption(); } }, 120); });
})();
