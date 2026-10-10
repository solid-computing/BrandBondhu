/* Brandবন্ধু demo: the guided journey (only in the journey world, inside the player at /demo/).
   One deal, Dhaka Threads x Nusrat, from the first invite to the payout. Each step has a lane, a
   phase, its words, the screen it happens on, the button to highlight, an action and a "done" test
   on the state. The current step is the first one that is not done, so the diagram always follows
   the real state, whether the viewer taps the buttons or presses Next.
   The player (player.js) talks to this file through window.BBAPP. */
(function () {
  'use strict';

  var BB = window.BB;
  if (BB.WORLD !== 'journey') return;
  var L = BB.L, S = BB.S, m = BB.money;
  var ORDER = ['funded', 'accepted', 'plan', 'approved', 'live', 'paid'];

  function deal() { var id = S().j.dealId; return id ? BB.findDeal(id) : null; }
  function at(x) { return !x ? -1 : x.d.stage === 'disputed' ? 4 : ORDER.indexOf(x.d.stage); }   // refunded = -1
  function camp() { return '#/c/' + S().j.campaignId; }
  function dealRoute(kind) { return '#/cr/' + kind + '/' + S().j.dealId; }
  // Amounts for the words: the real deal once it exists, else what Nusrat's fee would cost.
  function amt() { var x = deal(); return x ? x.d : BB.price(BB.byId(BB.CR).fee); }

  var PHASES = [null,
    { bn: 'ইনফ্লুয়েন্সার আনা', en: 'Bring in influencers' },
    { bn: 'সেলার আনা', en: 'Win a seller' },
    { bn: 'বুকিং আর পেমেন্ট', en: 'Book and pay' },
    { bn: 'পোস্ট আর চেক', en: 'Post and check' },
    { bn: 'টাকা আর ফলাফল', en: 'Paid, and the results' },
    { bn: 'ভুল হলে কী হয়?', en: 'What if it goes wrong?' }];
  var LANES = { seller: { bn: 'সেলার', en: 'Seller' }, team: { bn: 'Brandবন্ধু টিম', en: 'Brandবন্ধু team' }, creator: { bn: 'ইনফ্লুয়েন্সার', en: 'Influencer' } };

  // gap = hours that pass before the step happens, so times read naturally.
  var MAIN = [
    { lane: 'team', phase: 1, gap: 0,
      t: function () { return L('নুসরাতকে ইনভাইট', 'Invite Nusrat'); },
      cap: function () { return L('শুরুতে ইনফ্লুয়েন্সার আমরা নিজেরাই খুঁজি। নুসরাতের ফ্যাশন রিল দেখে টিম তাকে ইনভাইট পাঠায়।', 'At the start we find influencers ourselves. Our team spots Nusrat\'s fashion reels and sends her an invite.'); },
      why: function () { return L('আগে ইনফ্লুয়েন্সার, তারপর সেলার। তাই সেলার এসেই রেডি ইনফ্লুয়েন্সার পান।', 'Influencers first, so every seller finds checked influencers waiting.'); },
      route: function () { return '#/team/pipeline'; }, target: function () { return '[data-j="invite-nusrat"]'; },
      done: function (s) { return s.cr.status !== 'prospect'; },
      act: function () { BB.teamInvite(BB.CR); } },
    { lane: 'creator', phase: 1, gap: 3,
      t: function () { return L('মেসেজ পেয়ে জয়েন', 'Gets the invite, joins'); },
      cap: function () { return L('নুসরাত মেসেজটা পেয়ে জয়েন করেন। ইনফ্লুয়েন্সারদের জন্য একদম ফ্রি।', 'Nusrat reads the message and joins. It is free for influencers.'); },
      route: function () { return '#/cr'; }, target: function () { return '[data-j="join"]'; },
      done: function (s) { return ['joined', 'review', 'verified'].indexOf(s.cr.status) >= 0; },
      act: function () { BB.crJoin(); } },
    { lane: 'creator', phase: 1, gap: 1,
      t: function () { return L('অ্যাকাউন্ট কানেক্ট, ফি ঠিক', 'Connects account, sets fee'); },
      cap: function () { return L('নিজের অ্যাকাউন্ট কানেক্ট করেন, তাই সংখ্যাগুলো আসল। তারপর ফি আর ওয়ালেট নম্বর দিয়ে রিভিউতে পাঠান।', 'She connects her account, so her numbers are real, then adds her fee and wallet and sends it for review.'); },
      route: function () { return '#/cr/join'; },
      target: function () { return S().cr.connected ? '[data-j="submit-review"]' : '[data-j="connect"]'; },
      done: function (s) { return s.cr.status === 'review' || s.cr.status === 'verified'; },
      act: function () { BB.crConnect(); BB.crSubmit(); } },
    { lane: 'team', phase: 1, gap: 18,
      t: function () { return L('চেক করে ভেরিফাই', 'Checks and verifies'); },
      cap: function () { return L('টিম তার ফলোয়ার, এনগেজমেন্ট আর অডিয়েন্স চেক করে ভেরিফাই করে। এখন সেলাররা তাকে দেখতে পাবেন।', 'Our team checks her followers, engagement and audience, then verifies her. Now sellers can see her.'); },
      why: function () { return L('ভুয়া ফলোয়ারওয়ালা কেউ সেলারের সামনে আসে না।', 'Nobody with fake followers ever reaches a seller.'); },
      route: function () { return '#/team/verify'; }, target: function () { return '[data-j="approve-nusrat"]'; },
      done: function (s) { return s.cr.status === 'verified'; },
      act: function () { BB.teamVerify(BB.CR, true); } },
    { lane: 'seller', phase: 2, gap: 30,
      t: function () { return L('পোস্ট দেখে শর্টলিস্ট চান', 'Sees our post, asks'); },
      cap: function () { return L('সাদিয়া ফেসবুকে ঢাকা থ্রেডস নামে কাপড়ের পেজ চালান। সেলারদের গ্রুপে আমাদের পোস্ট দেখে ফ্রি শর্টলিস্ট চান।', 'Sadia runs Dhaka Threads, a clothing page on Facebook. She sees our post in a sellers\' group and asks for a free shortlist.'); },
      route: function () { return '#/s/post'; }, target: function () { return '[data-j="ask-shortlist"]'; },
      done: function (s) { return s.seller.stage !== 'stranger'; },
      act: function () { BB.sellerRequest(); } },
    { lane: 'team', phase: 2, gap: 16,
      t: function () { return L('5 জন বেছে পাঠায়', 'Picks 5, sends them'); },
      cap: function () { return L('রিকোয়েস্ট টিমের কাছে আসে। তার বাজেটে মানানসই 5 জন ভেরিফায়েড ফ্যাশন ইনফ্লুয়েন্সার বেছে চ্যাটে পাঠানো হয়।', 'The request reaches our team. We pick 5 verified fashion influencers that fit her budget and send them in chat.'); },
      why: function () { return L('মানুষ বেছে দেয়, বট না। ক্যাটাগরি, শহর আর বাজেট মিলিয়ে।', 'Picked by people, not a bot: matched on category, city and budget.'); },
      route: function () { return '#/team'; }, target: function () { return '[data-j="send-shortlist"]'; },
      done: function (s) { return s.seller.stage === 'shortlisted' || s.seller.stage === 'customer'; },
      act: function () { var q = BB.myRequest(); if (q) BB.teamSendShortlist(q.id); } },
    { lane: 'seller', phase: 2, gap: 2,
      t: function () { return L('চ্যাটে শর্টলিস্ট পান', 'Gets the shortlist'); },
      cap: function () { return L('চ্যাটে শর্টলিস্ট আসে, সবার ফি আর অডিয়েন্স সহ। শুরুতে সাদিয়া নুসরাতকে বাছেন।', 'The shortlist arrives in chat with each fee and audience. Sadia starts with Nusrat.'); },
      route: function () { return '#/s/chat'; }, target: function () { return '[data-j="book-picked"]'; },
      done: function (s) { return s.seller.stage === 'customer'; },
      act: function () { BB.sellerPick([BB.CR]); } },
    { lane: 'seller', phase: 3, gap: 1,
      t: function () { return L('কী বলতে হবে লেখেন', 'Writes the key points'); },
      cap: function () { var p = amt(); return L('কী কী বলতে হবে সেটা লেখেন, পুরো স্ক্রিপ্ট না। দাম পরিষ্কার: ফি ' + m(p.fee) + ' + আমাদের 15% ' + m(p.pf) + ' + ভ্যাট ' + m(p.vat) + '।', 'She writes what to mention, not a script. The price is clear: fee ' + m(p.fee) + ' + our 15% ' + m(p.pf) + ' + VAT ' + m(p.vat) + '.'); },
      route: function () { return '#/brief'; }, target: function () { return '[data-j="to-pay"]'; },
      done: function (s) { return !!s.brief.ready || !!s.j.dealId; },
      act: function () { S().brief.ready = true; BB.save(); } },
    { lane: 'seller', phase: 3, gap: 0.3,
      t: function () { return L(m(amt().total) + ' জমা দেন', 'Pays ' + m(amt().total)); },
      cap: function () { return L('সাদিয়া ' + m(amt().total) + ' জমা দেন। টাকা থাকে লাইসেন্সপ্রাপ্ত পেমেন্ট পার্টনারের কাছে, নুসরাত এখনো পান না।', 'Sadia pays ' + m(amt().total) + '. A licensed payment partner holds it. Nusrat is not paid yet.'); },
      why: function () { return L('মেসেঞ্জারে অচেনা কাউকে আগে টাকা দেওয়ার ঝামেলা শেষ।', 'No more paying strangers up front over Messenger.'); },
      route: function () { return '#/pay'; }, target: function () { return '[data-j="pay"]'; },
      done: function (s) { return !!s.j.dealId; },
      act: function () { var s = S(); if (s.shortlist.indexOf(BB.CR) < 0) s.shortlist.unshift(BB.CR); s.shortlist = s.shortlist.slice(0, 5); BB.fundCampaign(); } },
    { lane: 'creator', phase: 3, gap: 5,
      t: function () { return L('অফার নেন', 'Accepts the offer'); },
      cap: function () { return L('নুসরাত অফার দেখেন। টাকা আগেই জমা, তাই পেমেন্ট নিয়ে চিন্তা নেই। তিনি কাজটা নেন।', 'Nusrat sees the offer. The money is already in, so she knows she will be paid. She takes it.'); },
      why: function () { return L('ইনফ্লুয়েন্সারকে টাকার জন্য পিছে ঘুরতে হয় না।', 'Influencers never chase a brand for payment.'); },
      route: function () { return dealRoute('offer'); }, target: function () { return '[data-j="accept"]'; },
      done: function () { return at(deal()) >= 1; },
      act: function () { BB.crAccept(S().j.dealId); } },
    { lane: 'creator', phase: 4, gap: 7,
      t: function () { return L('প্ল্যান পাঠান', 'Shares a plan'); },
      cap: function () { var x = deal(); return L('ছোট একটা প্ল্যান পাঠান: কী বলবেন, কবে পোস্ট, আর কোড ' + (x ? x.d.code : '') + '।', 'She sends a short plan: what she will say, when she will post, and the code ' + (x ? x.d.code : '') + '.'); },
      route: function () { return dealRoute('deal'); }, target: function () { return '[data-j="send-plan"]'; },
      done: function () { return at(deal()) >= 2; },
      act: function () { BB.crSendPlan(S().j.dealId); } },
    { lane: 'seller', phase: 4, gap: 3,
      t: function () { return L('প্ল্যান অ্যাপ্রুভ', 'Approves the plan'); },
      cap: function () { return L('সাদিয়া প্ল্যান অ্যাপ্রুভ করেন। চাইলে একবার বদল চাইতে পারেন, বারবার না।', 'Sadia approves the plan. She could ask for one change, but no endless back and forth.'); },
      route: camp, target: function () { return '[data-j="approve-plan"]'; },
      done: function () { return at(deal()) >= 3; },
      act: function () { var x = deal(); BB.advance(x.c, x.d, 'approved'); } },
    { lane: 'creator', phase: 4, gap: 26,
      t: function () { return L('পোস্ট করে প্রুফ দেন', 'Posts, sends proof'); },
      cap: function () { return L('নুসরাত নিজের ভিডিওতেই ঢাকা থ্রেডসের কথা বলেন, তারপর প্রুফ দেন: লিংক, কখন বলেছেন, আর কোড।', 'Nusrat mentions Dhaka Threads in her own video, then sends proof: the link, when she says it, and the code.'); },
      why: function () { return L('প্রুফ মানে লিংক আর সময়। যে কেউ খুলে মিলিয়ে দেখতে পারে।', 'Proof is a link and a timestamp that anyone can open and check.'); },
      route: function () { return dealRoute('deal'); }, target: function () { return '[data-j="submit-proof"]'; },
      done: function () { return at(deal()) >= 4; },
      act: function () { BB.crSubmitProof(S().j.dealId); } },
    { lane: 'seller', phase: 4, gap: 4,
      t: function () { return L('উল্লেখ চেক করেন', 'Checks the mention'); },
      cap: function () { return L('সাদিয়া লিংক খুলে উল্লেখটা দেখেন আর ঠিক আছে বলেন।', 'Sadia opens the link, sees the mention and confirms it.'); },
      route: camp, target: function () { return '[data-j="confirm-mention"]'; },
      done: function () { var x = deal(); return !!x && (x.d.verified || x.d.stage === 'paid'); },
      act: function () { var x = deal(); x.d.verified = true; BB.save(); } },
    { lane: 'team', phase: 5, gap: 0,
      t: function () { return L('72 ঘণ্টা পর টাকা ছাড়', 'Money released'); },
      cap: function () { var p = amt(); return L('পোস্ট 72 ঘণ্টা থাকে। তারপর টাকা ছাড়া হয়: নুসরাত পান ' + m(p.fee) + ', আমাদের আয় ' + m(p.pf) + ', ভ্যাট ' + m(p.vat) + ' সরকারকে।', 'The post stays up 72 hours. Then the money is released: ' + m(p.fee) + ' to Nusrat, ' + m(p.pf) + ' to us, ' + m(p.vat) + ' VAT to the government.'); },
      why: function () { return L('ডিল শেষ হলেই তবে আমাদের আয়।', 'We only earn when a deal completes.'); },
      route: function () { return '#/team/money'; }, target: function () { return '[data-j="ff"]'; },
      done: function () { var x = deal(); return !!x && x.d.stage === 'paid'; },
      act: function () { var x = deal(); BB.moveClock(BB.hold(x.d)); } },
    { lane: 'creator', phase: 5, gap: 0, view: true,
      t: function () { return L(m(amt().fee) + ' পান', 'Gets ' + m(amt().fee)); },
      cap: function () { return L('নুসরাতের ওয়ালেটে ' + m(amt().fee) + ' চলে আসে, পুরোটাই। রেটিংও যোগ হয়।', m(amt().fee) + ' lands in Nusrat\'s wallet, all of it, and she gets her first rating.'); },
      route: function () { return '#/cr/earn'; }, target: function () { return '[data-j="earn-total"]'; },
      done: function (s) { return s.j.seen >= 16; },
      act: function () { S().j.seen = Math.max(S().j.seen, 16); BB.save(); } },
    { lane: 'seller', phase: 5, gap: 0, view: true,
      t: function () { return L('অর্ডার আর খরচ দেখেন', 'Sees orders and cost'); },
      cap: function () { return L('সাদিয়া দেখেন কতজন দেখেছে, কত ক্লিক, কোড দিয়ে কত অর্ডার, আর প্রতি অর্ডারে খরচ কত। তারপর আবার চালাতে পারেন।', 'Sadia sees reach, clicks, orders from the code and her cost per order. Then she can run it again.'); },
      why: function () { return L('প্রত্যেক ইনফ্লুয়েন্সারের আলাদা কোড, তাই কে বিক্রি আনলো পরিষ্কার।', 'Every influencer has their own code, so it is clear who sold.'); },
      route: camp, target: function () { return '[data-j="results"]'; },
      done: function (s) { return s.j.seen >= 17; },
      act: function () { S().j.seen = Math.max(S().j.seen, 17); BB.save(); } }
  ];

  // Starts from the state right after step 13 (posted, proof in, not yet confirmed).
  var WHATIF = [
    { lane: 'seller', phase: 6, gap: 5,
      t: function () { return L('সমস্যা জানান', 'Reports a problem'); },
      cap: function () { return L('ধরুন নুসরাত আসলে কিছু বলেননি। সাদিয়া "উল্লেখ নেই" জানান, সাথে সাথে পেমেন্ট আটকে যায়।', 'Say Nusrat never actually mentioned it. Sadia reports "no mention" and the payout freezes at once.'); },
      route: camp, target: function () { return '[data-j="report"]'; },
      done: function () { var x = deal(); return !!x && (x.d.stage === 'disputed' || !!x.d.resolved); },
      act: function () { var x = deal(); x.d.disputeReason = L('কোনো উল্লেখ নেই', 'The sponsor was not mentioned'); BB.advance(x.c, x.d, 'disputed'); } },
    { lane: 'team', phase: 6, gap: 6,
      t: function () { return L('প্রুফ দেখে সিদ্ধান্ত', 'Checks proof, decides'); },
      cap: function () { return L('টিম প্রুফের লিংক খুলে সময়টা দেখে। উল্লেখ নেই, তাই সেলার টাকা ফেরত পান। উল্লেখ থাকলে উল্টো পেমেন্ট চালু হতো।', 'Our team opens the proof link at the given time. No mention, so the seller is refunded. Had it been there, the payout would carry on.'); },
      why: function () { return L('সেলার আর ইনফ্লুয়েন্সার দুজনই সুরক্ষিত।', 'Sellers and influencers are both protected.'); },
      route: function () { return '#/team/problems'; }, target: function () { return '[data-j="refund"]'; },
      done: function () { var x = deal(); return !!x && !!x.d.resolved; },
      act: function () { var x = deal(); BB.resolveDispute(x.c, x.d, 'refund'); } },
    { lane: 'seller', phase: 6, gap: 0, view: true,
      t: function () { return L('পুরো টাকা ফেরত', 'Gets it all back'); },
      cap: function () {
        var x = deal();
        if (x && x.d.resolved === 'resume') return L('উল্লেখ ঠিক ছিল, তাই পেমেন্ট আবার চালু হলো। 72 ঘণ্টা শেষে নুসরাত টাকা পাবেন।', 'The mention was there, so the payout carried on. Nusrat is paid once the 72 hours are up.');
        return L('সাদিয়া পুরো ' + m(amt().total) + ' ফেরত পান। পোস্ট না হলে কারো টাকা হারায় না।', 'Sadia gets all ' + m(amt().total) + ' back. If nothing is posted, nobody loses money.');
      },
      route: camp, target: function () { var x = deal(); return x && x.d.resolved === 'resume' ? '[data-deal="' + x.d.id + '"]' : '[data-j="refund-done"]'; },
      done: function (s) { return s.j.seenW >= 3; },
      act: function () { S().j.seenW = 3; BB.save(); } }
  ];

  /* ---------- engine ---------- */
  var busy = false, lastIdx = null, followT = null, spotKey = '';
  function mode() { return S().j.mode === 'whatif' ? 'whatif' : 'main'; }
  function steps() { return mode() === 'whatif' ? WHATIF : MAIN; }
  function currentIdx() {
    var s = S(), list = steps();
    for (var k = 0; k < list.length; k++) if (!list[k].done(s)) return k;
    return list.length;
  }
  function norm(hash) { return (hash || '#/').replace(/\/+$/, '') || '#'; }
  function onRoute(want) { return norm(location.hash) === norm(want); }
  function doStep(st) { if (st.gap) BB.moveClock(st.gap); st.act(); }

  // Rebuild the journey world as it was just before step n (1-based) of the given mode.
  function goto(md, n) {
    busy = true;
    BB.reset();
    var upto = md === 'whatif' ? 13 : Math.max(0, Math.min(n, MAIN.length + 1) - 1);
    for (var k = 0; k < upto; k++) doStep(MAIN[k]);
    S().j.mode = md;
    if (md === 'whatif') for (k = 0; k < Math.min(n, WHATIF.length + 1) - 1; k++) doStep(WHATIF[k]);
    BB.save();
    busy = false;
    lastIdx = currentIdx();
    show();
  }
  // Go to the screen of the current step (or the results once the journey is over).
  function show() {
    var list = steps(), k = currentIdx();
    var want = k < list.length ? list[k].route() : (S().j.campaignId ? camp() : '#/');
    if (onRoute(want)) BB.render(); else BB.go(want);
  }
  function press(sel, fn) {
    var el = sel && document.querySelector(sel);
    if (!el) { fn(); return; }
    el.classList.add('j-press');
    setTimeout(fn, 420);
  }
  // Next: first show the right screen; if it is already showing, do the step for the viewer.
  function next() {
    var list = steps(), k = currentIdx();
    if (k >= list.length) return false;
    var st = list[k];
    if (!onRoute(st.route())) { BB.go(st.route()); return true; }
    press(st.view ? null : st.target(), function () {
      doStep(st);
      lastIdx = currentIdx();
      show();
    });
    return true;
  }
  function back() {
    var k = currentIdx();
    if (mode() === 'whatif') return k === 0 ? goto('main', 14) : goto('whatif', k);
    if (k > 0) goto('main', k);
  }

  function offTrack() {
    var s = S(), x = deal();
    if (mode() === 'main' && x && x.d.stage === 'refunded') return true;
    if (!x && s.campaigns.some(function (c) { return c.brandId === s.brandId; })) return true;
    return false;
  }
  function money() {
    var x = deal();
    if (!x) return { paidIn: 0, held: 0, creator: 0, revenue: 0, vat: 0, refunded: 0 };
    var d = x.d, paid = d.stage === 'paid';
    return { paidIn: d.total, held: BB.HELD.indexOf(d.stage) >= 0 ? d.total : 0, creator: paid ? d.fee : 0,
             revenue: paid ? d.pf : 0, vat: paid ? d.vat : 0, refunded: d.stage === 'refunded' ? d.total : 0 };
  }
  function endWords() {
    var p = amt();
    if (mode() === 'whatif') return { cap: L('ভুল হলেও কারো টাকা হারায় না। টাকা থাকে মাঝখানে, সিদ্ধান্ত হয় প্রুফ দেখে।', 'Even when something goes wrong, nobody loses money. It waits in the middle, and the proof decides.'), why: '' };
    return { cap: L('পুরো জার্নি শেষ। নুসরাত পেলেন ' + m(p.fee) + ', সাদিয়া পেলেন অর্ডার, আর আমাদের আয় ' + m(p.pf) + '।', 'That is the whole journey. Nusrat got ' + m(p.fee) + ', Sadia got orders, and we earned ' + m(p.pf) + '.'),
             why: L('এবার "ভুল হলে কী হয়?" দেখুন, বা নিজের মতো ঘুরে দেখুন।', 'Now try "What if it goes wrong?", or click around on your own.') };
  }
  function status() {
    var s = S(), md = mode(), list = steps(), k = currentIdx(), cur = list[k];
    function node(st, i, which) {
      var o = { n: i + 1, lane: st.lane, phase: st.phase, title: st.t(), mode: which, done: st.done(s), current: which === md && i === k };
      if (which === 'main' && md === 'whatif') { o.done = i < 13; o.skipped = i >= 13; }
      if (which === 'whatif' && md !== 'whatif') o.done = false;
      return o;
    }
    var end = endWords();
    return {
      mode: md, idx: k + 1, total: list.length, complete: k >= list.length, lang: s.lang,
      main: MAIN.map(function (st, i) { return node(st, i, 'main'); }),
      whatif: WHATIF.map(function (st, i) { return node(st, i, 'whatif'); }),
      phases: PHASES.map(function (p) { return p ? BB.txt(p) : null; }),
      lanes: { seller: BB.txt(LANES.seller), team: BB.txt(LANES.team), creator: BB.txt(LANES.creator) },
      lane: cur ? cur.lane : null, laneName: cur ? BB.txt(LANES[cur.lane]) : '',
      caption: cur ? cur.cap() : end.cap, why: cur ? (cur.why ? cur.why() : '') : end.why,
      onStep: cur ? onRoute(cur.route()) : true,
      canWhatIf: md === 'main' && MAIN[12].done(s),
      offTrack: offTrack(), money: money(), role: BB.roleOf(BB.route())
    };
  }

  /* ---------- highlight the button to tap, follow the story, tell the player ---------- */
  function spot() {
    var old = document.querySelectorAll('.j-spot');
    for (var q = 0; q < old.length; q++) old[q].classList.remove('j-spot');
    var list = steps(), k = currentIdx(), st = list[k];
    if (!st || !onRoute(st.route())) return;
    var el = document.querySelector(st.target());
    if (!el) return;
    el.classList.add('j-spot');
    var key = k + location.hash + mode();
    if (key === spotKey) return;
    spotKey = key;
    var r = el.getBoundingClientRect();
    if (r.top < 70 || r.bottom > window.innerHeight - 80) el.scrollIntoView({ block: 'center' });
  }
  function notify() {
    try { if (BB.EMBED && window.parent.BBPLAYER) window.parent.BBPLAYER.update(); } catch (e) { /* player not ready */ }
  }
  BB.hooks.render.push(function () {
    if (busy) return;
    var list = steps(), k = currentIdx();
    // The viewer did the step themselves: after a moment, follow the story to the next screen.
    if (lastIdx != null && k > lastIdx && k < list.length && !onRoute(list[k].route())) {
      clearTimeout(followT);
      var from = location.hash, want = list[k].route();
      followT = setTimeout(function () { if (location.hash === from) BB.go(want); }, 1300);
    }
    lastIdx = k;
    spot();
    notify();
  });

  window.BBAPP = {
    status: status, next: next, back: back, show: show,
    goto: function (md, n) { goto(md === 'whatif' ? 'whatif' : 'main', Math.max(1, n | 0)); },
    restart: function () { goto('main', 1); },
    whatIf: function () { goto('whatif', 1); },
    setLang: function (l) { BB.setLang(l); },
    role: function (rl) { BB.go(BB.ROLE_HOME[rl] || '#/'); }
  };
})();
