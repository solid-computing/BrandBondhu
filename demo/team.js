/* Brandবন্ধু demo: our team's console. Shortlist requests, the creator pipeline (we find and message
   creators ourselves at the start), verification, the money and reported problems. */
(function () {
  'use strict';

  var BB = window.BB, h = BB.h, icon = BB.icon, L = BB.L, D = BB.D, S = BB.S;
  var STAGES = ['found', 'messaged', 'replied', 'joined', 'verified'];

  function stageName(s) {
    return { found: L('খুঁজে পাওয়া', 'Found'), messaged: L('মেসেজ পাঠানো', 'Messaged'), replied: L('উত্তর দিয়েছে', 'Replied'),
             joined: L('জয়েন করেছে', 'Joined'), verified: L('ভেরিফায়েড', 'Verified') }[s];
  }
  // Nusrat's place in our pipeline comes from her own status.
  function nusratStage() {
    return { prospect: 'found', messaged: 'messaged', joined: 'joined', review: 'joined', verified: 'verified' }[S().cr.status];
  }
  function personName(p) { return L(p.nameBn, p.nameEn); }
  function initialsOf(p) { return L(p.nameBn.charAt(0), p.nameEn.split(' ').map(function (w) { return w.charAt(0); }).join('').slice(0, 2)); }
  function miniAvatar(p, bg) { return h('div', { class: 'avatar avatar-sm', style: 'background:' + (bg || '#E3E6F0'), 'aria-hidden': 'true' }, initialsOf(p)); }
  function allDeals() {
    var out = [];
    S().campaigns.forEach(function (c) { c.deals.forEach(function (d) { out.push({ c: c, d: d }); }); });
    return out;
  }

  /* ---------- state changes (used by the screens and by journey.js) ---------- */
  BB.teamInvite = function (id) {
    if (id === BB.CR) { var c = S().cr; if (c.status === 'prospect') { c.status = 'messaged'; c.invitedAt = BB.now(); BB.save(); } return; }
    var p = S().prospects.filter(function (x) { return x.id === id; })[0];
    if (p && p.stage === 'found') { p.stage = 'messaged'; p.at = BB.now(); BB.save(); }
  };
  BB.teamVerify = function (id, ok) {
    if (id === BB.CR) {
      var c = S().cr;
      if (c.status !== 'review') return;
      if (ok) { c.status = 'verified'; c.verifiedAt = BB.now(); } else { c.status = 'joined'; }
      BB.save(); return;
    }
    var p = S().prospects.filter(function (x) { return x.id === id; })[0];
    if (p && p.stage === 'joined') { p.stage = ok ? 'verified' : 'replied'; p.at = BB.now(); if (!ok) p.asked = true; BB.save(); }
  };
  // Best 5 verified influencers for a request: same category, fee within budget, same city first.
  BB.matchesFor = function (q) {
    var b = BB.byBrand(q.brandId), max = D.budgets[q.budget].max;
    return D.influencers.filter(function (i) { return BB.isMember(i.id) && i.category === b.cat && i.fee <= max; })
      .sort(function (a, c) { return ((c.city === b.city) - (a.city === b.city)) || (c.rating - a.rating) || (c.followers - a.followers); })
      .slice(0, 5).map(function (i) { return i.id; });
  };
  BB.teamSendShortlist = function (qid) {
    var s = S(), q = s.requests.filter(function (x) { return x.id === qid; })[0];
    if (!q || q.status !== 'new') return false;
    q.picks = BB.matchesFor(q); q.status = 'sent'; q.sentAt = BB.now();
    if (q.brandId === s.brandId && s.seller.stage === 'requested') s.seller.stage = 'shortlisted';
    BB.save(); return true;
  };

  /* ---------- T1: shortlist requests ---------- */
  function viewRequests() {
    var qs = S().requests.slice().sort(function (a, b) { return b.at - a.at; });
    var open = qs.filter(function (q) { return q.status === 'new'; });
    var rest = qs.filter(function (q) { return q.status !== 'new'; });
    function head(q) {
      var b = BB.byBrand(q.brandId);
      return h('div', { class: 'kv' }, h('div', null, h('h3', null, BB.brandName(b)), h('div', { class: 'tiny muted' }, b.fb + ' · ' + q.phone)),
        h('span', { class: 'small muted' }, BB.ago(q.at)));
    }
    return [h('div', { style: 'display:contents' },
      BB.pageHead(L('শর্টলিস্ট রিকোয়েস্ট', 'Shortlist requests'), L('ল্যান্ডিং পেজ আর গ্রুপ পোস্টের ফর্ম থেকে আসে। 24 ঘণ্টার মধ্যে 5 জন পাঠাই।', 'They come from the landing page and group post forms. We send 5 picks within 24 hours.')),
      open.length ? open.map(function (q) {
        var b = BB.byBrand(q.brandId), picks = BB.matchesFor(q).map(BB.byId);
        return h('article', { class: 'card attn-card' }, head(q),
          h('div', { class: 'chips' }, h('span', { class: 'chip chip-pink' }, L('নতুন', 'New')), h('span', { class: 'chip chip-cream' }, BB.lbl(D.categories, b.cat)), h('span', { class: 'chip' }, BB.lbl(D.budgets, q.budget))),
          h('strong', { class: 'small' }, L('মিলিয়ে দেখা ' + picks.length + ' জন (ক্যাটাগরি, বাজেট, শহর)', picks.length + ' matches (category, budget, city)')),
          h('ul', { class: 'ledger' }, picks.map(function (i) {
            return h('li', { style: 'align-items:center' }, BB.avatar(i, 'avatar-sm'),
              h('span', { style: 'flex:1;min-width:0' }, h('strong', null, BB.infName(i)), h('span', { class: 'tiny muted', style: 'display:block' },
                D.platforms[i.platform] + ' · ' + BB.lbl(D.cities, i.city) + ' · ' + BB.compact(i.followers) + ' · ' + BB.pct(i.eng) + ' · ★ ' + i.rating.toFixed(1))),
              h('strong', null, BB.money(i.fee)));
          })),
          h('button', { type: 'button', class: 'btn', 'data-j': 'send-shortlist', style: 'align-self:flex-start', onclick: function () {
            BB.teamSendShortlist(q.id); BB.toast(L('চ্যাটে শর্টলিস্ট পাঠানো হয়েছে।', 'Shortlist sent in chat.')); BB.render();
          } }, L('চ্যাটে পাঠান', 'Send in chat'), icon('arrow', 18)));
      }) : h('div', { class: 'card empty' }, h('p', { class: 'muted' }, L('নতুন রিকোয়েস্ট নেই।', 'No new requests.'))),
      rest.length ? h('h2', null, L('আগের রিকোয়েস্ট', 'Earlier requests')) : null,
      rest.length ? h('div', { class: 'grid two' }, rest.map(function (q) {
        return h('div', { class: 'card' }, head(q),
          h('span', { class: 'chip ' + (q.status === 'converted' ? 'chip-green' : 'chip-cream'), style: 'align-self:flex-start' },
            q.status === 'converted' ? L('বুক করেছেন', 'Booked') : L('পাঠানো হয়েছে, উত্তরের অপেক্ষা', 'Sent, waiting for a reply')),
          h('div', { class: 'row', style: 'gap:4px' }, q.picks.map(function (id) { return BB.avatar(BB.byId(id), 'avatar-sm'); })));
      })) : null),
      L('রিকোয়েস্ট', 'Requests')];
  }

  /* ---------- T2: creator pipeline ---------- */
  function viewPipeline() {
    var s = S(), i = BB.byId(BB.CR);
    var people = s.prospects.map(function (p) { return { p: p, stage: p.stage, nusrat: false }; });
    people.unshift({ p: i, stage: nusratStage(), nusrat: true });
    var existing = D.influencers.filter(function (x) { return x.id !== BB.CR; }).length;
    var counts = STAGES.map(function (st) { return people.filter(function (x) { return x.stage === st; }).length + (st === 'verified' ? existing : 0); });

    function card(x) {
      var p = x.p, invite = x.stage === 'found';
      return h('div', { class: 'pipe-card' + (x.nusrat ? ' me' : '') },
        h('div', { class: 'row', style: 'flex-wrap:nowrap;gap:8px' }, x.nusrat ? BB.avatar(p, 'avatar-sm') : miniAvatar(p),
          h('div', { style: 'min-width:0' }, h('strong', { class: 'small' }, x.nusrat ? BB.infName(p) : personName(p)),
            h('div', { class: 'tiny muted' }, D.platforms[p.platform] + ' · ' + BB.lbl(D.categories, p.category) + ' · ' + BB.compact(p.followers)))),
        x.stage === 'joined' ? h('a', { class: 'tiny', href: '#/team/verify' }, L('রিভিউ বাকি', 'Needs review')) : null,
        x.stage === 'messaged' ? h('span', { class: 'tiny muted' }, L('উত্তরের অপেক্ষা', 'Waiting for a reply')) : null,
        x.stage === 'replied' ? h('span', { class: 'tiny muted' }, p.asked ? L('আরও তথ্য চাওয়া হয়েছে', 'Asked for more info') : L('জয়েন লিংক পাঠানো হয়েছে', 'Join link sent')) : null,
        invite && x.nusrat ? h('div', { class: 'invite-preview' }, BB.inviteText().map(function (t) { return h('p', null, t); })) : null,
        invite ? h('button', { type: 'button', class: 'btn btn-sm', 'data-j': x.nusrat ? 'invite-nusrat' : null, onclick: function () {
          BB.teamInvite(p.id); BB.toast(L('ইনভাইট পাঠানো হয়েছে।', 'Invite sent.')); BB.render();
        } }, L('ইনভাইট পাঠান', 'Send invite'), icon('arrow', 16)) : null);
    }
    return [h('div', { style: 'display:contents' },
      BB.pageHead(L('ক্রিয়েটর পাইপলাইন', 'Creator pipeline'), L('শুরুতে আমরা নিজেরাই ক্রিয়েটর খুঁজে মেসেজ করি। ভেরিফাই হলে তবেই সেলাররা দেখতে পান।', 'At the start we find creators and message them ourselves. Sellers only see them once verified.')),
      h('ol', { class: 'funnel' }, STAGES.map(function (st, k) {
        return h('li', null, h('span', { class: 'big' }, counts[k]), h('span', { class: 'tiny' }, stageName(st)));
      })),
      h('div', { class: 'board' }, STAGES.map(function (st) {
        var here = people.filter(function (x) { return x.stage === st; });
        return h('section', { class: 'col' }, h('h3', { class: 'small' }, stageName(st)),
          here.map(card),
          st === 'verified' ? h('p', { class: 'tiny muted' }, L('আরও ' + existing + ' জন আগে থেকেই ভেরিফায়েড', existing + ' more verified earlier')) : null,
          !here.length && st !== 'verified' ? h('p', { class: 'tiny muted' }, L('কেউ নেই', 'Nobody')) : null);
      }))),
      L('পাইপলাইন', 'Pipeline')];
  }

  /* ---------- T3: verification ---------- */
  function checks(person, isNusrat) {
    if (isNusrat) return [
      [true, L('অ্যাকাউন্ট কানেক্ট করা, সংখ্যা সরাসরি এসেছে', 'Account connected, numbers come straight from the platform')],
      [true, L('ফলোয়ার ধীরে ধীরে বেড়েছে, হঠাৎ লাফ নেই', 'Followers grew steadily, no sudden jumps')],
      [true, L('এনগেজমেন্ট ' + BB.pct(person.eng) + ': তার সাইজে স্বাভাবিক', 'Engagement ' + BB.pct(person.eng) + ': normal for her size')],
      [true, L('অডিয়েন্সের 91% বাংলাদেশে', '91% of her audience is in Bangladesh')],
      [true, L('ওয়ালেটের নাম আর NID-র নাম মিলেছে', 'Wallet name matches her NID')]
    ];
    return [
      [true, L('অ্যাকাউন্ট কানেক্ট করা', 'Account connected')],
      [!person.flag, person.flag ? BB.txt(person.flag) : L('ফলোয়ার স্বাভাবিকভাবে বেড়েছে', 'Followers grew normally')],
      [person.eng >= 1, L('এনগেজমেন্ট ' + BB.pct(person.eng), 'Engagement ' + BB.pct(person.eng))],
      [true, L('অডিয়েন্সের 84% বাংলাদেশে', '84% of the audience is in Bangladesh')]
    ];
  }
  function viewVerify() {
    var s = S(), i = BB.byId(BB.CR), queue = [];
    if (s.cr.status === 'review') queue.push({ p: i, nusrat: true });
    s.prospects.filter(function (p) { return p.stage === 'joined'; }).forEach(function (p) { queue.push({ p: p, nusrat: false }); });
    return [h('div', { style: 'display:contents' },
      BB.pageHead(L('ভেরিফিকেশন', 'Verification'), L('ডিরেক্টরিতে ওঠার আগে প্রত্যেক ক্রিয়েটরকে একবার চেক করি। ভুয়া ফলোয়ার থাকলে বাদ।', 'We check every creator once before they reach the directory. Fake followers are turned away.')),
      queue.length ? h('div', { class: 'grid two' }, queue.map(function (x) {
        var p = x.p, list = checks(p, x.nusrat), bad = list.some(function (c) { return !c[0]; });
        return h('article', { class: 'card' + (x.nusrat ? ' attn-card' : '') },
          h('div', { class: 'row', style: 'flex-wrap:nowrap' }, x.nusrat ? BB.avatar(p) : miniAvatar(p, '#FFD9C2'),
            h('div', { style: 'min-width:0' }, h('h3', null, x.nusrat ? BB.infName(p) : personName(p)), h('div', { class: 'tiny muted' }, p.handle + ' · ' + D.platforms[p.platform]))),
          h('dl', { class: 'stats' },
            h('div', null, h('dt', null, L('ফলোয়ার', 'Followers')), h('dd', null, BB.compact(p.followers))),
            h('div', null, h('dt', null, L('এনগেজমেন্ট', 'Engagement')), h('dd', null, BB.pct(p.eng))),
            h('div', null, h('dt', null, L('ক্যাটাগরি', 'Category')), h('dd', null, BB.lbl(D.categories, p.category)))),
          x.nusrat ? h('p', { class: 'small muted' }, BB.audText(p)) : null,
          h('ul', { class: 'ledger' }, list.map(function (c) {
            return h('li', { class: c[0] ? '' : 'warn' }, icon(c[0] ? 'check' : 'flag', 18, c[0] ? 'verified' : 'warn-i'), h('span', null, c[1]));
          })),
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn btn-sm' + (bad ? ' btn-ghost' : ''), 'data-j': x.nusrat ? 'approve-nusrat' : null, onclick: function () {
              BB.teamVerify(p.id, true); BB.toast(L('ভেরিফাই হয়েছে। এখন ডিরেক্টরিতে আছে।', 'Verified. Now in the directory.')); BB.render();
            } }, icon('check', 16), L('ভেরিফাই করুন', 'Verify')),
            h('button', { type: 'button', class: 'btn btn-sm ' + (bad ? 'btn-danger' : 'btn-ghost'), onclick: function () {
              BB.teamVerify(p.id, false); BB.toast(L('আরও তথ্য চাওয়া হয়েছে।', 'Asked for more information.')); BB.render();
            } }, icon('x', 16), L('এখন না, তথ্য চাই', 'Not yet, ask for info'))));
      })) : h('div', { class: 'card empty' }, h('p', { class: 'muted' }, L('রিভিউ বাকি নেই।', 'Nothing waiting for review.'))),
      s.cr.status === 'verified' && s.cr.verifiedAt ? h('p', { class: 'small' }, icon('check', 16, 'verified'), ' ', L(BB.infName(i) + ' ভেরিফায়েড (' + BB.ago(s.cr.verifiedAt) + ')', BB.infName(i) + ' verified (' + BB.ago(s.cr.verifiedAt) + ')')) : null),
      L('ভেরিফাই', 'Verify')];
  }

  /* ---------- T4: money ---------- */
  function viewMoney() {
    var all = allDeals(), n = BB.now();
    var paidIn = BB.sum(all.map(function (x) { return x.d; }), 'total');
    var held = BB.sum(all.filter(function (x) { return BB.HELD.indexOf(x.d.stage) >= 0; }).map(function (x) { return x.d; }), 'total');
    var paid = all.filter(function (x) { return x.d.stage === 'paid'; }).map(function (x) { return x.d; });
    var refunded = all.filter(function (x) { return x.d.stage === 'refunded'; }).map(function (x) { return x.d; });
    var live = all.filter(function (x) { return x.d.stage === 'live'; }).sort(function (a, b) { return (a.d.t.liveAt + BB.hold(a.d) * BB.H) - (b.d.t.liveAt + BB.hold(b.d) * BB.H); });
    var ev = [];
    all.forEach(function (x) {
      var b = BB.brandName(BB.byBrand(x.c.brandId)), nm = BB.infName(BB.byId(x.d.infId)), d = x.d, who = b + ' × ' + nm;
      ev.push([d.t.fundedAt, who, L('জমা ' + BB.money(d.total), 'Paid in ' + BB.money(d.total))]);
      if (d.t.paidAt) ev.push([d.t.paidAt, who, L(nm + ' পেলেন ' + BB.money(d.fee) + ' · আমাদের ফি ' + BB.money(d.pf) + ' · ভ্যাট ' + BB.money(d.vat), nm + ' got ' + BB.money(d.fee) + ' · our fee ' + BB.money(d.pf) + ' · VAT ' + BB.money(d.vat))]);
      if (d.t.refundedAt) ev.push([d.t.refundedAt, who, L(BB.money(d.total) + ' ফেরত গেছে', BB.money(d.total) + ' refunded')]);
      if (d.t.disputedAt) ev.push([d.t.disputedAt, who, L('সমস্যা জানানো হয়েছে, পেমেন্ট আটকে', 'Problem reported, payout on hold')]);
    });
    ev.sort(function (a, b) { return b[0] - a[0]; });
    return [h('div', { style: 'display:contents' },
      BB.pageHead(L('টাকার হিসাব', 'Money'), L('টাকা থাকে লাইসেন্সপ্রাপ্ত পেমেন্ট পার্টনারের কাছে, আমাদের কাছে না। ডিল শেষ হলে তবেই আমাদের ফি আমাদের আয়।', 'The money sits with a licensed payment partner, not with us. Our fee becomes our revenue only when a deal finishes.')),
      h('div', { class: 'stat-grid six' },
        BB.statCard(L('মোট জমা', 'Paid in'), BB.money(paidIn)),
        BB.statCard(L('এখন জমা আছে', 'Held now'), BB.money(held), L('পেমেন্ট পার্টনারের কাছে', 'With the payment partner')),
        BB.statCard(L('ক্রিয়েটরদের দেওয়া', 'Paid to creators'), BB.money(BB.sum(paid, 'fee'))),
        BB.statCard(L('আমাদের আয়', 'Our revenue'), BB.money(BB.sum(paid, 'pf')), L('ক্রিয়েটরের ফির উপর 15%', '15% on top of the creator fee')),
        BB.statCard(L('ভ্যাট', 'VAT'), BB.money(BB.sum(paid, 'vat')), L('সরকারকে যায়', 'Goes to the government')),
        BB.statCard(L('ফেরত', 'Refunded'), BB.money(BB.sum(refunded, 'total')))),
      h('div', { class: 'card' }, h('div', { class: 'kv' }, h('h3', null, L('শিগগির টাকা ছাড়া হবে', 'Releasing soon')),
          h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'data-j': 'ff', onclick: function () { BB.fastForward(72); } }, icon('clock', 16), L('72 ঘণ্টা এগিয়ে যান (ডেমো)', 'Fast-forward 72 hours (demo)'))),
        live.length ? h('ul', { class: 'ledger' }, live.map(function (x) {
          var left = Math.max(0, BB.hold(x.d) - (n - x.d.t.liveAt) / BB.H);
          return h('li', { style: 'align-items:center' }, h('span', { class: 't' }, L(Math.ceil(left) + ' ঘণ্টা বাকি', Math.ceil(left) + 'h left')),
            h('span', { style: 'flex:1' }, BB.brandName(BB.byBrand(x.c.brandId)) + ' × ' + BB.infName(BB.byId(x.d.infId))), h('strong', null, BB.money(x.d.fee)));
        })) : h('p', { class: 'small muted' }, L('এখন কোনো পোস্ট গণনায় নেই।', 'No posts are on the clock right now.'))),
      h('div', { class: 'card' }, h('h3', null, L('সব লেনদেন', 'All money movements')),
        h('ul', { class: 'ledger' }, ev.slice(0, 14).map(function (e) {
          return h('li', null, h('span', { class: 't' }, BB.ago(e[0])), h('span', null, h('strong', { class: 'small', style: 'display:block' }, e[1]), e[2]));
        })))),
      L('টাকা', 'Money')];
  }

  /* ---------- T5: reported problems ---------- */
  function viewProblems() {
    var all = allDeals();
    var open = all.filter(function (x) { return x.d.stage === 'disputed'; });
    var done = all.filter(function (x) { return x.d.resolved; });
    return [h('div', { style: 'display:contents' },
      BB.pageHead(L('সমস্যা', 'Problems'), L('সেলার সমস্যা জানালে পেমেন্ট আটকে যায়। প্রুফ আর পোস্ট মিলিয়ে আমরা সিদ্ধান্ত নিই।', 'When a seller reports a problem, the payout freezes. We compare the proof with the post and decide.')),
      open.length ? open.map(function (x) {
        var c = x.c, d = x.d, b = BB.byBrand(c.brandId), i = BB.byId(d.infId);
        return h('article', { class: 'card attn-card' },
          h('div', { class: 'kv' }, h('h3', null, BB.brandName(b) + ' × ' + BB.infName(i)), h('strong', null, BB.money(d.total))),
          h('div', { class: 'grid two' },
            h('div', { class: 'proof' }, h('strong', null, L('সেলারের অভিযোগ', 'Seller\'s complaint')), h('p', null, d.disputeReason || ''), h('span', { class: 'tiny muted' }, BB.ago(d.t.disputedAt))),
            BB.proofCard(c, d)),
          h('p', { class: 'small muted' }, L('টিম লিংক খুলে প্রুফের সময়টা দেখে: উল্লেখ আছে কি না, কোড ঠিক কি না।', 'The team opens the link at the proof time: is the mention there, is the code right?')),
          h('div', { class: 'row' },
            h('button', { type: 'button', class: 'btn btn-danger btn-sm', 'data-j': 'refund', onclick: function () {
              BB.resolveDispute(c, d, 'refund'); BB.toast(L('উল্লেখ ছিল না। সেলার পুরো টাকা ফেরত পেয়েছেন।', 'No mention. The seller got a full refund.')); BB.render();
            } }, L('উল্লেখ নেই: পুরো টাকা ফেরত', 'No mention: full refund')),
            h('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'data-j': 'resume', onclick: function () {
              BB.resolveDispute(c, d, 'resume'); BB.toast(L('উল্লেখ ঠিক আছে। পেমেন্ট আবার চালু।', 'The mention is there. Payout resumed.')); BB.render();
            } }, L('উল্লেখ আছে: পেমেন্ট চালু', 'Mention is there: resume payout'))));
      }) : h('div', { class: 'card empty' }, h('p', { class: 'muted' }, L('এখন কোনো সমস্যা নেই।', 'No open problems.'))),
      done.length ? h('h2', null, L('সমাধান হয়েছে', 'Resolved')) : null,
      done.length ? h('div', { class: 'card' }, h('ul', { class: 'ledger' }, done.map(function (x) {
        return h('li', null, h('span', { class: 'chip ' + (x.d.resolved === 'refund' ? 'chip-red' : 'chip-green') }, x.d.resolved === 'refund' ? L('ফেরত', 'Refunded') : L('পেমেন্ট চালু', 'Resumed')),
          h('span', null, BB.brandName(BB.byBrand(x.c.brandId)) + ' × ' + BB.infName(BB.byId(x.d.infId))));
      }))) : null),
      L('সমস্যা', 'Problems')];
  }

  /* ---------- routing and tabs ---------- */
  BB.views.team = function (r) {
    switch (r.parts[1]) {
      case 'pipeline': return viewPipeline();
      case 'verify': return viewVerify();
      case 'money': return viewMoney();
      case 'problems': return viewProblems();
      default: return viewRequests();
    }
  };
  BB.tabs.team = function (r) {
    var s = S(), sub = r.parts[1] || 'requests';
    var nReq = s.requests.filter(function (q) { return q.status === 'new'; }).length;
    var nVer = (s.cr.status === 'review' ? 1 : 0) + s.prospects.filter(function (p) { return p.stage === 'joined'; }).length;
    var nProb = allDeals().filter(function (x) { return x.d.stage === 'disputed'; }).length;
    return BB.tabBar([
      ['#/team', 'requests', L('রিকোয়েস্ট', 'Requests'), 'list', nReq || null],
      ['#/team/pipeline', 'pipeline', L('ক্রিয়েটর', 'Creators'), 'search'],
      ['#/team/verify', 'verify', L('ভেরিফাই', 'Verify'), 'shield', nVer || null],
      ['#/team/money', 'money', L('টাকা', 'Money'), 'wallet'],
      ['#/team/problems', 'problems', L('সমস্যা', 'Problems'), 'flag', nProb || null]
    ], sub);
  };
})();
