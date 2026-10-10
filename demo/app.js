/* Brandবন্ধু demo: core and seller views.
   No backend. All data lives in this browser (localStorage). Everything shown is fictional.
   Creator, team and outreach views live in creator.js, team.js and outreach.js; the guided
   journey lives in journey.js. They all use the helpers exported on window.BB at the end.

   Two "worlds": the standalone demo (bb-demo-v3) and the journey (bb-journey-v1, opened by the
   player at /demo/ as app.html?world=journey&embed=1), which starts before the seller or Nusrat
   have joined.

   Deal flow (how sponsored content really works): the brand lists what to mention, the influencer
   shares a short plan (no finished video), the brand approves it, the influencer posts it inside their
   own content and submits proof (link + time of the mention), the brand checks the mention, and the
   fee is released once the post has stayed up for the hold period (72h, or 24h for stories and lives). */
(function () {
  'use strict';

  var D = window.BB_DATA;
  var BB = window.BB = { views: {}, tabs: {} };
  var H = 3600000;                        // one hour in ms
  var QS = new URLSearchParams(location.search);
  var WORLD = QS.get('world') === 'journey' ? 'journey' : 'demo';
  var EMBED = QS.get('embed') === '1' && window.parent !== window;
  var KEY = WORLD === 'journey' ? 'bb-journey-v1' : 'bb-demo-v3';
  var CR = 'nusrat';                      // the creator whose app the creator views show
  var CR_FEE = D.influencers.filter(function (i) { return i.id === CR; })[0].fee;   // her fee in the data, before she changes it
  var PF_RATE = 0.15, PF_MIN = 500, VAT_RATE = 0.15;
  var MAX_PICK = 5;
  var HELD = ['funded', 'accepted', 'plan', 'approved', 'live', 'disputed'];
  var STEPS = ['funded', 'accepted', 'plan', 'approved', 'live', 'paid'];
  var AVATAR_BG = ['#FFD6E4', '#FFE7A3', '#CDEBDA', '#D5DBFF', '#FFD9C2', '#E3D4F7'];
  var MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  var NEW_BRIEF = function () { return { title: '', product: '', format: 'mention', minSec: 30, preview: false, notes: '', offer: 10, days: 5 }; };

  /* ---------- tiny helpers ---------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;       // static SVG strings only
        else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { add(el, k); }); return; }
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  var ICONS = {
    check: '<path d="M5 12l5 5 9-10"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    tools: '<path d="M14.5 6.5a4 4 0 0 0-5.2 5.2L3 18l3 3 6.3-6.3a4 4 0 0 0 5.2-5.2l-2.7 2.7-2.3-.7-.7-2.3z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    play: '<path d="M8 5l11 7-11 7z"/>',
    pin: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12.5h2"/><path d="M3 9.5h18"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14-4M4 13a8 8 0 0 0 14 4"/><path d="M5 4v3h3M19 20v-3h-3"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    facebook: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14c2.8.2 4.5 2.2 4.5 5"/>',
    tiktok: '<path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'
  };
  function icon(name, size, cls) {
    return h('span', {
      class: cls || null, 'aria-hidden': 'true', style: 'display:inline-flex',
      html: '<svg width="' + (size || 18) + '" height="' + (size || 18) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>'
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }

  /* ---------- deterministic randomness (for fake results and proofs) ---------- */
  function rng(seed) {
    var a = 2166136261;
    for (var i = 0; i < seed.length; i++) { a ^= seed.charCodeAt(i); a = Math.imul(a, 16777619); }
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randStr(r, n, chars) { var s = ''; for (var i = 0; i < n; i++) s += chars.charAt(Math.floor(r() * chars.length)); return s; }
  function mmss(sec) { return ('0' + Math.floor(sec / 60)).slice(-2) + ':' + ('0' + (sec % 60)).slice(-2); }

  /* ---------- money, pricing ---------- */
  function price(fee) {
    var pf = Math.max(PF_MIN, Math.round(fee * PF_RATE));
    var vat = Math.round(pf * VAT_RATE);
    return { fee: fee, pf: pf, vat: vat, total: fee + pf + vat };
  }
  function priceSum(fees) {
    return fees.reduce(function (s, f) {
      var p = price(f);
      return { fee: s.fee + p.fee, pf: s.pf + p.pf, vat: s.vat + p.vat, total: s.total + p.total };
    }, { fee: 0, pf: 0, vat: 0, total: 0 });
  }
  function makeFinal(inf, fee, pf, seed) {
    var r = rng(seed);
    var cpo = 230 + r() * 70;
    var orders = Math.max(4, Math.round((fee + pf) / cpo));
    var conv = 0.038 + r() * 0.012;
    var ctr = 0.019 + r() * 0.008;
    var clicks = Math.round(orders / conv);
    var reach = Math.round(clicks / ctr / 10) * 10;
    var cap = Math.round(inf.followers * 1.4);
    if (reach > cap) {
      reach = cap; clicks = Math.round(reach * ctr);
      orders = Math.max(3, Math.round(clicks * conv));
    }
    return { reach: reach, clicks: clicks, orders: orders };
  }
  // What the influencer submits after posting: a link to their own post, and for videos and lives
  // the time range where the sponsor is mentioned. Stories have no link, so proof is a recording.
  function makeProof(inf, format, minSec, seed) {
    var r = rng('proof' + seed), hd = inf.handle.replace('@', ''), id = randStr(r, 11, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    var ref = null;
    if (format !== 'story') {
      ref = { facebook: 'facebook.com/watch/?v=' + randStr(r, 15, '0123456789'), youtube: 'youtu.be/' + id,
              tiktok: 'tiktok.com/@' + hd + '/video/' + randStr(r, 19, '0123456789'), instagram: 'instagram.com/reel/' + id }[inf.platform];
    }
    var from = 0, len = 0;
    if (format === 'mention' || format === 'live') { from = 20 + Math.floor(r() * 180); len = (minSec || 30) + Math.floor(r() * 21); }
    return { ref: ref, from: from, to: from + len, len: len };
  }
  function codeFor(inf, offer) { return inf.nameEn.split(' ')[0].toUpperCase() + offer; }
  function linkFor(brand, inf) { return 'bb.link/' + brand.slug + '-' + inf.nameEn.split(' ')[0].toLowerCase(); }
  function holdOf(format) { return D.formats[format || 'mention'].hold; }
  function hold(d) { return d.holdH || 72; }

  /* ---------- state ---------- */
  var state;
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var s = JSON.parse(raw); if (s && s.v === 3 && s.world === WORLD && Array.isArray(s.campaigns)) return s; }
    } catch (e) { /* private mode etc: fall through to a fresh seed */ }
    return seed();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* in-memory only */ }
    hooks.save.forEach(function (f) { f(); });
  }
  var hooks = { save: [], render: [], reset: [] };
  function syncFee() { byId(CR).fee = state.cr.fee || CR_FEE; }

  function seed() { return WORLD === 'journey' ? seedJourney() : seedDemo(); }

  // People and requests our team works with, shared by both worlds.
  function seedTeam(T, s) {
    s.prospects = (D.prospects || []).map(function (p) { return Object.assign({}, p, { at: T(p.ago) }); });
    s.brandQueue = (D.brandApplicants || []).map(function (a) { return Object.assign({}, a, { at: T(a.ago), status: 'review' }); });
    s.requests = [
      { id: 'r-mezban', brandId: 'chattala-bites', budget: 'b20', phone: '018•• •••374', at: T(60), status: 'converted', picks: ['rafi', 'tahmid', 'farzana', 'rakib'] },
      { id: 'r-surma', brandId: 'sylhet-glow', budget: 'b20', phone: '017•• •••905', at: T(40), status: 'converted', picks: ['priya', 'tasnim', 'tania', 'lamia', 'nazia'] }
    ];
    return s;
  }
  function baseState(lang) {
    return { v: 3, world: WORLD, lang: lang, offset: 0, brandId: 'dhaka-threads', shortlist: [], brief: NEW_BRIEF(), campaigns: [],
             cr: { status: 'verified', connected: true, formats: ['mention', 'reel', 'story'], wallet: '017•• •••219', rating: 4.8, jobs: 31 },
             seller: { stage: 'customer' }, prospects: [], requests: [], j: { dealId: null, campaignId: null, seen: 0, seenW: 0 } };
  }
  // The journey world: nobody has joined yet. Other brands' campaigns run in the background.
  function seedJourney() {
    var demo = seedDemo(), t0 = Date.now();
    var lang = /^bn/i.test(navigator.language || '') ? 'bn' : 'en';
    var s = baseState(lang);
    s.campaigns = demo.campaigns.filter(function (c) { return c.brandId !== 'dhaka-threads'; });
    s.cr = { status: 'prospect', connected: false, formats: ['mention', 'reel', 'story'], wallet: '017•• •••219', rating: 0, jobs: 0 };
    s.seller = { stage: 'stranger' };
    return seedTeam(function (hoursAgo) { return t0 - hoursAgo * H; }, s);
  }

  function seedDemo() {
    var t0 = Date.now();
    var T = function (hoursAgo) { return t0 - hoursAgo * H; };
    var camps = [];

    function deal(cid, brand, meta, spec, offer) {
      var inf = byId(spec[0]), st = spec[1], at = spec[2], o = spec[3] || {};
      var fee = o.fee || inf.fee, p = price(fee);
      var d = {
        id: cid + '-' + inf.id, infId: inf.id, fee: fee, pf: p.pf, vat: p.vat, total: p.total,
        stage: st, holdH: holdOf(meta.format), t: { fundedAt: T(at[0]) },
        final: o.final || makeFinal(inf, fee, p.pf, cid + inf.id),
        code: codeFor(inf, offer), link: linkFor(brand, inf), changeRequested: false, revised: false, verified: false
      };
      if (at[1] != null) d.t.acceptedAt = T(at[1]);
      if (st === 'plan') d.t.planAt = T(at[2]);
      if (st === 'approved') { d.t.planAt = T(at[2]); d.t.approvedAt = T(at[3]); }
      if (st === 'live' || st === 'paid') {
        d.t.planAt = T(at[2]); d.t.approvedAt = T(at[3]); d.t.liveAt = T(at[4]);
        d.proof = makeProof(inf, meta.format, meta.minSec, cid + inf.id);
        d.verified = !!o.verified || st === 'paid';
        if (st === 'paid') d.t.paidAt = d.t.liveAt + d.holdH * H;
      }
      if (st === 'refunded') d.t.refundedAt = T(o.refundedAgo);
      return d;
    }
    function campaign(id, brandId, title, product, format, minSec, preview, specs) {
      var brand = byBrand(brandId), meta = { format: format, minSec: minSec };
      var ds = specs.map(function (s) { return deal(id, brand, meta, s, 10); });
      var created = Math.min.apply(null, ds.map(function (d) { return d.t.fundedAt; }));
      camps.push({ id: id, brandId: brandId, title: title, product: product, format: format, minSec: minSec, preview: preview, notes: '', offer: 10, days: 5, createdAt: created, deals: ds });
    }

    // The Eid case study from the landing page: 5 influencers x ৳8,000 = ৳40,000 + our 15% = ৳46,000,
    // 184 orders, ৳250 per order once every deal has finished. Fast-forward to see it.
    campaign('c-eid', 'dhaka-threads', { bn: 'ঈদ কালেকশন', en: 'Eid collection' }, D.brands[0].product, 'reel', 30, false, [
      ['nusrat', 'live', [140, 138, 130, 124, 31], { final: { reach: 36560, clicks: 900, orders: 40 } }],
      ['mim', 'live', [140, 138, 130, 124, 58], { final: { reach: 38000, clicks: 810, orders: 36 }, verified: true }],
      ['jannat', 'plan', [140, 137, 5], { final: { reach: 37500, clicks: 850, orders: 38 } }],
      ['imran', 'accepted', [140, 30], { final: { reach: 36000, clicks: 770, orders: 34 } }],
      ['anika', 'approved', [140, 136, 100, 20], { final: { reach: 37940, clicks: 810, orders: 36 } }]
    ]);
    campaign('c-winter', 'dhaka-threads', { bn: 'শীতের সেল', en: 'Winter sale' }, { bn: 'শীতের জ্যাকেট আর শাল', en: 'Winter jackets and shawls' }, 'story', 0, false, [
      ['mim', 'paid', [1680, 1678, 1670, 1664, 1600], { final: { reach: 29000, clicks: 680, orders: 30 } }],
      ['rima', 'refunded', [1680, 1678], { fee: 9000, refundedAgo: 1500 }]
    ]);
    campaign('c-menu', 'chattala-bites', { bn: 'মেজবান বক্স লঞ্চ', en: 'Mezban box launch' }, D.brands[1].product, 'mention', 45, false, [
      ['rafi', 'live', [48, 46, 40, 36, 12]],
      ['tahmid', 'funded', [3]]
    ]);
    campaign('c-face', 'sylhet-glow', { bn: 'ফেসওয়াশ লঞ্চ', en: 'Face wash launch' }, D.brands[2].product, 'reel', 0, true, [
      ['priya', 'accepted', [30, 28]],
      ['tasnim', 'funded', [2]]
    ]);

    var s = baseState('bn');
    s.campaigns = camps;
    s.requests = [];
    seedTeam(T, s);
    s.requests.push({ id: 'r-threads', brandId: 'dhaka-threads', budget: 'b50', phone: '018•• •••482', at: T(150), status: 'converted', picks: ['nusrat', 'mim', 'jannat', 'rima', 'anika'] });
    return s;
  }

  function byId(id) { return D.influencers.filter(function (i) { return i.id === id; })[0]; }
  function byBrand(id) { return D.brands.filter(function (b) { return b.id === id; })[0]; }
  function brand() { return byBrand(state.brandId) || D.brands[0]; }
  function campaignById(id) { return state.campaigns.filter(function (c) { return c.id === id; })[0]; }
  // Nusrat is only in the directory once our team has verified her; everyone else already is.
  function isMember(id) { return id !== CR || state.cr.status === 'verified'; }
  function findDeal(id) {
    for (var k = 0; k < state.campaigns.length; k++) {
      var c = state.campaigns[k], d = c.deals.filter(function (x) { return x.id === id; })[0];
      if (d) return { c: c, d: d };
    }
    return null;
  }

  function now() { return Date.now() + state.offset; }
  function L(bn, en) { return state.lang === 'bn' ? bn : en; }
  function txt(x) { return typeof x === 'string' ? x : x[state.lang]; }
  function lbl(map, key) { return map[key][state.lang]; }
  function infName(i) { return L(i.nameBn, i.nameEn); }
  function brandName(b) { return L(b.nameBn, b.nameEn); }

  /* ---------- number and date formatting (English digits in both languages) ---------- */
  function money(n) { return '৳' + Math.round(n).toLocaleString('en-US'); }
  function num(n) { return Math.round(n).toLocaleString('en-US'); }
  function trim(x) { return String(+x.toFixed(2)); }
  function compact(n) {
    if (state.lang === 'bn') {
      if (n >= 100000) return trim(n / 100000) + ' লাখ';
      if (n >= 1000) return trim(n / 1000) + ' হাজার';
      return String(n);
    }
    if (n >= 1e6) return trim(n / 1e6) + 'M';
    if (n >= 1000) return trim(n / 1000) + 'K';
    return String(n);
  }
  function pct(x) { return x.toFixed(1) + '%'; }
  function dateStr(ts) {
    var d = new Date(ts);
    return state.lang === 'bn' ? d.getDate() + ' ' + MONTHS_BN[d.getMonth()] : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  function ago(ts) {
    var m = Math.floor((now() - ts) / 60000);
    if (m < 1) return L('এইমাত্র', 'just now');
    if (m < 60) return L(m + ' মিনিট আগে', m + ' min ago');
    var hr = Math.floor(m / 60);
    if (hr < 48) return L(hr + ' ঘণ্টা আগে', hr + 'h ago');
    return dateStr(ts);
  }
  function initials(i) { return L(i.nameBn.charAt(0), i.nameEn.split(' ').slice(0, 2).map(function (w) { return w.charAt(0); }).join('')); }
  function avatar(i, cls) {
    var idx = D.influencers.indexOf(i) % AVATAR_BG.length;
    return h('div', { class: 'avatar ' + (cls || ''), style: 'background:' + AVATAR_BG[idx], 'aria-hidden': 'true' }, initials(i));
  }
  function audText(i) {
    var a = i.aud, c = lbl(D.cities, i.city);
    if (a.type === 'local') return L('অডিয়েন্স: বেশিরভাগই ' + c + 'র (' + a.pct + '%)', 'Audience: mostly in ' + c + ' (' + a.pct + '%)');
    var who = { f: L('মেয়েরা', 'women'), m: L('ছেলেরা', 'men'), mix: L('ছেলে-মেয়ে দুজনই', 'men and women') }[a.type];
    return L('অডিয়েন্স: ' + a.age + ' বছরের ' + who + ' (' + a.pct + '%)', 'Audience: ' + who + ' ' + a.age + ' (' + a.pct + '%)');
  }

  /* ---------- deal logic ---------- */
  function metrics(d, at) {
    if (!d.t.liveAt) return { reach: 0, clicks: 0, orders: 0, x: 0 };
    var x = d.stage === 'paid' ? 1 : Math.max(0, Math.min(1, (at - d.t.liveAt) / H / hold(d)));
    var p = 1 - Math.pow(1 - x, 3);
    return { reach: Math.round(d.final.reach * p), clicks: Math.floor(d.final.clicks * p), orders: Math.floor(d.final.orders * p), x: x };
  }
  function tick() {
    var changed = false, n = now();
    state.campaigns.forEach(function (c) {
      c.deals.forEach(function (d) {
        if (d.stage === 'live' && n - d.t.liveAt >= hold(d) * H) { d.stage = 'paid'; d.verified = true; d.t.paidAt = d.t.liveAt + hold(d) * H; changed = true; }
      });
    });
    if (changed) save();
    return changed;
  }
  function planWord(c) { return c.preview ? L('ড্রাফট', 'draft') : L('প্ল্যান', 'plan'); }
  function stageText(c, d) {
    switch (d.stage) {
      case 'funded': return L('ইনফ্লুয়েন্সারের উত্তরের অপেক্ষা', 'Waiting for the influencer to accept');
      case 'accepted': return d.changeRequested && !d.revised ? L('নতুন ' + planWord(c) + 'র অপেক্ষা', 'Waiting for the revised ' + planWord(c)) : L(planWord(c) + 'র অপেক্ষা', 'Waiting for the ' + planWord(c));
      case 'plan': return L('আপনার অ্যাপ্রুভালের অপেক্ষা', 'Waiting for your approval');
      case 'approved': return L('ইনফ্লুয়েন্সারের পোস্টের অপেক্ষা', 'Waiting for the influencer to post');
      case 'live': return L('পোস্ট হয়েছে, ' + hold(d) + ' ঘণ্টা চলছে', 'Posted, ' + hold(d) + ' hours running');
      case 'disputed': return L('সমস্যা জানানো হয়েছে, পেমেন্ট আটকে আছে', 'Problem reported, payout on hold');
      case 'paid': return L('শেষ, ইনফ্লুয়েন্সার টাকা পেয়েছেন', 'Done, influencer paid');
      default: return L('টাকা ফেরত', 'Refunded');
    }
  }
  function stageTone(d) {
    return { plan: 'pink', live: 'green', paid: 'navy', refunded: 'red', disputed: 'red' }[d.stage] || 'cream';
  }
  function stepLabel(s, c) {
    return { funded: L('টাকা জমা', 'Funded'), accepted: L('ইনফ্লুয়েন্সার রাজি', 'Accepted'),
             plan: c.preview ? L('ড্রাফট', 'Draft') : L('প্ল্যান', 'Plan'), approved: c.preview ? L('ড্রাফট অ্যাপ্রুভ', 'Draft approved') : L('প্ল্যান অ্যাপ্রুভ', 'Plan approved'),
             live: L('পোস্ট হয়েছে', 'Posted'), paid: L('পেমেন্ট', 'Paid') }[s];
  }
  function advance(c, d, to) {
    var n = now(), inf = byId(d.infId);
    d.stage = to;
    if (to === 'accepted' && !d.changeRequested) d.t.acceptedAt = n;
    if (to === 'plan') d.t.planAt = n;
    if (to === 'approved') d.t.approvedAt = n;
    if (to === 'live') { d.t.liveAt = n; d.proof = makeProof(inf, c.format, c.minSec, d.id); d.verified = false; }
    if (to === 'disputed') d.t.disputedAt = n;
    if (to === 'refunded') d.t.refundedAt = n;
    save();
  }
  // Our team's decision on a reported problem: refund the brand, or let the payout carry on.
  function resolveDispute(c, d, how) {
    d.resolved = how;
    if (how === 'refund') advance(c, d, 'refunded');
    else { d.verified = true; d.stage = 'live'; save(); }
  }
  function fmtHint(f) {
    return { mention: L('ইনফ্লুয়েন্সার নিজের নিয়মিত ভিডিওতেই আপনার পণ্যের কথা বলেন। আলাদা ভিডিও বানাতে হয় না।', 'The influencer mentions your product inside their regular video. No separate video is made.'),
             reel: L('আপনার পণ্য নিয়ে আলাদা রিল বা পোস্ট। চাইলে ড্রাফট আগে দেখতে পারেন।', 'A separate reel or post about your product. You can ask to see a draft first.'),
             story: L('স্টোরি 24 ঘণ্টা থাকে, তাই 24 ঘণ্টা পর টাকা ছাড়া হয়।', 'Stories last 24 hours, so the fee is released after 24 hours.'),
             live: L('ইনফ্লুয়েন্সার লাইভে আপনার পণ্যের কথা বলেন। রেকর্ডিং থাকে, 24 ঘণ্টা পর টাকা ছাড়া হয়।', 'The influencer mentions your product during a live. The recording stays, and the fee is released after 24 hours.') }[f];
  }
  function planText(c, d) {
    var p = '“' + txt(c.product) + '”', sec = c.minSec || 30, days = c.days || 5;
    switch (c.format) {
      case 'mention': return L('আমার পরের ভিডিওর শুরুর দিকে কমপক্ষে ' + sec + ' সেকেন্ড ' + p + ' নিয়ে বলব, নিজের ভাষায়। কোড ' + d.code + ' বলব, লিংক ডেসক্রিপশনে দেব। ' + days + ' দিনের মধ্যে পোস্ট করব।',
                              'In my next video I will talk about ' + p + ' for at least ' + sec + ' seconds near the start, in my own words. I will say the code ' + d.code + ' and put the link in the description. Posting within ' + days + ' days.');
      case 'story': return L(p + ' নিয়ে স্টোরি দেব, লিংক স্টিকার আর কোড ' + d.code + ' সহ। ' + days + ' দিনের মধ্যে পোস্ট করব।', 'I will post a story about ' + p + ' with the link sticker and the code ' + d.code + '. Posting within ' + days + ' days.');
      case 'live': return L('পরের লাইভে কমপক্ষে ' + sec + ' সেকেন্ড ' + p + ' নিয়ে বলব, কোড ' + d.code + ' সহ। ' + days + ' দিনের মধ্যে।', 'In my next live I will talk about ' + p + ' for at least ' + sec + ' seconds, with the code ' + d.code + '. Within ' + days + ' days.');
      default: return L(p + ' নিয়ে একটা রিল বানাব। কোড ' + d.code + ', লিংক বায়োতে। ' + days + ' দিনের মধ্যে পোস্ট করব।', 'I will make a reel about ' + p + '. Code ' + d.code + ', link in my bio. Posting within ' + days + ' days.');
    }
  }
  function caption(c, d) {
    var p = txt(c.product);
    return L(p + ' নিয়ে নতুন রিল! কোড ' + d.code + ' দিলে ' + c.offer + '% ছাড়। অর্ডার করতে লিংকে ক্লিক করুন।',
             'New reel: ' + p + '! Use code ' + d.code + ' for ' + c.offer + '% off. Tap the link to order.');
  }

  /* ---------- ui state and routing ---------- */
  var ui = { find: { platform: 'all', cat: 'all', city: 'all', maxFee: 0, sort: 'rating' } };
  var lastRoute = null;

  function route() {
    var parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
    return { name: parts[0] || 'home', id: parts[1] || null, parts: parts };
  }
  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

  function roleOf(r) { return r.name === 'cr' ? 'creator' : r.name === 'team' ? 'team' : 'seller'; }
  function render() {
    tick();
    var r = route(), key = r.parts.join('/');
    var same = key === lastRoute, y = window.scrollY;
    var view, title, role = roleOf(r);
    // A seller who is not set up yet only has the group post, the chat and the sign-up.
    if (role === 'seller' && state.seller.stage !== 'customer' && r.name !== 's') {
      var st = state.seller.stage, to = st === 'stranger' ? 'post' : (st === 'requested' || (st === 'shortlisted' && !state.seller.opened)) ? 'chat' : 'join';
      r = { name: 's', id: to, parts: ['s', to] };
    }
    var bar = null;   // views outside our app (social feed, chats) bring their own top bar
    if (BB.views[r.name]) { var out = BB.views[r.name](r); view = out[0]; title = out[1]; bar = out[2] || null; }
    else switch (r.name) {
      case 'find': view = viewFind(); title = L('ইনফ্লুয়েন্সার খুঁজুন', 'Find influencers'); break;
      case 'i': view = viewProfile(r.id); title = L('প্রোফাইল', 'Profile'); break;
      case 'brief': view = viewBrief(); title = L('ব্রিফ আর দাম', 'Brief and price'); break;
      case 'pay': view = viewPay(); title = L('টাকা জমা', 'Fund the deal'); break;
      case 'c': view = viewCampaign(r.id); title = L('ক্যাম্পেইন', 'Campaign'); break;
      default: view = viewHome(); title = L('হোম', 'Home');
    }
    var app = $('#app');
    app.replaceChildren.apply(app, [bar || header(role), EMBED ? null : h('div', { class: 'banner-wrap' }, h('div', { class: 'banner', role: 'note' }, icon('shield'),
      L('ডেমো ভার্সন: সব ইনফ্লুয়েন্সার আর ব্র্যান্ড কাল্পনিক, আসল টাকা লেনদেন হয় না। ডেটা শুধু আপনার ব্রাউজারে থাকে।',
        'Demo version: every influencer and brand is fictional, no real money moves, and your data stays in this browser.'))),
      tabs(r, role), h('main', { id: 'main', class: 'container' + (role === 'team' ? ' wide' : ''), tabindex: '-1' }, view)].filter(Boolean));
    document.body.setAttribute('data-role', role);
    document.documentElement.lang = state.lang;
    document.title = 'Brandবন্ধু ' + L('ডেমো', 'Demo') + ' — ' + title;
    if (same) window.scrollTo(0, y); else window.scrollTo(0, 0);
    if (!same || document.activeElement === document.body) { var m = $('#main'); if (m) m.focus({ preventScroll: true }); }
    lastRoute = key;
    hooks.render.forEach(function (f) { f(r, same); });
  }

  var ROLE_HOME = { seller: '#/', creator: '#/cr', team: '#/team' };
  function roleName(role) {
    return { seller: L('সেলার', 'Seller'), creator: L('ইনফ্লুয়েন্সার', 'Influencer'), team: L('টিম কনসোল', 'Team console') }[role];
  }
  function header(role) {
    return h('header', { class: 'topbar' }, h('div', { class: 'topbar-in' + (role === 'team' ? ' wide' : '') },
      h('a', { href: ROLE_HOME[role], class: 'logo', 'aria-label': L('Brandবন্ধু ডেমো হোম', 'Brandবন্ধু demo home') },
        h('span', { 'aria-hidden': 'true', style: 'display:inline-flex', html: '<svg width="32" height="32" viewBox="0 0 40 40"><circle cx="15" cy="20" r="12" fill="#C2185B"/><circle cx="25" cy="20" r="12" fill="#F5B700" fill-opacity="0.92"/></svg>' }),
        h('span', { class: 'logo-t' }, 'Brand', h('span', { class: 'logo-b' }, 'বন্ধু')),
        h('span', { class: 'pill' }, EMBED ? roleName(role) : L('ডেমো', 'Demo'))),
      EMBED ? null : h('div', { class: 'top-actions' },
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', lang: state.lang === 'bn' ? 'en' : 'bn', onclick: toggleLang }, state.lang === 'bn' ? 'English' : 'বাংলা'),
        h('button', { class: 'btn btn-ghost btn-sm', type: 'button', 'aria-haspopup': 'dialog', 'aria-label': L('ডেমো টুলস', 'Demo tools'), onclick: openTools }, icon('tools'), h('span', { class: 'hide-sm' }, L('ডেমো টুলস', 'Demo tools'))))));
  }
  function tabs(r, role) {
    if (role !== 'seller') return BB.tabs[role] ? BB.tabs[role](r) : null;
    if (r.name === 's') return null;
    var cur = { home: 'home', c: 'home', find: 'find', i: 'find', brief: 'brief', pay: 'brief' }[r.name] || 'home';
    var defs = [['#/', 'home', L('হোম', 'Home'), 'home'], ['#/find', 'find', L('খুঁজুন', 'Find'), 'search'], ['#/brief', 'brief', L('শর্টলিস্ট', 'Shortlist'), 'list']];
    return tabBar(defs, cur);
  }
  // defs: [href, key, label, icon, badge?]
  function tabBar(defs, cur) {
    return h('nav', { class: 'tabs', 'aria-label': L('মূল মেনু', 'Main') }, defs.map(function (t) {
      if (t[1] !== 'brief') return h('a', { href: t[0], 'aria-current': t[1] === cur ? 'page' : null }, icon(t[3], 22), t[2],
        t[4] ? h('span', { class: 'count' }, t[4]) : null);
      return h('a', { href: t[0], 'aria-current': t[1] === cur ? 'page' : null }, icon(t[3], 22), t[2],
        t[1] === 'brief' && state.shortlist.length ? h('span', { class: 'count', 'aria-label': L(state.shortlist.length + ' জন বাছা হয়েছে', state.shortlist.length + ' selected') }, state.shortlist.length) : null);
    }));
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('on'); }, 3200);
  }
  function toggleLang() { state.lang = state.lang === 'bn' ? 'en' : 'bn'; save(); render(); }

  /* ---------- shared pieces ---------- */
  function priceBlock(fees, names) {
    var p = priceSum(fees);
    return h('div', { class: 'price' },
      names ? names.map(function (n, k) { return h('div', { class: 'sub' }, h('span', null, n), h('span', null, money(fees[k]))); }) : null,
      h('div', null, h('span', null, L('ইনফ্লুয়েন্সার ফি', 'Influencer fees')), h('span', null, money(p.fee))),
      h('div', null, h('span', null, L('Brandবন্ধু ফি (15%, প্রতি ডিলে কমপক্ষে ' + money(PF_MIN) + ')', 'Brandবন্ধু fee (15%, minimum ' + money(PF_MIN) + ' per deal)')), h('span', null, money(p.pf))),
      h('div', null, h('span', null, L('ভ্যাট (আমাদের ফির উপর 15%)', 'VAT (15% on our fee)')), h('span', null, money(p.vat))),
      h('div', { class: 'total' }, h('span', null, L('মোট', 'Total')), h('span', null, money(p.total))));
  }
  function escrowSteps(hours) {
    return h('ol', { class: 'ledger' },
      [L('আপনি টাকা জমা দেন', 'You pay in'),
       L('লাইসেন্সপ্রাপ্ত পেমেন্ট পার্টনার টাকা রাখে। Brandবন্ধু নিজে টাকা ধরে না।', 'A licensed payment partner holds the money. Brandবন্ধু never holds it.'),
       L('ইনফ্লুয়েন্সার নিজের কনটেন্টে বলেন আর প্রুফ দেন, আপনি উল্লেখটা দেখে নেন। পোস্ট টানা ' + hours + ' ঘণ্টা থাকলে ইনফ্লুয়েন্সার টাকা পান। পোস্ট না হলে পুরো টাকা ফেরত।',
         'The influencer mentions you in their own content and shares proof, and you check the mention. If the post stays up for ' + hours + ' hours, they are paid. No post, full refund.')]
      .map(function (s, k) { return h('li', null, h('span', { class: 'chip chip-pink', style: 'min-width:28px;justify-content:center' }, k + 1), h('span', null, s)); }));
  }
  function pageHead(title, sub, backHref, backLabel) {
    return h('div', { style: 'display:flex;flex-direction:column;gap:6px' },
      backHref ? h('a', { href: backHref, class: 'small', style: 'display:inline-flex;gap:6px;align-items:center;font-weight:600' }, icon('back', 16), backLabel) : null,
      h('h1', null, title), sub ? h('p', { class: 'muted' }, sub) : null);
  }
  function emptyCard(msg, cta, href) {
    return h('div', { class: 'card empty' }, h('p', null, msg), h('a', { class: 'btn', href: href }, cta));
  }
  function kv(label, value) { return h('div', { class: 'kv small' }, h('span', { class: 'muted' }, label), typeof value === 'object' && value && value.nodeType ? value : h('span', null, value)); }

  /* ---------- views: home ---------- */
  function viewHome() {
    var b = brand();
    var camps = state.campaigns.filter(function (c) { return c.brandId === b.id; }).sort(function (a, c) { return c.createdAt - a.createdAt; });
    var deals = camps.reduce(function (a, c) { return a.concat(c.deals); }, []);
    var n = now();
    var active = deals.filter(function (d) { return d.stage !== 'paid' && d.stage !== 'refunded'; }).length;
    var held = deals.filter(function (d) { return HELD.indexOf(d.stage) >= 0; }).reduce(function (s, d) { return s + d.total; }, 0);
    var orders = deals.reduce(function (s, d) { return s + metrics(d, n).orders; }, 0);
    var paid = deals.filter(function (d) { return d.stage === 'paid'; });
    var pOrders = paid.reduce(function (s, d) { return s + d.final.orders; }, 0);
    var pSpend = paid.reduce(function (s, d) { return s + d.fee + d.pf; }, 0);
    var needs = [];
    camps.forEach(function (c) { c.deals.forEach(function (d) {
      if (d.stage === 'plan') needs.push({ c: c, d: d, why: L('অ্যাপ্রুভ করুন', 'approve') });
      else if (d.stage === 'live' && !d.verified) needs.push({ c: c, d: d, why: L('উল্লেখ দেখুন', 'check mention') });
    }); });

    return h('div', { style: 'display:contents' },
      h('div', { style: 'display:flex;flex-direction:column;gap:8px' },
        h('div', { class: 'chips' }, h('span', { class: 'chip chip-cream' }, L('ডেমো ব্র্যান্ড', 'Demo brand')),
          h('span', { class: 'chip chip-green' }, icon('shield', 14), L('ভেরিফায়েড ব্র্যান্ড', 'Verified brand'))),
        h('h1', null, brandName(b)),
        h('p', { class: 'muted' }, h('span', { class: 'chip', style: 'margin-right:8px' }, icon('facebook', 14), L('Facebook পেজ', 'Facebook page')), b.fb + ' · ' + L(compact(b.fans) + ' ফলোয়ার', compact(b.fans) + ' followers'))),
      h('div', { class: 'stat-grid' },
        statCard(L('চলমান ডিল', 'Active deals'), num(active)),
        statCard(L('জমা আছে (পেমেন্ট পার্টনারের কাছে)', 'Held by the payment partner'), money(held)),
        statCard(L('কোড থেকে অর্ডার', 'Orders from codes'), num(orders)),
        statCard(L('প্রতি অর্ডারে খরচ', 'Cost per order'), pOrders ? money(pSpend / pOrders) : '—', L('শেষ হওয়া ডিল থেকে, আমাদের ফি সহ', 'From finished deals, incl. our fee'))),
      needs.length ? h('div', { class: 'panel attn' },
        h('strong', null, L('আপনার দেখার অপেক্ষায় ' + needs.length + 'টা', needs.length + ' waiting for you')),
        h('div', { class: 'row' }, needs.map(function (x) {
          return h('a', { class: 'btn btn-sm', href: '#/c/' + x.c.id }, infName(byId(x.d.infId)) + ' · ' + x.why, icon('arrow', 16));
        }))) : null,
      h('a', { class: 'btn btn-yellow', href: '#/find', style: 'align-self:flex-start' }, icon('plus', 20), L('নতুন ক্যাম্পেইন শুরু করুন', 'Start a new campaign')),
      h('h2', null, L('আপনার ক্যাম্পেইন', 'Your campaigns')),
      camps.length ? h('div', { class: 'grid' }, camps.map(campaignCard)) : emptyCard(L('এখনো কোনো ক্যাম্পেইন নেই।', 'No campaigns yet.'), L('ইনফ্লুয়েন্সার খুঁজুন', 'Find influencers'), '#/find'),
      h('p', { class: 'muted small' }, L('এটা একটা ডেমো। আপনার ব্রাউজারেই সব ডেটা থাকে, কোনো সার্ভারে যায় না। ডেমো টুলস থেকে সময় এগিয়ে নেওয়া বা সব ডেটা রিসেট করা যায়।',
        'This is a demo. All data stays in your browser and nothing is sent to a server. Use Demo tools to fast-forward time or reset everything.')));
  }
  function statCard(label, value, sub) {
    return h('div', { class: 'card', style: 'gap:4px' }, h('span', { class: 'small muted' }, label), h('span', { class: 'big' }, value), sub ? h('span', { class: 'tiny muted' }, sub) : null);
  }
  function campaignCard(c) {
    var total = c.deals.reduce(function (s, d) { return s + d.total; }, 0);
    var live = c.deals.filter(function (d) { return d.stage === 'live'; }).length;
    var done = c.deals.filter(function (d) { return d.stage === 'paid' || d.stage === 'refunded'; }).length;
    var wait = c.deals.length - live - done;
    return h('a', { class: 'card card-link', href: '#/c/' + c.id },
      h('div', { class: 'kv' }, h('h3', null, txt(c.title)), h('span', { class: 'small muted' }, dateStr(c.createdAt))),
      h('div', { class: 'chips' }, h('span', { class: 'chip chip-cream' }, lbl(D.formats, c.format))),
      h('div', { class: 'row' }, c.deals.map(function (d) {
        return h('span', { 'aria-hidden': 'true', title: infName(byId(d.infId)) }, avatar(byId(d.infId), 'avatar-sm'));
      })),
      h('div', { class: 'chips' },
        live ? h('span', { class: 'chip chip-green' }, L(live + ' পোস্ট হয়েছে', live + ' posted')) : null,
        wait ? h('span', { class: 'chip chip-cream' }, L(wait + ' অপেক্ষায়', wait + ' in progress')) : null,
        done ? h('span', { class: 'chip chip-navy' }, L(done + ' শেষ', done + ' finished')) : null),
      h('div', { class: 'kv small' }, h('span', { class: 'muted' }, L(c.deals.length + ' জন ইনফ্লুয়েন্সার', c.deals.length + ' influencers')), h('strong', null, money(total))));
  }

  /* ---------- views: find ---------- */
  var SORTERS = {
    rating: function (a, b) { return b.rating - a.rating || b.followers - a.followers; },
    fee: function (a, b) { return a.fee - b.fee; },
    followers: function (a, b) { return b.followers - a.followers; }
  };
  function filtered() {
    var f = ui.find;
    return D.influencers.filter(function (i) {
      return isMember(i.id) && (f.platform === 'all' || i.platform === f.platform) && (f.cat === 'all' || i.category === f.cat) &&
             (f.city === 'all' || i.city === f.city) && (!f.maxFee || i.fee <= f.maxFee);
    }).sort(SORTERS[f.sort]);
  }
  function select(id, label, opts, value, onchange) {
    return h('div', { class: 'field' }, h('label', { for: id }, label),
      h('select', { id: id, onchange: function (e) { onchange(e.target.value); } },
        opts.map(function (o) { return h('option', { value: o[0], selected: String(o[0]) === String(value) }, o[1]); })));
  }
  function viewFind() {
    var f = ui.find;
    var cats = [['all', L('সব ক্যাটাগরি', 'All categories')]].concat(Object.keys(D.categories).map(function (k) { return [k, lbl(D.categories, k)]; }));
    var cs = [['all', L('সব শহর', 'All cities')]].concat(Object.keys(D.cities).map(function (k) { return [k, lbl(D.cities, k)]; }));
    var fees = [[0, L('যেকোনো ফি', 'Any fee')], [5000, L('৳5,000 পর্যন্ত', 'Up to ৳5,000')], [10000, L('৳10,000 পর্যন্ত', 'Up to ৳10,000')], [20000, L('৳20,000 পর্যন্ত', 'Up to ৳20,000')], [50000, L('৳50,000 পর্যন্ত', 'Up to ৳50,000')]];
    var sorts = [['rating', L('রেটিং', 'Rating')], ['fee', L('ফি: কম থেকে বেশি', 'Fee: low to high')], ['followers', L('ফলোয়ার', 'Followers')]];
    var plats = [['all', L('সব', 'All')]].concat(Object.keys(D.platforms).map(function (k) { return [k, D.platforms[k]]; }));

    return h('div', { style: 'display:contents' },
      pageHead(L('ইনফ্লুয়েন্সার খুঁজুন', 'Find influencers'), L('সবাই ভেরিফায়েড, আসল ফলোয়ার সংখ্যা। 5 জন পর্যন্ত বেছে নিতে পারবেন।', 'All verified, with real follower numbers. Pick up to 5.')),
      h('div', { class: 'seg', role: 'group', 'aria-label': L('প্ল্যাটফর্ম', 'Platform') }, plats.map(function (p) {
        return h('button', { type: 'button', 'aria-pressed': f.platform === p[0] ? 'true' : 'false', onclick: function () { f.platform = p[0]; render(); } }, p[1]);
      })),
      h('div', { class: 'filters' },
        select('f-cat', L('ক্যাটাগরি', 'Category'), cats, f.cat, function (v) { f.cat = v; refreshResults(); }),
        select('f-city', L('শহর', 'City'), cs, f.city, function (v) { f.city = v; refreshResults(); }),
        select('f-fee', L('ফি', 'Fee'), fees, f.maxFee, function (v) { f.maxFee = +v; refreshResults(); }),
        select('f-sort', L('সাজান', 'Sort by'), sorts, f.sort, function (v) { f.sort = v; refreshResults(); })),
      h('p', { id: 'f-count', class: 'muted small', 'aria-live': 'polite' }),
      h('div', { id: 'results', class: 'grid two' }),
      h('div', { id: 'shortbar-slot' }),
      (function () { setTimeout(refreshResults, 0); return null; })());
  }
  function refreshResults(focusId) {
    var box = $('#results'); if (!box) return;
    var list = filtered();
    box.replaceChildren.apply(box, list.length ? list.map(infCard) : [h('div', { class: 'card empty', style: 'grid-column:1/-1' }, L('এই ফিল্টারে কেউ নেই। ফিল্টার একটু খুলে দিন।', 'No one matches these filters. Try loosening them.'))]);
    $('#f-count').textContent = L(list.length + ' জন', list.length + ' influencers');
    var slot = $('#shortbar-slot'); slot.replaceChildren();
    if (state.shortlist.length) {
      var total = state.shortlist.map(function (id) { return byId(id).fee; }).reduce(function (a, b) { return a + b; }, 0);
      slot.append(h('div', { class: 'shortbar' },
        h('div', null, h('strong', null, L(state.shortlist.length + ' জন বেছেছেন', state.shortlist.length + ' selected')), h('div', { class: 'tiny', style: 'opacity:.85' }, L('মোট ফি ' + money(total) + ' থেকে শুরু', 'Fees from ' + money(total)))),
        h('a', { class: 'btn btn-yellow', href: '#/brief' }, L('ব্রিফ দিন', 'Write the brief'), icon('arrow', 18))));
    }
    var tab = $('.tabs a[href="#/brief"]');
    if (tab) { var old = $('.count', tab); if (old) old.remove(); if (state.shortlist.length) tab.append(h('span', { class: 'count' }, state.shortlist.length)); }
    if (focusId) { var b = $('[data-pick="' + focusId + '"]'); if (b) b.focus(); }
  }
  function togglePick(id) {
    var k = state.shortlist.indexOf(id);
    if (k >= 0) state.shortlist.splice(k, 1);
    else if (state.shortlist.length >= MAX_PICK) { toast(L('একসাথে 5 জনের বেশি বাছা যাবে না।', 'You can pick up to 5 at a time.')); return false; }
    else state.shortlist.push(id);
    save(); return true;
  }
  function pickButton(i, small) {
    var on = state.shortlist.indexOf(i.id) >= 0;
    return h('button', {
      type: 'button', class: 'btn ' + (on ? '' : 'btn-ghost') + (small ? ' btn-sm' : ''), 'data-pick': i.id, 'aria-pressed': on ? 'true' : 'false',
      onclick: function () { if (togglePick(i.id)) { if (route().name === 'find') refreshResults(i.id); else render(); } }
    }, icon(on ? 'check' : 'plus', 16), on ? L('শর্টলিস্টে আছে', 'In shortlist') : L('শর্টলিস্টে যোগ করুন', 'Add to shortlist'));
  }
  function infCard(i) {
    return h('article', { class: 'card' },
      h('div', { class: 'row', style: 'flex-wrap:nowrap' }, avatar(i),
        h('div', { style: 'min-width:0' }, h('a', { href: '#/i/' + i.id, class: 'name', style: 'text-decoration:none;color:var(--navy)' }, infName(i), icon('shield', 16, 'verified')),
          h('div', { class: 'small muted' }, i.handle))),
      h('div', { class: 'chips' },
        h('span', { class: 'chip' }, icon(i.platform, 14), D.platforms[i.platform]),
        h('span', { class: 'chip' }, icon('pin', 14), lbl(D.cities, i.city)),
        h('span', { class: 'chip chip-cream' }, lbl(D.categories, i.category))),
      h('dl', { class: 'stats' },
        h('div', null, h('dt', null, L('ফলোয়ার', 'Followers')), h('dd', null, compact(i.followers))),
        h('div', null, h('dt', null, L('এনগেজমেন্ট', 'Engagement')), h('dd', null, pct(i.eng))),
        h('div', null, h('dt', null, L('রেটিং', 'Rating')), h('dd', { class: 'row', style: 'gap:4px' }, icon('star', 15), i.rating.toFixed(1)))),
      h('div', { class: 'small muted' }, audText(i)),
      h('div', { class: 'kv' }, h('span', { class: 'small muted' }, L('ফি শুরু', 'Fee from')), h('span', { class: 'big', style: 'font-size:22px' }, money(i.fee))),
      pickButton(i, true));
  }

  /* ---------- views: profile ---------- */
  function viewProfile(id) {
    var i = byId(id);
    if (!i) return emptyCard(L('ইনফ্লুয়েন্সার পাওয়া যায়নি।', 'Influencer not found.'), L('খুঁজুন', 'Find influencers'), '#/find');
    return h('div', { style: 'display:contents' },
      pageHead(infName(i), i.handle, '#/find', L('সব ইনফ্লুয়েন্সার', 'All influencers')),
      h('div', { class: 'card' },
        h('div', { class: 'row' }, avatar(i, 'avatar-lg'),
          h('div', { class: 'chips' },
            h('span', { class: 'chip' }, icon(i.platform, 14), D.platforms[i.platform]),
            h('span', { class: 'chip' }, icon('pin', 14), lbl(D.cities, i.city)),
            h('span', { class: 'chip chip-cream' }, lbl(D.categories, i.category)),
            h('span', { class: 'chip chip-green' }, icon('shield', 14), L('ভেরিফায়েড', 'Verified')))),
        h('dl', { class: 'stats four' },
          h('div', null, h('dt', null, L('ফলোয়ার', 'Followers')), h('dd', null, compact(i.followers))),
          h('div', null, h('dt', null, L('এনগেজমেন্ট', 'Engagement')), h('dd', null, pct(i.eng))),
          h('div', null, h('dt', null, L('রেটিং', 'Rating')), h('dd', null, i.rating.toFixed(1))),
          h('div', null, h('dt', null, L('ফি শুরু', 'Fee from')), h('dd', null, money(i.fee)))),
        h('p', null, audText(i)),
        h('h3', null, L('কীভাবে যাচাই করা হয়েছে', 'How we verified')),
        h('ul', { class: 'ledger' }, [
          L('নিজের অ্যাকাউন্ট কানেক্ট করেছেন, তাই সংখ্যাগুলো আসল।', 'Account connected, so the numbers are real.'),
          L('আমাদের টিম প্রোফাইল আর অডিয়েন্স একবার চেক করেছে।', 'Our team reviewed the profile and audience.'),
          L('পোস্ট নির্দিষ্ট সময় লাইভ থাকলে তবেই টাকা পান।', 'Paid only after the post has stayed up for the agreed time.')
        ].map(function (s) { return h('li', null, icon('check', 18, 'verified'), h('span', null, s)); })),
        pickButton(i, false)));
  }

  /* ---------- views: brief ---------- */
  function viewBrief() {
    var sel = state.shortlist.map(byId);
    if (!sel.length) return h('div', { style: 'display:contents' }, pageHead(L('শর্টলিস্ট', 'Shortlist'), null),
      emptyCard(L('এখনো কাউকে বাছেননি। ইনফ্লুয়েন্সার খুঁজে শর্টলিস্টে যোগ করুন।', 'You have not picked anyone yet. Find influencers and add them to your shortlist.'), L('ইনফ্লুয়েন্সার খুঁজুন', 'Find influencers'), '#/find'));
    var b = brand(), br = state.brief;
    if (!br.product) br.product = txt(b.product);
    var bind = function (k, asNum) { return function (e) { br[k] = asNum ? +e.target.value : e.target.value; save(); }; };
    var formats = Object.keys(D.formats).map(function (k) { return [k, lbl(D.formats, k)]; });
    var priceHost = h('div', { id: 'price-host' }, priceBlock(sel.map(function (x) { return x.fee; }), sel.map(infName)));
    var needsLen = br.format === 'mention' || br.format === 'live';

    return h('div', { style: 'display:contents' },
      pageHead(L('ব্রিফ আর দাম', 'Brief and price'), L('কী প্রচার করবেন আর কী কী বলতে হবে, সেটা লিখে দিন। পুরো ভিডিও আগে দেখার দরকার নেই।', 'Say what to promote and what to mention. You do not need to see a finished video first.'), '#/find', L('আরও ইনফ্লুয়েন্সার বাছুন', 'Pick more influencers')),
      h('div', { class: 'card' }, h('h3', null, L('আপনার শর্টলিস্ট', 'Your shortlist')),
        h('ul', { class: 'ledger' }, sel.map(function (i) {
          return h('li', { style: 'align-items:center;justify-content:space-between' },
            h('span', { class: 'row', style: 'flex-wrap:nowrap' }, avatar(i, 'avatar-sm'), h('span', null, infName(i), h('span', { class: 'tiny muted', style: 'display:block' }, D.platforms[i.platform] + ' · ' + money(i.fee)))),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-label': L(infName(i) + ' বাদ দিন', 'Remove ' + infName(i)), onclick: function () { togglePick(i.id); render(); } }, icon('x', 16)));
        }))),
      h('form', { class: 'card', onsubmit: function (e) { e.preventDefault(); br.ready = true; save(); go('#/pay'); } },
        h('h3', null, L('ব্রিফ', 'Brief')),
        field('b-title', L('ক্যাম্পেইনের নাম', 'Campaign name'), h('input', { id: 'b-title', type: 'text', value: br.title, placeholder: L('যেমন: ঈদ কালেকশন', 'e.g. Eid collection'), maxlength: 60, oninput: bind('title') })),
        field('b-product', L('কী প্রচার করবেন', 'What to promote'), h('input', { id: 'b-product', type: 'text', required: true, value: br.product, maxlength: 90, oninput: bind('product') })),
        field('b-format', L('কীভাবে প্রচার হবে', 'How it is promoted'), h('select', { id: 'b-format', onchange: function (e) { br.format = e.target.value; save(); render(); var f = $('#b-format'); if (f) f.focus(); } },
          formats.map(function (o) { return h('option', { value: o[0], selected: o[0] === br.format }, o[1]); })), fmtHint(br.format)),
        needsLen ? field('b-sec', L('কমপক্ষে কতক্ষণ উল্লেখ', 'Minimum time on your product'), h('select', { id: 'b-sec', onchange: bind('minSec', true) },
          [15, 30, 45, 60].map(function (o) { return h('option', { value: o, selected: o === br.minSec }, L(o + ' সেকেন্ড', o + ' seconds')); }))) : null,
        br.format === 'reel' ? h('label', { class: 'radio' }, h('input', { type: 'checkbox', checked: br.preview, onchange: function (e) { br.preview = e.target.checked; save(); } }),
          h('span', null, h('strong', null, L('পোস্টের আগে ড্রাফট দেখতে চাই', 'I want to see a draft before it is posted')),
            h('span', { class: 'tiny muted', style: 'display:block' }, L('ইনফ্লুয়েন্সারকে আগে রাজি হতে হয়, আর ফি একটু বেশি হতে পারে।', 'The influencer has to agree up front, and the fee may be higher.')))) : null,
        h('div', { class: 'grid two' },
          field('b-offer', L('ফলোয়ারদের জন্য ছাড়', 'Discount for followers'), h('select', { id: 'b-offer', onchange: bind('offer', true) }, [5, 10, 15, 20].map(function (o) { return h('option', { value: o, selected: o === br.offer }, o + '%'); }))),
          field('b-days', L('কত দিনের মধ্যে পোস্ট', 'Post within'), h('select', { id: 'b-days', onchange: bind('days', true) }, [3, 5, 7, 14].map(function (o) { return h('option', { value: o, selected: o === br.days }, L(o + ' দিন', o + ' days')); })))),
        field('b-notes', L('যা যা বলতে হবে (টকিং পয়েন্ট)', 'Key points to mention'), h('textarea', { id: 'b-notes', maxlength: 300, placeholder: L('যেমন: ঈদের আগে ডেলিভারি, ক্যাশ অন ডেলিভারি আছে, কোডটা মুখে বলবেন', 'e.g. delivery before Eid, cash on delivery available, say the code out loud'), oninput: bind('notes') }, br.notes), L('ঐচ্ছিক', 'Optional')),
        h('h3', null, L('দাম', 'Price')), priceHost,
        h('p', { class: 'small muted' }, L('এই টাকা ইনফ্লুয়েন্সারদের কাছে এখনই যায় না। পোস্ট ' + holdOf(br.format) + ' ঘণ্টা থাকার পর যায়।', 'This money does not go to the influencers yet. It is released after the post has stayed up for ' + holdOf(br.format) + ' hours.')),
        h('button', { class: 'btn btn-block', type: 'submit', 'data-j': 'to-pay' }, L('পেমেন্টে এগিয়ে যান', 'Continue to payment'), icon('arrow', 18))));
  }
  function field(id, label, control, hint) {
    return h('div', { class: 'field' }, h('label', { for: id }, label), control, hint ? h('span', { class: 'hint' }, hint) : null);
  }

  /* ---------- views: pay ---------- */
  function viewPay() {
    var sel = state.shortlist.map(byId);
    if (!sel.length) return emptyCard(L('শর্টলিস্ট খালি।', 'Your shortlist is empty.'), L('ইনফ্লুয়েন্সার খুঁজুন', 'Find influencers'), '#/find');
    var p = priceSum(sel.map(function (x) { return x.fee; }));
    var method = 'wallet';
    return h('div', { style: 'display:contents' },
      pageHead(L('টাকা জমা দিন', 'Fund the deal'), null, '#/brief', L('ব্রিফে ফিরুন', 'Back to the brief')),
      h('div', { class: 'panel attn' }, h('strong', null, L('এটা ডেমো পেমেন্ট', 'This is a demo payment')),
        h('p', { class: 'small' }, L('আসল টাকা কাটা হয় না। কোনো পিন, পাসওয়ার্ড বা কার্ড নম্বর দিতে হবে না।', 'No real money is taken. You will not be asked for a PIN, password or card number.'))),
      h('div', { class: 'card' }, h('h3', null, L('টাকা কীভাবে নিরাপদ থাকে', 'How your money stays safe')), escrowSteps(holdOf(state.brief.format))),
      h('div', { class: 'card' }, h('h3', null, L('সারাংশ', 'Summary')), priceBlock(sel.map(function (x) { return x.fee; }), sel.map(infName))),
      h('div', { class: 'card' }, h('h3', null, L('পেমেন্টের মাধ্যম (ডেমো)', 'Payment method (demo)')),
        [['wallet', L('মোবাইল ওয়ালেট', 'Mobile wallet')], ['card', L('কার্ড', 'Card')]].map(function (m) {
          return h('label', { class: 'radio' }, h('input', { type: 'radio', name: 'm', value: m[0], checked: m[0] === method, onchange: function () { method = m[0]; } }), icon('wallet', 20), m[1]);
        })),
      h('button', { class: 'btn btn-yellow btn-block', type: 'button', 'data-j': 'pay', onclick: createCampaign }, icon('lock', 18), L(money(p.total) + ' জমা দিন (ডেমো)', 'Pay ' + money(p.total) + ' (demo)')));
  }
  function createCampaign() {
    var id = fundCampaign();
    if (!id) return;
    toast(L('টাকা জমা হয়েছে। ইনফ্লুয়েন্সারদের কাছে অনুরোধ পাঠানো হয়েছে।', 'Funded. Requests have been sent to the influencers.'));
    go('#/c/' + id);
  }
  // Turns the shortlist and brief into a funded campaign. Returns the campaign id.
  function fundCampaign() {
    var b = brand(), sel = state.shortlist.map(byId), br = state.brief;
    if (!sel.length) return null;
    var id = 'c-' + Date.now().toString(36), n = now(), hh = holdOf(br.format);
    var deals = sel.map(function (i) {
      var p = price(i.fee);
      return { id: id + '-' + i.id, infId: i.id, fee: i.fee, pf: p.pf, vat: p.vat, total: p.total, stage: 'funded', holdH: hh, t: { fundedAt: n },
        final: makeFinal(i, i.fee, p.pf, id + i.id), code: codeFor(i, br.offer), link: linkFor(b, i), changeRequested: false, revised: false, verified: false };
    });
    state.campaigns.unshift({ id: id, brandId: b.id, title: br.title.trim() || { bn: 'নতুন ক্যাম্পেইন', en: 'New campaign' }, product: br.product, format: br.format,
      minSec: br.minSec, preview: br.format === 'reel' && !!br.preview, notes: br.notes, offer: br.offer, days: br.days, createdAt: n, deals: deals });
    state.shortlist = []; state.brief = NEW_BRIEF();
    var mine = deals.filter(function (d) { return d.infId === CR; })[0];
    // The journey's deal ends on the landing page's numbers for Nusrat (40 orders, ৳230 per order).
    if (WORLD === 'journey' && mine && !state.j.dealId) { state.j.dealId = mine.id; state.j.campaignId = id; mine.final = { reach: 36560, clicks: 900, orders: 40 }; }
    state.requests.forEach(function (q) { if (q.brandId === b.id && q.status === 'sent') q.status = 'converted'; });
    save();
    return id;
  }

  /* ---------- views: campaign ---------- */
  function viewCampaign(id) {
    var c = campaignById(id);
    if (!c) return emptyCard(L('ক্যাম্পেইন পাওয়া যায়নি।', 'Campaign not found.'), L('হোমে ফিরুন', 'Back home'), '#/');
    var n = now(), ds = c.deals;
    var total = sum(ds, 'total');
    var held = sum(ds.filter(function (d) { return HELD.indexOf(d.stage) >= 0; }), 'total');
    var released = sum(ds.filter(function (d) { return d.stage === 'paid'; }), 'fee');
    var refunded = sum(ds.filter(function (d) { return d.stage === 'refunded'; }), 'total');
    var counted = ds.filter(function (d) { return d.stage === 'live' || d.stage === 'paid'; });
    var m = counted.reduce(function (a, d) { var x = metrics(d, n); return { reach: a.reach + x.reach, clicks: a.clicks + x.clicks, orders: a.orders + x.orders }; }, { reach: 0, clicks: 0, orders: 0 });
    var allDone = ds.every(function (d) { return d.stage === 'paid' || d.stage === 'refunded'; });
    var paidDeals = ds.filter(function (d) { return d.stage === 'paid'; });
    var spend = paidDeals.reduce(function (s, d) { return s + d.fee + d.pf; }, 0);

    return h('div', { style: 'display:contents' },
      pageHead(txt(c.title), txt(c.product) + ' · ' + dateStr(c.createdAt), '#/', L('সব ক্যাম্পেইন', 'All campaigns')),
      h('div', { class: 'chips' },
        h('span', { class: 'chip chip-cream' }, lbl(D.formats, c.format)),
        h('span', { class: 'chip' }, icon('clock', 14), L('পোস্ট ' + holdOf(c.format) + ' ঘণ্টা থাকলে টাকা ছাড়া হয়', 'Fee released after ' + holdOf(c.format) + ' hours up'))),
      h('div', { class: 'stat-grid' },
        statCard(L('জমা দিয়েছেন', 'You paid in'), money(total)),
        statCard(L('এখনো জমা আছে', 'Still held'), money(held), L('লাইসেন্সপ্রাপ্ত পেমেন্ট পার্টনারের কাছে', 'With the licensed payment partner')),
        statCard(L('ইনফ্লুয়েন্সারদের দেওয়া হয়েছে', 'Paid to influencers'), money(released)),
        statCard(L('ফেরত পেয়েছেন', 'Refunded to you'), money(refunded))),
      counted.length ? h('div', { class: 'card', 'data-j': 'results' }, h('h3', null, allDone ? L('ফলাফল', 'Results') : L('এখন পর্যন্ত ফলাফল', 'Results so far')),
        h('dl', { class: 'stats' },
          h('div', null, h('dt', null, L('রিচ', 'Reach')), h('dd', null, num(m.reach))),
          h('div', null, h('dt', null, L('লিংকে ক্লিক', 'Link clicks')), h('dd', null, num(m.clicks))),
          h('div', null, h('dt', null, L('কোড দিয়ে অর্ডার', 'Orders via codes')), h('dd', null, num(m.orders)))),
        allDone && m.orders ? h('div', { class: 'kv' }, h('span', { class: 'muted' }, L('প্রতি অর্ডারে খরচ (আমাদের ফি সহ)', 'Cost per order (incl. our fee)')), h('strong', { class: 'big' }, money(spend / m.orders))) : null,
        allDone && paidDeals.length ? h('button', { type: 'button', class: 'btn btn-yellow', style: 'align-self:flex-start', onclick: function () { runAgain(c); } }, icon('refresh', 18), L('একই ইনফ্লুয়েন্সারদের নিয়ে আবার চালান', 'Run it again with the same influencers')) : null) : null,
      h('div', { class: 'grid' }, ds.map(function (d) { return dealCard(c, d); })),
      h('div', { class: 'card' }, h('h3', null, L('টাকার হিসাব', 'Money trail')), ledger(c)));
  }
  function sum(arr, k) { return arr.reduce(function (s, d) { return s + d[k]; }, 0); }
  function runAgain(c) {
    state.shortlist = c.deals.filter(function (d) { return d.stage === 'paid'; }).map(function (d) { return d.infId; }).slice(0, MAX_PICK);
    state.brief = Object.assign(NEW_BRIEF(), { title: '', product: txt(c.product), format: c.format, minSec: c.minSec || 30, notes: c.notes || '', offer: c.offer, days: c.days });
    save(); go('#/brief');
  }

  function ledger(c) {
    var ev = [];
    c.deals.forEach(function (d) {
      var nm = infName(byId(d.infId));
      ev.push([d.t.fundedAt, L(nm + ': ' + money(d.total) + ' জমা (ফি ' + money(d.fee) + ' + আমাদের ফি ' + money(d.pf) + ' + ভ্যাট ' + money(d.vat) + ')', nm + ': ' + money(d.total) + ' paid in (fee ' + money(d.fee) + ' + our fee ' + money(d.pf) + ' + VAT ' + money(d.vat) + ')')]);
      if (d.t.disputedAt) ev.push([d.t.disputedAt, L(nm + ': সমস্যা জানানো হয়েছে, পেমেন্ট আটকে আছে', nm + ': problem reported, payout on hold')]);
      if (d.t.paidAt) ev.push([d.t.paidAt, L(nm + ': ' + money(d.fee) + ' ইনফ্লুয়েন্সারের বিকাশ/নগদে গেছে', nm + ': ' + money(d.fee) + ' paid out to the influencer\'s wallet')]);
      if (d.t.refundedAt) ev.push([d.t.refundedAt, L(nm + ': পোস্ট হয়নি, ' + money(d.total) + ' পুরো ফেরত', nm + ': no post, ' + money(d.total) + ' refunded in full')]);
    });
    ev.sort(function (a, b) { return b[0] - a[0]; });
    return h('ul', { class: 'ledger' }, ev.map(function (e) { return h('li', null, h('span', { class: 't' }, ago(e[0])), h('span', null, e[1])); }));
  }

  function dealCard(c, d) {
    var i = byId(d.infId), n = now();
    var cur = STEPS.indexOf(d.stage === 'disputed' ? 'live' : d.stage);
    var steps = d.stage === 'refunded' ? null : h('div', null,
      h('ol', { class: 'dots', 'aria-label': L('ধাপ ' + (cur + 1) + '/6: ' + stepLabel(STEPS[cur], c), 'Step ' + (cur + 1) + ' of 6: ' + stepLabel(STEPS[cur], c)) },
        STEPS.map(function (s, k) {
          return h('li', { class: k < cur || d.stage === 'paid' ? 'done' : k === cur ? 'cur' : '' },
            h('span', { class: 'd' }, k < cur || d.stage === 'paid' ? icon('check', 12) : null), k < STEPS.length - 1 ? h('span', { class: 'ln' }) : null);
        })),
      h('p', { class: 'tiny muted', 'aria-hidden': 'true', style: 'margin-top:6px' }, L('ধাপ ' + (cur + 1) + '/6: ', 'Step ' + (cur + 1) + '/6: ') + stepLabel(STEPS[cur], c)));

    return h('article', { class: 'card', 'data-deal': d.id },
      h('div', { class: 'row', style: 'flex-wrap:nowrap;justify-content:space-between;align-items:flex-start' },
        h('div', { class: 'row', style: 'flex-wrap:nowrap' }, avatar(i, 'avatar-sm'),
          h('div', { style: 'min-width:0' }, h('a', { href: '#/i/' + i.id, class: 'name', style: 'font-size:17px;text-decoration:none;color:var(--navy)' }, infName(i)),
            h('div', { class: 'tiny muted' }, i.handle + ' · ' + D.platforms[i.platform]))),
        h('strong', null, money(d.fee))),
      h('span', { class: 'chip chip-' + stageTone(d), style: 'align-self:flex-start' }, stageText(c, d)),
      steps, dealPanel(c, d, i, n));
  }

  function shortcut(btnText, fn) {
    if (WORLD === 'journey') return h('p', { class: 'tiny muted' }, L('এটা ইনফ্লুয়েন্সার নিজের অ্যাপ থেকে করেন।', 'The influencer does this in their own app.'));
    return h('div', { class: 'demo-short' }, h('span', { class: 'lbl' }, L('ডেমো শর্টকাট: আসলে ইনফ্লুয়েন্সার এটা করেন', 'Demo shortcut: in real life the influencer does this')),
      h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: fn }, btnText));
  }
  function cancelBtn(c, d) {
    return h('button', { type: 'button', class: 'btn btn-danger btn-sm', onclick: function () {
      if (!confirm(L('বাতিল করলে ' + money(d.total) + ' পুরো ফেরত পাবেন। বাতিল করবেন?', 'Cancel and get ' + money(d.total) + ' back in full?'))) return;
      advance(c, d, 'refunded'); toast(L('বাতিল হয়েছে, পুরো টাকা ফেরত।', 'Cancelled, full refund.')); render();
    } }, L('বাতিল করুন, পুরো টাকা ফেরত নিন', 'Cancel and get a full refund'));
  }
  function copyBtn(text) {
    return h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-label': L('কপি করুন: ' + text, 'Copy: ' + text), onclick: function () {
      var ok = function () { toast(L('কপি হয়েছে', 'Copied')); }, fail = function () { toast(text); };
      try { navigator.clipboard.writeText(text).then(ok, fail); } catch (e) { fail(); }
    } }, icon('copy', 16));
  }
  function codeRows(d) {
    return [
      h('div', { class: 'kv small' }, h('span', { class: 'muted' }, L('কোড', 'Code')), h('span', { class: 'row', style: 'gap:6px' }, h('span', { class: 'code' }, d.code), copyBtn(d.code))),
      h('div', { class: 'kv small' }, h('span', { class: 'muted' }, L('ট্র্যাকিং লিংক', 'Tracked link')), h('span', { class: 'row', style: 'gap:6px' }, h('span', { class: 'code' }, d.link), copyBtn(d.link)))
    ];
  }
  function proofCard(c, d) {
    var pr = d.proof;
    if (!pr) return null;
    var timed = c.format === 'mention' || c.format === 'live';
    return h('div', { class: 'proof' },
      h('strong', null, L('পোস্টের প্রুফ', 'Proof of the post')),
      pr.ref ? kv(L('পোস্টের লিংক', 'Post link'), h('span', { class: 'code' }, pr.ref)) : kv(L('প্রুফ', 'Proof'), L('স্ক্রিন রেকর্ডিং আর স্ক্রিনশট', 'Screen recording and screenshot')),
      timed ? kv(L('উল্লেখের সময়', 'Mentioned at'), mmss(pr.from) + ' – ' + mmss(pr.to) + ' (' + pr.len + L(' সেকেন্ড', ' sec') + ')') : null,
      kv(L('কোড', 'Code said'), d.code),
      h('div', { class: 'shot', 'aria-hidden': 'true' }, L('স্ক্রিনশট (ডেমো)', 'Screenshot (demo)')));
  }
  function planCard(c, d) {
    var timed = c.format === 'mention' || c.format === 'live';
    return h('div', { class: 'proof' },
      h('strong', null, L('ইনফ্লুয়েন্সারের প্ল্যান', 'The influencer\'s plan')),
      h('p', { style: 'font-size:16px' }, planText(c, d)),
      kv(L('কীভাবে', 'Format'), lbl(D.formats, c.format)),
      timed ? kv(L('কমপক্ষে', 'At least'), (c.minSec || 30) + L(' সেকেন্ড', ' seconds')) : null,
      kv(L('আপনার পয়েন্ট', 'Your key points'), c.notes ? c.notes : L('(কিছু দেননি)', '(none given)')));
  }

  function dealPanel(c, d, i, n) {
    var hh = hold(d);
    switch (d.stage) {
      case 'funded':
        return h('div', { class: 'panel' }, h('p', null, L('অনুরোধ পাঠানো হয়েছে। ইনফ্লুয়েন্সার ফি আর ব্রিফ দেখে রাজি হলে কাজ শুরু।', 'Request sent. Work starts once the influencer accepts the fee and brief.')),
          h('p', { class: 'small muted' }, L(money(d.total) + ' লাইসেন্সপ্রাপ্ত পেমেন্ট পার্টনারের কাছে জমা আছে।', money(d.total) + ' is held by the licensed payment partner.')),
          h('div', { class: 'row' }, cancelBtn(c, d)),
          shortcut(L('রাজি হলেন', 'Accept the deal'), function () { advance(c, d, 'accepted'); toast(L(infName(i) + ' রাজি হয়েছেন।', infName(i) + ' accepted.')); render(); }));
      case 'accepted': {
        var rev = d.changeRequested && !d.revised, pw = planWord(c);
        return h('div', { class: 'panel' }, h('p', null, rev ? L('বদলের অনুরোধ পাঠানো হয়েছে। নতুন ' + pw + 'র অপেক্ষা।', 'Your change request was sent. Waiting for the revised ' + pw + '.')
                                                          : L('ইনফ্লুয়েন্সার রাজি হয়েছেন এবং ' + pw + ' তৈরি করছেন।', 'The influencer accepted and is preparing the ' + pw + '.')),
          h('div', { class: 'row' }, cancelBtn(c, d)),
          shortcut(rev ? L('বদল করা ' + pw + ' পাঠালেন', 'Send the revised ' + pw) : L(pw + ' পাঠালেন', 'Send the ' + pw), function () { if (rev) d.revised = true; advance(c, d, 'plan'); toast(L(pw + ' এসেছে। অ্যাপ্রুভ করুন।', 'The ' + pw + ' is in. Please review it.')); render(); }));
      }
      case 'plan': {
        var pw2 = planWord(c);
        return h('div', { class: 'panel attn' },
          h('strong', null, d.revised ? L('বদল করা ' + pw2, 'Revised ' + pw2) : L(pw2 + ' দেখুন', 'Review the ' + pw2)),
          c.preview ? h('div', { class: 'draft' },
            h('div', { class: 'vis', style: 'background:linear-gradient(135deg,var(--navy),var(--pink))' }, icon('play', 40), h('span', null, L('রিল ড্রাফট', 'Reel draft')), h('span', { class: 'tiny', style: 'opacity:.85;font-weight:500' }, L('ডেমো: আসল ভিডিও নয়', 'Demo: not a real video'))),
            h('p', { class: 'cap' }, caption(c, d))) : planCard(c, d),
          codeRows(d),
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn', 'data-j': 'approve-plan', onclick: function () { advance(c, d, 'approved'); toast(L('অ্যাপ্রুভ হয়েছে। ইনফ্লুয়েন্সার এবার পোস্ট করবেন।', 'Approved. The influencer will now post.')); render(); } }, icon('check', 18), L('অ্যাপ্রুভ করুন', 'Approve')),
            d.revised ? null : h('button', { type: 'button', class: 'btn btn-ghost', onclick: function () { d.changeRequested = true; advance(c, d, 'accepted'); toast(L('একটা বদলের অনুরোধ পাঠানো হয়েছে।', 'Change request sent.')); render(); } }, L('একটা বদল চাই', 'Ask for one change'))),
          h('p', { class: 'tiny muted' }, d.revised ? L('এই ডিলে একবারই বদল চাওয়া যায়।', 'You can ask for one change per deal.')
            : L('ইনফ্লুয়েন্সার নিজের স্টাইলেই বলেন। আপনি শুধু কী বলতে হবে তা ঠিক করেন।', 'Influencers keep their own style. You only agree what gets mentioned.')));
      }
      case 'approved':
        return h('div', { class: 'panel' }, h('p', null, c.preview ? L('ড্রাফট অ্যাপ্রুভ করা হয়েছে। ইনফ্লুয়েন্সার পোস্ট করে প্রুফ দিলে ' + hh + ' ঘণ্টার গণনা শুরু।', 'Draft approved. The ' + hh + '-hour clock starts when the influencer posts and submits proof.')
                                              : L('প্ল্যান ঠিক হয়েছে। ইনফ্লুয়েন্সার নিজের কনটেন্টে বলবেন, পোস্ট করে প্রুফ দিলে ' + hh + ' ঘণ্টার গণনা শুরু।', 'Plan agreed. The influencer will mention you in their own content. The ' + hh + '-hour clock starts when they post and submit proof.')),
          h('p', { class: 'small muted' }, L('ডেডলাইনের মধ্যে পোস্ট না হলে পুরো টাকা ফেরত পাবেন।', 'If it is not posted by the deadline, you get your money back in full.')),
          h('div', { class: 'row' }, cancelBtn(c, d)),
          shortcut(L('পোস্ট করে প্রুফ দিলেন', 'Post it and submit proof'), function () { advance(c, d, 'live'); toast(L('প্রুফ এসেছে। ' + hh + ' ঘণ্টার গণনা শুরু।', 'Proof received. The ' + hh + '-hour clock has started.')); render(); }));
      case 'live': {
        var m = metrics(d, n), left = Math.max(0, hh - (n - d.t.liveAt) / H), totalMin = Math.ceil(left * 60), hl = Math.floor(totalMin / 60), mm = totalMin % 60;
        var elapsed = Math.round(hh - left);
        var reasons = [L('কোনো উল্লেখ নেই', 'The sponsor was not mentioned'), L('ভুল পণ্য বা ভুল কোড', 'Wrong product or wrong code'), L('পোস্ট মুছে ফেলা হয়েছে', 'The post was deleted')];
        var sel = h('select', { id: 'r-' + d.id, 'aria-label': L('সমস্যার কারণ', 'Reason') }, reasons.map(function (r) { return h('option', { value: r }, r); }));
        return h('div', { class: 'panel' },
          h('div', { class: 'kv' }, h('strong', null, L('পোস্ট হয়েছে', 'Posted')), h('span', { class: 'chip chip-green' }, icon('clock', 14), hl >= 1 ? L(hl + ' ঘণ্টা বাকি', hl + 'h left') : L(mm + ' মিনিট বাকি', mm + ' min left'))),
          h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': hh, 'aria-valuenow': elapsed, 'aria-label': L(hh + ' ঘণ্টার মধ্যে ' + elapsed + ' ঘণ্টা পার', elapsed + ' of ' + hh + ' hours elapsed') }, h('div', { style: 'width:' + Math.round(m.x * 100) + '%' })),
          h('p', { class: 'tiny muted' }, L(hh + ' ঘণ্টা পোস্ট থাকলে ' + money(d.fee) + ' ইনফ্লুয়েন্সারের বিকাশ/নগদে যাবে।', money(d.fee) + ' goes to the influencer\'s wallet after ' + hh + ' hours up.')),
          proofCard(c, d),
          d.verified ? h('span', { class: 'chip chip-green', style: 'align-self:flex-start' }, icon('check', 14), L('আপনি উল্লেখ যাচাই করেছেন', 'You checked the mention'))
            : h('div', { class: 'panel attn' },
                h('strong', null, L('উল্লেখটা ঠিক আছে কি?', 'Is the mention right?')),
                h('div', { class: 'row' }, h('button', { type: 'button', class: 'btn btn-sm', 'data-j': 'confirm-mention', onclick: function () { d.verified = true; save(); toast(L('যাচাই হয়েছে। ধন্যবাদ।', 'Checked. Thank you.')); render(); } }, icon('check', 16), L('ঠিক আছে, দেখেছি', 'Looks right'))),
                h('div', { class: 'field' }, h('span', { class: 'lbl' }, L('সমস্যা থাকলে', 'If there is a problem')), sel,
                  h('button', { type: 'button', class: 'btn btn-danger btn-sm', 'data-j': 'report', onclick: function () { d.disputeReason = sel.value; advance(c, d, 'disputed'); toast(L('সমস্যা জানানো হয়েছে। পেমেন্ট আটকে আছে।', 'Problem reported. Payout is on hold.')); render(); } }, icon('flag', 16), L('সমস্যা জানান', 'Report a problem')))),
          h('dl', { class: 'stats' },
            h('div', null, h('dt', null, L('রিচ', 'Reach')), h('dd', null, num(m.reach))),
            h('div', null, h('dt', null, L('ক্লিক', 'Clicks')), h('dd', null, num(m.clicks))),
            h('div', null, h('dt', null, L('অর্ডার', 'Orders')), h('dd', null, num(m.orders)))),
          codeRows(d),
          h('div', { class: 'demo-short' }, h('span', { class: 'lbl' }, L('ডেমো শর্টকাট', 'Demo shortcut')),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: function () { fastForward(hh); } }, icon('clock', 16), L(hh + ' ঘণ্টা এগিয়ে যান', 'Fast-forward ' + hh + ' hours'))));
      }
      case 'disputed':
        return h('div', { class: 'panel' }, h('strong', null, L('সমস্যা জানানো হয়েছে', 'Problem reported')),
          h('p', null, L('কারণ: ' + (d.disputeReason || '') + '। আমাদের টিম প্রুফ আর পোস্ট দেখছে, পেমেন্ট আটকে আছে।', 'Reason: ' + (d.disputeReason || '') + '. Our team is checking the proof and the post. The payout is on hold.')),
          proofCard(c, d),
          WORLD === 'journey' ? h('p', { class: 'tiny muted' }, L('আমাদের টিম কনসোল থেকে সিদ্ধান্ত নেয়।', 'Our team decides this in the team console.')) :
          h('div', { class: 'demo-short' }, h('span', { class: 'lbl' }, L('ডেমো শর্টকাট: আমাদের টিমের সিদ্ধান্ত', 'Demo shortcut: our team\'s decision')),
            h('div', { class: 'row' },
              h('button', { type: 'button', class: 'btn btn-danger btn-sm', onclick: function () { resolveDispute(c, d, 'refund'); toast(L('উল্লেখ ছিল না। পুরো টাকা ফেরত।', 'No mention found. Full refund.')); render(); } }, L('উল্লেখ ছিল না: পুরো টাকা ফেরত', 'No mention: full refund')),
              h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: function () { resolveDispute(c, d, 'resume'); toast(L('উল্লেখ ঠিক ছিল। পেমেন্ট আবার চালু।', 'The mention was fine. Payout resumed.')); render(); } }, L('উল্লেখ ঠিক ছিল: পেমেন্ট চালু', 'Mention was fine: resume payout')))));
      case 'paid': {
        var fm = d.final, cpo = (d.fee + d.pf) / fm.orders;
        return h('div', { class: 'panel' }, h('strong', null, L('ডিল শেষ', 'Deal finished')),
          h('dl', { class: 'stats' },
            h('div', null, h('dt', null, L('রিচ', 'Reach')), h('dd', null, num(fm.reach))),
            h('div', null, h('dt', null, L('ক্লিক', 'Clicks')), h('dd', null, num(fm.clicks))),
            h('div', null, h('dt', null, L('অর্ডার', 'Orders')), h('dd', null, num(fm.orders)))),
          h('div', { class: 'kv small' }, h('span', { class: 'muted' }, L('প্রতি অর্ডারে খরচ (আমাদের ফি সহ)', 'Cost per order (incl. our fee)')), h('strong', null, money(cpo))),
          h('p', { class: 'small' }, L(money(d.fee) + ' ইনফ্লুয়েন্সারের বিকাশ/নগদে গেছে (' + ago(d.t.paidAt) + ')।', money(d.fee) + ' was paid to the influencer\'s wallet (' + ago(d.t.paidAt) + ').')));
      }
      default:
        return h('div', { class: 'panel', 'data-j': 'refund-done' }, h('strong', null, L('পুরো টাকা ফেরত', 'Full refund')),
          h('p', null, L(money(d.total) + ' আপনার কাছে ফেরত গেছে (' + ago(d.t.refundedAt) + ')। চাইলে অন্য ইনফ্লুয়েন্সার বেছে নিতে পারেন।', money(d.total) + ' went back to you (' + ago(d.t.refundedAt) + '). You can pick another influencer.')),
          h('div', { class: 'row' }, h('a', { class: 'btn btn-sm', href: '#/find' }, L('অন্য ইনফ্লুয়েন্সার খুঁজুন', 'Find another influencer'))));
    }
  }

  /* ---------- demo tools ---------- */
  function moveClock(hours) { state.offset += hours * H; var changed = tick(); save(); return changed; }
  function fastForward(hours) {
    var changed = moveClock(hours); render();
    toast(L(hours + ' ঘণ্টা এগিয়ে গেছে।' + (changed ? ' কিছু ডিলের পেমেন্ট হয়ে গেছে।' : ''), 'Moved ' + hours + ' hours ahead.' + (changed ? ' Some deals have been paid out.' : '')));
  }
  function openTools() {
    var dlg = $('#tools');
    var shift = Math.round(state.offset / H);
    dlg.replaceChildren(h('div', { class: 'dlg' },
      h('div', { class: 'dlg-h' }, h('h2', { id: 'tools-title' }, L('ডেমো টুলস', 'Demo tools')),
        h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-label': L('বন্ধ করুন', 'Close'), onclick: function () { dlg.close(); } }, icon('x', 18))),
      h('div', { class: 'field' }, h('span', { class: 'lbl' }, L('কার অ্যাপ দেখবেন', 'Whose app to view')),
        h('div', { class: 'seg' }, ['seller', 'creator', 'team'].map(function (rl) {
          return h('button', { type: 'button', 'aria-pressed': roleOf(route()) === rl ? 'true' : 'false', onclick: function () { dlg.close(); go(ROLE_HOME[rl]); } },
            rl === 'creator' ? L('ইনফ্লুয়েন্সার (নুসরাত)', 'Influencer (Nusrat)') : roleName(rl));
        })),
        h('span', { class: 'hint' }, L('পুরো গল্পটা ধাপে ধাপে দেখতে ', 'To see the whole story step by step, open the ') ,
          h('a', { href: './' }, L('জার্নি ডেমো খুলুন', 'journey demo')), L('।', '.'))),
      h('div', { class: 'field' }, h('span', { class: 'lbl' }, L('কোন ব্র্যান্ড হিসেবে দেখবেন', 'View as brand')),
        h('div', { class: 'seg' }, D.brands.map(function (b) {
          return h('button', { type: 'button', 'aria-pressed': b.id === state.brandId ? 'true' : 'false', onclick: function () {
            state.brandId = b.id; state.shortlist = []; state.brief = NEW_BRIEF(); save(); dlg.close(); go('#/'); render();
          } }, brandName(b));
        }))),
      h('div', { class: 'field' }, h('span', { class: 'lbl' }, L('সময় এগিয়ে নিন', 'Fast-forward time')),
        h('div', { class: 'seg' }, [24, 72].map(function (hrs) {
          return h('button', { type: 'button', onclick: function () { dlg.close(); fastForward(hrs); } }, '+' + hrs + L(' ঘণ্টা', 'h'));
        })),
        h('span', { class: 'hint' }, shift ? L('এখন ডেমো ঘড়ি ' + shift + ' ঘণ্টা এগিয়ে আছে।', 'The demo clock is ' + shift + ' hours ahead.') : L('পোস্ট নির্দিষ্ট সময় থাকলে অটো পেমেন্ট হয়।', 'Deals pay out automatically once the post has stayed up long enough.'))),
      h('div', { class: 'field' }, h('span', { class: 'lbl' }, L('ডেমো ডেটা', 'Demo data')),
        h('button', { type: 'button', class: 'btn btn-danger', onclick: function () {
          if (!confirm(L('সব ডেটা প্রথম অবস্থায় ফিরে যাবে। রিসেট করবেন?', 'Everything goes back to the starting data. Reset?'))) return;
          BB.reset(); dlg.close(); go('#/'); render(); toast(L('ডেমো ডেটা রিসেট হয়েছে।', 'Demo data reset.'));
        } }, icon('refresh', 18), L('সব রিসেট করুন', 'Reset everything')))));
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }

  /* ---------- exports for creator.js, team.js, outreach.js, journey.js ---------- */
  Object.assign(BB, {
    D: D, H: H, WORLD: WORLD, EMBED: EMBED, CR: CR, HELD: HELD, NEW_BRIEF: NEW_BRIEF, ROLE_HOME: ROLE_HOME, hooks: hooks,
    S: function () { return state; },
    reset: function () { var lang = state.lang; state = seed(); state.lang = lang; syncFee(); hooks.reset.forEach(function (f) { f(); }); save(); },
    h: h, icon: icon, $: $, rng: rng, randStr: randStr, mmss: mmss, price: price, makeProof: makeProof, holdOf: holdOf, hold: hold,
    save: save, byId: byId, byBrand: byBrand, brand: brand, campaignById: campaignById, findDeal: findDeal, isMember: isMember,
    now: now, L: L, txt: txt, lbl: lbl, infName: infName, brandName: brandName, money: money, num: num, compact: compact, pct: pct,
    dateStr: dateStr, ago: ago, avatar: avatar, audText: audText, metrics: metrics, advance: advance, planText: planText, planWord: planWord,
    stageText: stageText, stageTone: stageTone, resolveDispute: resolveDispute, fundCampaign: fundCampaign, moveClock: moveClock, fastForward: fastForward,
    pageHead: pageHead, emptyCard: emptyCard, kv: kv, statCard: statCard, field: field, toast: toast, go: go, render: render, route: route, roleOf: roleOf,
    proofCard: proofCard, codeRows: codeRows, copyBtn: copyBtn, tabBar: tabBar, sum: sum, toggleLang: toggleLang,
    setLang: function (l) { if (l !== state.lang) { state.lang = l; save(); render(); } }
  });

  /* ---------- boot (called by app.html once every view file has loaded) ---------- */
  BB.boot = function () {
    if (EMBED) document.documentElement.classList.add('embed');
    try { localStorage.removeItem('bb-demo-v2'); } catch (e) { /* nothing saved */ }
    state = load();
    syncFee();
    save();
    window.addEventListener('hashchange', render);
    setInterval(function () {
      var dlgOpen = $('#tools').open, a = document.activeElement, typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
      var r = route().name;
      if (!dlgOpen && !typing && (r === 'home' || r === 'c' || r === 'cr' || r === 'team')) render();
    }, 30000);
    render();
  };
})();
