/* Brandবন্ধু demo: the creator's app, shown as Nusrat. Invite, join, connect account, under review,
   offers, plan, proof, payout and earnings. Creator-facing words say "কনটেন্ট ক্রিয়েটর". */
(function () {
  'use strict';

  var BB = window.BB, h = BB.h, icon = BB.icon, L = BB.L, D = BB.D, S = BB.S;
  var ORDER = ['funded', 'accepted', 'plan', 'approved', 'live', 'paid'];

  function me() { return BB.byId(BB.CR); }
  function cr() { return S().cr; }
  // Nusrat's deals, newest first, with their campaign.
  function myDeals() {
    var out = [];
    S().campaigns.forEach(function (c) { c.deals.forEach(function (d) { if (d.infId === BB.CR) out.push({ c: c, d: d }); }); });
    return out.sort(function (a, b) { return b.d.t.fundedAt - a.d.t.fundedAt; });
  }
  function fmtList() { return Object.keys(D.formats); }

  /* ---------- state changes (used by the screens and by journey.js) ---------- */
  BB.crJoin = function () { var c = cr(); if (c.status === 'prospect' || c.status === 'messaged') { c.status = 'joined'; c.joinedAt = BB.now(); BB.save(); } };
  BB.crConnect = function () { var c = cr(); if (!c.connected) { c.connected = true; BB.save(); } };
  BB.crSubmit = function () {
    var c = cr();
    if (!c.connected || c.status === 'review' || c.status === 'verified') return false;
    c.status = 'review'; c.reviewAt = BB.now(); BB.save(); return true;
  };
  BB.crSetFee = function (fee) { cr().fee = fee; me().fee = fee; BB.save(); };
  BB.crAccept = function (id) { var x = BB.findDeal(id); if (x && x.d.stage === 'funded') BB.advance(x.c, x.d, 'accepted'); };
  BB.crDecline = function (id) { var x = BB.findDeal(id); if (x && x.d.stage === 'funded') { x.d.declined = true; BB.advance(x.c, x.d, 'refunded'); } };
  BB.crSendPlan = function (id) {
    var x = BB.findDeal(id);
    if (!x || x.d.stage !== 'accepted') return;
    if (x.d.changeRequested) x.d.revised = true;
    BB.advance(x.c, x.d, 'plan');
  };
  BB.crSubmitProof = function (id) { var x = BB.findDeal(id); if (x && x.d.stage === 'approved') BB.advance(x.c, x.d, 'live'); };

  /* ---------- pieces ---------- */
  function stageWord(c, d) {
    switch (d.stage) {
      case 'funded': return L('নতুন অফার', 'New offer');
      case 'accepted': return d.changeRequested && !d.revised ? L('ব্র্যান্ড একটা বদল চেয়েছে', 'The brand asked for one change') : L('প্ল্যান পাঠান', 'Send your plan');
      case 'plan': return L('ব্র্যান্ড প্ল্যান দেখছে', 'The brand is reviewing your plan');
      case 'approved': return L('পোস্ট করে প্রুফ দিন', 'Post it and submit proof');
      case 'live': return d.verified ? L('ব্র্যান্ড দেখেছে, টাকা আসছে', 'The brand checked it, money on the way') : L('পোস্ট হয়েছে, টাকা আসছে', 'Posted, money on the way');
      case 'disputed': return L('ব্র্যান্ড সমস্যা জানিয়েছে', 'The brand reported a problem');
      case 'paid': return L('টাকা পেয়েছেন', 'Paid');
      default: return L('বাতিল', 'Cancelled');
    }
  }
  function dealRow(x) {
    var b = BB.byBrand(x.c.brandId), href = x.d.stage === 'funded' ? '#/cr/offer/' + x.d.id : '#/cr/deal/' + x.d.id;
    return h('a', { class: 'card card-link', href: href },
      h('div', { class: 'kv' }, h('strong', null, BB.brandName(b)), h('strong', { class: 'big', style: 'font-size:20px' }, BB.money(x.d.fee))),
      h('div', { class: 'small muted' }, BB.txt(x.c.product) + ' · ' + BB.lbl(D.formats, x.c.format)),
      h('span', { class: 'chip chip-' + BB.stageTone(x.d), style: 'align-self:flex-start' }, stageWord(x.c, x.d)));
  }
  function moneyIn(d) { return d.stage !== 'refunded' && d.stage !== 'paid' && d.stage !== 'funded'; }

  /* ---------- C1: the invite, as a message from our team ---------- */
  BB.inviteText = function () {
    return [
      L('নুসরাত আপু, আপনার ফ্যাশন রিলগুলো দারুণ লাগে! আমরা Brandবন্ধু। ব্র্যান্ড আর কনটেন্ট ক্রিয়েটরদের পেইড কাজ মিলিয়ে দিই।',
        'Hi Nusrat, we love your fashion reels! We are Brandবন্ধু. We connect brands with content creators for paid work.'),
      L('ফি আগে থেকেই ঠিক থাকে, কাজ শুরুর আগেই টাকা জমা থাকে। পোস্টের 72 ঘণ্টা পর টাকা সরাসরি বিকাশ/নগদে।',
        'Your fee is agreed up front and the money is paid in before you start. It reaches your mobile wallet 72 hours after you post.'),
      L('জয়েন করা ফ্রি, আপনার ফি পুরোটাই আপনার।', 'Joining is free, and you keep your full fee.')
    ];
  };
  function viewInvite() {
    var c = cr();
    var msgs = c.status === 'prospect' ? [{ out: false, body: h('p', { class: 'muted' }, L('এখনো কোনো মেসেজ নেই।', 'No messages yet.')) }]
      : [{ out: false, at: c.invitedAt, body: BB.inviteText().map(function (t) { return h('p', null, t); }).concat([
          h('button', { type: 'button', class: 'btn btn-sm', 'data-j': 'join', onclick: function () { BB.crJoin(); BB.go('#/cr/join'); } }, L('জয়েন করুন, ফ্রি', 'Join, it\'s free'), icon('arrow', 16))]) }];
    return [h('div', { class: 'chat-wrap' }, BB.chat(msgs)), L('মেসেজ', 'Messages'),
      BB.outsideBar(L('Brandবন্ধু টিম', 'Brandবন্ধু team'), L('Instagram মেসেজ (আমাদের অ্যাপ না) · নুসরাতের ফোনে', 'Instagram message (not our app) · on Nusrat\'s phone'))];
  }

  /* ---------- C2/C3: join, connect the account, fee and wallet ---------- */
  function viewSetup() {
    var c = cr(), i = me(), done = c.status === 'review' || c.status === 'verified';
    var fee = c.fee || i.fee;
    var connectCard = h('div', { class: 'card' },
      h('h3', null, L('1. অ্যাকাউন্ট কানেক্ট করুন', '1. Connect your account')),
      c.connected
        ? h('div', { style: 'display:contents' },
            h('span', { class: 'chip chip-green', style: 'align-self:flex-start' }, icon('check', 14), D.platforms[i.platform] + L(' কানেক্টেড', ' connected')),
            h('dl', { class: 'stats' },
              h('div', null, h('dt', null, L('ফলোয়ার', 'Followers')), h('dd', null, BB.compact(i.followers))),
              h('div', null, h('dt', null, L('এনগেজমেন্ট', 'Engagement')), h('dd', null, BB.pct(i.eng))),
              h('div', null, h('dt', null, L('প্ল্যাটফর্ম', 'Platform')), h('dd', null, D.platforms[i.platform]))),
            h('p', { class: 'small muted' }, BB.audText(i)))
        : h('div', { style: 'display:contents' },
            h('p', { class: 'small' }, L('কানেক্ট করলে ফলোয়ার আর এনগেজমেন্ট সরাসরি আসে। তাই ব্র্যান্ড আপনার সংখ্যায় ভরসা করে।', 'Connecting brings in your followers and engagement directly, so brands trust your numbers.')),
            h('button', { type: 'button', class: 'btn', 'data-j': 'connect', style: 'align-self:flex-start', onclick: function () { BB.crConnect(); BB.toast(L('কানেক্ট হয়েছে।', 'Connected.')); BB.render(); } },
              icon(i.platform, 18), L(D.platforms[i.platform] + ' কানেক্ট করুন (ডেমো)', 'Connect ' + D.platforms[i.platform] + ' (demo)'))));
    var feeCard = h('div', { class: 'card' },
      h('h3', null, L('2. কাজের ধরন আর ফি', '2. Work you take and your fee')),
      h('div', { class: 'chips' }, fmtList().map(function (f) {
        var on = c.formats.indexOf(f) >= 0;
        return h('label', { class: 'chip-check' + (on ? ' on' : '') }, h('input', { type: 'checkbox', checked: on, disabled: done, onchange: function (e) {
          var k = c.formats.indexOf(f); if (e.target.checked && k < 0) c.formats.push(f); else if (!e.target.checked && k >= 0) c.formats.splice(k, 1); BB.save(); BB.render();
        } }), BB.lbl(D.formats, f));
      })),
      BB.field('cr-fee', L('আপনার ফি শুরু', 'Your fee starts at'), h('select', { id: 'cr-fee', disabled: done, onchange: function (e) { BB.crSetFee(+e.target.value); BB.render(); } },
        [5000, 6000, 8000, 10000, 12000].map(function (v) { return h('option', { value: v, selected: v === fee }, BB.money(v)); })),
        L('ব্র্যান্ড এই ফি দেখে অফার দেয়। পুরোটাই আপনার, আমরা কিছু কাটি না।', 'Brands see this fee when they book you. You keep all of it; we take nothing from it.')));
    var walletCard = h('div', { class: 'card' },
      h('h3', null, L('3. টাকা কোথায় নেবেন', '3. Where to get paid')),
      BB.field('cr-wallet', L('মোবাইল ওয়ালেট নম্বর (বিকাশ/নগদ)', 'Mobile wallet number'), h('input', { id: 'cr-wallet', type: 'text', value: c.wallet, readonly: true }), L('ডেমো: নম্বর লুকানো আছে', 'Demo: number hidden')),
      BB.kv(L('ওয়ালেটের নাম', 'Name on the wallet'), BB.infName(i)),
      h('p', { class: 'tiny muted' }, L('নামটা NID-র নামের সাথে মিলতে হবে।', 'The name has to match your NID.')));

    var top = done ? h('div', { class: 'panel ' + (c.status === 'verified' ? '' : 'attn') },
        h('strong', null, c.status === 'verified' ? L('আপনি ভেরিফায়েড', 'You are verified') : L('রিভিউ চলছে', 'Under review')),
        h('p', { class: 'small' }, c.status === 'verified' ? L('ব্র্যান্ডরা এখন আপনাকে খুঁজে পায়।', 'Brands can now find you.') : L('আমাদের টিম আপনার প্রোফাইল দেখছে। সাধারণত 24 ঘণ্টা লাগে।', 'Our team is checking your profile. It usually takes 24 hours.')))
      : null;
    return [h('div', { style: 'display:contents' },
      BB.pageHead(c.status === 'verified' ? L('আমার প্রোফাইল', 'My profile') : L('প্রোফাইল তৈরি করুন', 'Set up your profile'),
        done ? null : L('3টা ছোট ধাপ, 2 মিনিট লাগে।', 'Three short steps, about two minutes.')),
      top, connectCard, feeCard, walletCard,
      done ? null : h('button', { type: 'button', class: 'btn btn-yellow btn-block', 'data-j': 'submit-review', 'aria-disabled': c.connected ? null : 'true', onclick: function () {
        if (!c.connected) { BB.toast(L('আগে অ্যাকাউন্ট কানেক্ট করুন।', 'Connect your account first.')); return; }
        BB.crSubmit(); BB.toast(L('রিভিউর জন্য পাঠানো হয়েছে।', 'Sent for review.')); BB.go('#/cr');
      } }, L('রিভিউর জন্য পাঠান', 'Send for review'), icon('arrow', 18))),
      L('প্রোফাইল', 'Profile')];
  }

  /* ---------- C4: under review ---------- */
  function viewReview() {
    var c = cr();
    return [h('div', { style: 'display:contents' },
      h('div', { class: 'card empty' }, h('span', { class: 'chip chip-cream' }, icon('clock', 14), L('রিভিউ চলছে', 'Under review')),
        h('h2', null, L('আপনার প্রোফাইল দেখা হচ্ছে', 'We are checking your profile')),
        h('p', { class: 'muted' }, L('সাধারণত 24 ঘণ্টার মধ্যে। ভেরিফাই হলে ব্র্যান্ডরা আপনাকে দেখতে পাবে।', 'Usually within 24 hours. Once verified, brands can see you.'))),
      h('div', { class: 'card' }, h('ul', { class: 'ledger' }, [
        [true, L('অ্যাকাউন্ট কানেক্টেড', 'Account connected')],
        [true, L('ফি আর ওয়ালেট দেওয়া হয়েছে', 'Fee and wallet added')],
        [false, L('টিমের চেক', 'Team check')]
      ].map(function (x) { return h('li', null, icon(x[0] ? 'check' : 'clock', 18, x[0] ? 'verified' : null), h('span', null, x[1])); }))),
      h('a', { class: 'btn btn-ghost', href: '#/cr/join', style: 'align-self:flex-start' }, L('প্রোফাইল দেখুন', 'See my profile')),
      c.reviewAt ? h('p', { class: 'tiny muted' }, L('পাঠিয়েছেন ', 'Sent ') + BB.ago(c.reviewAt)) : null),
      L('রিভিউ', 'Review')];
  }

  /* ---------- C4: home with offers and work ---------- */
  function viewHome() {
    var i = me(), all = myDeals();
    var offers = all.filter(function (x) { return x.d.stage === 'funded'; });
    var work = all.filter(function (x) { return ['accepted', 'plan', 'approved', 'live', 'disputed'].indexOf(x.d.stage) >= 0; });
    var coming = BB.sum(all.filter(function (x) { return moneyIn(x.d); }).map(function (x) { return x.d; }), 'fee');
    var got = BB.sum(all.filter(function (x) { return x.d.stage === 'paid'; }).map(function (x) { return x.d; }), 'fee');
    return [h('div', { style: 'display:contents' },
      h('div', { class: 'row', style: 'flex-wrap:nowrap' }, BB.avatar(i, 'avatar-lg'),
        h('div', null, h('h1', null, L('হ্যালো, নুসরাত', 'Hi, Nusrat')),
          h('div', { class: 'chips' }, h('span', { class: 'chip chip-green' }, icon('shield', 14), L('ভেরিফায়েড', 'Verified')),
            h('span', { class: 'chip' }, icon(i.platform, 14), i.handle)))),
      h('div', { class: 'stat-grid' },
        BB.statCard(L('টাকা আসছে', 'On the way'), BB.money(coming), L('রাজি হওয়া কাজ থেকে', 'From work you accepted')),
        BB.statCard(L('পেয়েছেন', 'Paid to you'), BB.money(got))),
      h('h2', null, L('নতুন অফার', 'New offers')),
      offers.length ? h('div', { class: 'grid' }, offers.map(dealRow))
        : h('div', { class: 'card empty' }, h('p', { class: 'muted' }, L('এখনো নতুন অফার নেই। কোনো ব্র্যান্ড আপনাকে বাছলে এখানে আসবে।', 'No new offers yet. When a brand picks you, it shows up here.'))),
      work.length ? h('h2', null, L('চলমান কাজ', 'Work in progress')) : null,
      work.length ? h('div', { class: 'grid' }, work.map(dealRow)) : null),
      L('কাজ', 'Work')];
  }

  /* ---------- C5: an offer ---------- */
  function briefCard(x) {
    var c = x.c, d = x.d, b = BB.byBrand(c.brandId), timed = c.format === 'mention' || c.format === 'live';
    return h('div', { class: 'card' },
      h('div', { class: 'kv' }, h('h3', null, BB.brandName(b)), h('span', { class: 'chip' }, icon('facebook', 14), BB.compact(b.fans) + L(' ফলোয়ার', ' followers'))),
      h('span', { class: 'chip chip-green', style: 'align-self:flex-start' }, icon('shield', 14), L('ভেরিফায়েড ব্র্যান্ড: পেজ আর পণ্য চেক করা', 'Verified brand: page and product checked')),
      BB.kv(L('কী প্রচার', 'Promote'), BB.txt(c.product)),
      BB.kv(L('কীভাবে', 'How'), BB.lbl(D.formats, c.format)),
      timed ? BB.kv(L('কমপক্ষে', 'At least'), (c.minSec || 30) + L(' সেকেন্ড', ' seconds')) : null,
      BB.kv(L('পোস্ট করবেন', 'Post within'), (c.days || 5) + L(' দিনের মধ্যে', ' days')),
      BB.kv(L('ফলোয়ারদের জন্য কোড', 'Code for your followers'), h('span', { class: 'code' }, d.code + ' · ' + c.offer + L('% ছাড়', '% off'))),
      c.notes ? h('div', { class: 'proof' }, h('strong', { class: 'small' }, L('যা যা বলতে হবে', 'Key points to mention')), h('p', null, c.notes)) : null,
      h('p', { class: 'tiny muted' }, L('নিজের স্টাইলে, নিজের কনটেন্টে বলবেন। স্ক্রিপ্ট নেই।', 'Say it your own way, in your own content. No script.')));
  }
  function viewOffer(id) {
    var x = BB.findDeal(id);
    if (!x || x.d.infId !== BB.CR) return [BB.emptyCard(L('অফার পাওয়া যায়নি।', 'Offer not found.'), L('কাজে ফিরুন', 'Back to work'), '#/cr'), L('অফার', 'Offer')];
    if (x.d.stage !== 'funded') return viewDeal(id);
    var hh = BB.hold(x.d);
    return [h('div', { style: 'display:contents' },
      BB.pageHead(L('নতুন অফার', 'New offer'), null, '#/cr', L('সব কাজ', 'All work')),
      h('div', { class: 'card fee-card' },
        h('span', { class: 'small muted' }, L('আপনার ফি', 'Your fee')),
        h('span', { class: 'big', style: 'font-size:38px' }, BB.money(x.d.fee)),
        h('div', { class: 'panel', style: 'background:var(--green-s)' }, h('strong', { class: 'row', style: 'gap:6px;color:var(--green)' }, icon('lock', 18), L('টাকা আগেই জমা আছে', 'The money is already paid in')),
          h('p', { class: 'small' }, L('লাইসেন্সপ্রাপ্ত পেমেন্ট পার্টনারের কাছে। পোস্ট ' + hh + ' ঘণ্টা থাকলে পুরোটা আপনার ওয়ালেটে।', 'Held by a licensed payment partner. Keep the post up ' + hh + ' hours and all of it goes to your wallet.')))),
      briefCard(x),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn', 'data-j': 'accept', onclick: function () { BB.crAccept(id); BB.toast(L('কাজটা নিয়েছেন। এবার ছোট একটা প্ল্যান পাঠান।', 'Accepted. Now send a short plan.')); BB.go('#/cr/deal/' + id); } },
          icon('check', 18), L('কাজটা নিচ্ছি', 'I\'ll take it')),
        h('button', { type: 'button', class: 'btn btn-ghost', onclick: function () {
          if (!confirm(L('অফারটা ফিরিয়ে দেবেন? ব্র্যান্ড পুরো টাকা ফেরত পাবে।', 'Decline this offer? The brand gets its money back.'))) return;
          BB.crDecline(id); BB.toast(L('ফিরিয়ে দিয়েছেন।', 'Declined.')); BB.go('#/cr');
        } }, L('এবার না', 'Not this time')))),
      L('অফার', 'Offer')];
  }

  /* ---------- C6/C7/C8: a deal: plan, proof, waiting, paid ---------- */
  function viewDeal(id) {
    var x = BB.findDeal(id);
    if (!x || x.d.infId !== BB.CR) return [BB.emptyCard(L('কাজটা পাওয়া যায়নি।', 'Deal not found.'), L('কাজে ফিরুন', 'Back to work'), '#/cr'), L('কাজ', 'Work')];
    if (x.d.stage === 'funded') return viewOffer(id);
    var c = x.c, d = x.d, i = me(), b = BB.byBrand(c.brandId), hh = BB.hold(d), n = BB.now(), panel;
    var cur = ORDER.indexOf(d.stage === 'disputed' ? 'live' : d.stage);
    switch (d.stage) {
      case 'accepted': {
        var ta = h('textarea', { id: 'cr-plan', maxlength: 400 }, BB.planText(c, d));
        panel = h('div', { class: 'panel attn' },
          d.changeRequested && !d.revised ? h('strong', null, L('ব্র্যান্ড একটা বদল চেয়েছে। পয়েন্টগুলো আরেকবার দেখে প্ল্যানটা ঠিক করুন।', 'The brand asked for one change. Check the key points and adjust your plan.'))
            : h('strong', null, L('ছোট একটা প্ল্যান পাঠান', 'Send a short plan')),
          h('p', { class: 'small' }, L('পুরো ভিডিও না। শুধু কী বলবেন, কবে পোস্ট করবেন।', 'Not a finished video. Just what you will say and when you will post.')),
          BB.field('cr-plan', L('আপনার প্ল্যান', 'Your plan'), ta),
          h('button', { type: 'button', class: 'btn', 'data-j': 'send-plan', style: 'align-self:flex-start', onclick: function () { BB.crSendPlan(id); BB.toast(L('প্ল্যান পাঠানো হয়েছে।', 'Plan sent.')); BB.render(); } },
            L('প্ল্যান পাঠান', 'Send plan'), icon('arrow', 18)));
        break;
      }
      case 'plan':
        panel = h('div', { class: 'panel' }, h('strong', null, L(BB.txt(b.owner) + ' আপনার প্ল্যান দেখছেন', BB.txt(b.owner) + ' is reviewing your plan')),
          h('div', { class: 'proof' }, h('p', null, BB.planText(c, d))),
          h('p', { class: 'tiny muted' }, L('ব্র্যান্ড একবারই বদল চাইতে পারে।', 'The brand can ask for one change at most.')));
        break;
      case 'approved': {
        var pr = BB.makeProof(i, c.format, c.minSec, d.id), timed = c.format === 'mention' || c.format === 'live';
        panel = h('div', { class: 'panel attn' },
          h('strong', null, L('প্ল্যান অ্যাপ্রুভ হয়েছে। এবার পোস্ট করুন।', 'Plan approved. Time to post.')),
          h('p', { class: 'small' }, L('নিজের স্টাইলে, নিজের ' + (c.format === 'story' ? 'স্টোরিতে' : 'কনটেন্টে') + ' বলুন। কোড ' + d.code + ' মুখে বলুন।', 'Mention it your own way in your own ' + (c.format === 'story' ? 'story' : 'content') + '. Say the code ' + d.code + ' out loud.')),
          h('h3', null, L('পোস্টের প্রুফ', 'Proof of the post')),
          pr.ref ? BB.field('cr-link', L('পোস্টের লিংক', 'Post link'), h('input', { id: 'cr-link', type: 'text', value: pr.ref, readonly: true })) : h('p', { class: 'small' }, L('স্টোরির স্ক্রিন রেকর্ডিং দিন।', 'Add a screen recording of the story.')),
          timed ? BB.field('cr-time', L('কখন বলেছেন', 'When you mention it'), h('input', { id: 'cr-time', type: 'text', value: BB.mmss(pr.from) + ' – ' + BB.mmss(pr.to), readonly: true })) : null,
          BB.kv(L('কোড', 'Code'), h('span', { class: 'code' }, d.code)),
          h('button', { type: 'button', class: 'btn btn-yellow', 'data-j': 'submit-proof', style: 'align-self:flex-start', onclick: function () { BB.crSubmitProof(id); BB.toast(L('প্রুফ জমা হয়েছে। ' + hh + ' ঘণ্টার গণনা শুরু।', 'Proof submitted. The ' + hh + '-hour clock has started.')); BB.render(); } },
            icon('check', 18), L('প্রুফ জমা দিন', 'Submit proof')));
        break;
      }
      case 'live': {
        var m = BB.metrics(d, n), left = Math.max(0, hh - (n - d.t.liveAt) / BB.H), hl = Math.ceil(left);
        panel = h('div', { class: 'panel' },
          h('div', { class: 'kv' }, h('strong', null, L('টাকা আসছে', 'Money on the way')), h('span', { class: 'chip chip-green' }, icon('clock', 14), L(hl + ' ঘণ্টা বাকি', hl + 'h left'))),
          h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(m.x * 100), 'aria-label': L('কতটা সময় পার হয়েছে', 'Time passed') }, h('div', { style: 'width:' + Math.round(m.x * 100) + '%' })),
          h('p', { class: 'small' }, L('পোস্টটা ' + hh + ' ঘণ্টা রাখুন, মুছবেন না। তারপর ' + BB.money(d.fee) + ' আপনার ওয়ালেটে।', 'Keep the post up for ' + hh + ' hours, do not delete it. Then ' + BB.money(d.fee) + ' goes to your wallet.')),
          d.verified ? h('span', { class: 'chip chip-green', style: 'align-self:flex-start' }, icon('check', 14), L('ব্র্যান্ড উল্লেখ দেখে ঠিক বলেছে', 'The brand checked the mention'))
            : h('span', { class: 'chip chip-cream', style: 'align-self:flex-start' }, L('ব্র্যান্ড এখনো দেখছে', 'The brand is still checking')),
          BB.proofCard(c, d));
        break;
      }
      case 'disputed':
        panel = h('div', { class: 'panel attn' }, h('strong', null, L('ব্র্যান্ড একটা সমস্যা জানিয়েছে', 'The brand reported a problem')),
          h('p', { class: 'small' }, L('কারণ: ' + (d.disputeReason || '') + '। আমাদের টিম আপনার প্রুফ দেখছে। টাকা আপাতত আটকে আছে।', 'Reason: ' + (d.disputeReason || '') + '. Our team is checking your proof. The money is on hold for now.')),
          BB.proofCard(c, d));
        break;
      case 'paid':
        panel = h('div', { class: 'panel', style: 'background:var(--green-s)' },
          h('span', { class: 'small', style: 'color:var(--green);font-weight:700' }, L('আপনার ওয়ালেটে এসেছে', 'In your wallet')),
          h('span', { class: 'big', style: 'font-size:34px' }, BB.money(d.fee)),
          h('p', { class: 'small' }, S().cr.wallet + ' · ' + BB.ago(d.t.paidAt)),
          h('p', { class: 'small' }, icon('star', 15), ' ', L(BB.brandName(b) + ' আপনাকে 5 স্টার দিয়েছে', BB.brandName(b) + ' rated you 5 stars')),
          h('a', { class: 'btn btn-sm', href: '#/cr/earn', style: 'align-self:flex-start' }, L('আয় দেখুন', 'See earnings')));
        break;
      default:
        panel = h('div', { class: 'panel' }, h('strong', null, L('এই কাজটা বাতিল হয়েছে', 'This deal was cancelled')),
          h('p', { class: 'small' }, d.declined ? L('আপনি অফারটা ফিরিয়ে দিয়েছেন। ব্র্যান্ড টাকা ফেরত পেয়েছে।', 'You declined the offer. The brand got its money back.')
            : d.resolved === 'refund' ? L('টিম দেখেছে উল্লেখ ছিল না, তাই ব্র্যান্ড টাকা ফেরত পেয়েছে।', 'Our team found no mention, so the brand got its money back.')
            : L('ব্র্যান্ড ডিলটা বাতিল করেছে।', 'The brand cancelled the deal.')));
    }
    var steps = d.stage === 'refunded' ? null : h('ol', { class: 'dots', 'aria-label': stageWord(c, d) }, ORDER.map(function (s, k) {
      var isDone = k < cur || d.stage === 'paid';
      return h('li', { class: isDone ? 'done' : k === cur ? 'cur' : '' }, h('span', { class: 'd' }, isDone ? icon('check', 12) : null), k < ORDER.length - 1 ? h('span', { class: 'ln' }) : null);
    }));
    return [h('div', { style: 'display:contents' },
      BB.pageHead(BB.brandName(b), BB.txt(c.product) + ' · ' + BB.money(d.fee), '#/cr', L('সব কাজ', 'All work')),
      h('span', { class: 'chip chip-' + BB.stageTone(d), style: 'align-self:flex-start' }, stageWord(c, d)),
      steps, panel,
      d.stage === 'accepted' || d.stage === 'plan' ? briefCard(x) : null),
      L('কাজ', 'Work')];
  }

  /* ---------- C8: earnings ---------- */
  function viewEarn() {
    var all = myDeals(), c = cr();
    var paid = all.filter(function (x) { return x.d.stage === 'paid'; });
    var coming = all.filter(function (x) { return moneyIn(x.d); });
    var got = BB.sum(paid.map(function (x) { return x.d; }), 'fee');
    var jobs = (c.jobs || 0) + paid.length;
    var rating = c.jobs ? c.rating : paid.length ? 5 : null;
    return [h('div', { style: 'display:contents' },
      BB.pageHead(L('আমার আয়', 'My earnings'), null),
      h('div', { class: 'card fee-card', 'data-j': 'earn-total' },
        h('span', { class: 'small muted' }, L('মোট পেয়েছেন', 'Total paid to you')),
        h('span', { class: 'big', style: 'font-size:38px' }, BB.money(got)),
        h('span', { class: 'small muted' }, L('ওয়ালেট: ', 'Wallet: ') + c.wallet),
        coming.length ? h('span', { class: 'small' }, L('আরও আসছে: ', 'Still to come: ') + BB.money(BB.sum(coming.map(function (x) { return x.d; }), 'fee'))) : null),
      h('div', { class: 'stat-grid' },
        BB.statCard(L('কাজ শেষ', 'Jobs done'), BB.num(jobs)),
        BB.statCard(L('রেটিং', 'Rating'), rating ? rating.toFixed(1) + ' ★' : '—', rating ? null : L('প্রথম কাজের পর', 'After your first job'))),
      h('h2', null, L('পেমেন্টের হিসাব', 'Payouts')),
      paid.length ? h('div', { class: 'card' }, h('ul', { class: 'ledger' }, paid.map(function (x) {
        return h('li', null, h('span', { class: 't' }, BB.dateStr(x.d.t.paidAt)), h('span', { style: 'flex:1' }, BB.brandName(BB.byBrand(x.c.brandId))), h('strong', null, BB.money(x.d.fee)));
      }))) : h('div', { class: 'card empty' }, h('p', { class: 'muted' }, L('এখনো কোনো পেমেন্ট আসেনি।', 'No payouts yet.')))),
      L('আয়', 'Earnings')];
  }

  /* ---------- routing and tabs ---------- */
  BB.views.cr = function (r) {
    var c = cr(), sub = r.parts[1] || '', id = r.parts[2];
    if (c.status === 'prospect' || c.status === 'messaged') return viewInvite();
    if (sub === 'join' || c.status === 'joined') return viewSetup();
    if (c.status === 'review') return viewReview();
    if (sub === 'offer') return viewOffer(id);
    if (sub === 'deal') return viewDeal(id);
    if (sub === 'earn') return viewEarn();
    return viewHome();
  };
  BB.tabs.creator = function (r) {
    if (cr().status !== 'verified') return null;
    var sub = r.parts[1] || '';
    var cur = sub === 'earn' ? 'earn' : sub === 'join' ? 'me' : 'work';
    var n = myDeals().filter(function (x) { return x.d.stage === 'funded'; }).length;
    return BB.tabBar([['#/cr', 'work', L('কাজ', 'Work'), 'list', n || null], ['#/cr/earn', 'earn', L('আয়', 'Earnings'), 'wallet'], ['#/cr/join', 'me', L('প্রোফাইল', 'Profile'), 'star']], cur);
  };
})();
