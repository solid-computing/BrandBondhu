/* Brandবন্ধু demo: how a seller finds us. Sadia sees our post in a sellers' group, asks for a free
   shortlist, and gets it from our team in a chat. Also the generic chat and feed pieces that the
   creator invite reuses. No real app logos or colours on purpose. */
(function () {
  'use strict';

  var BB = window.BB, h = BB.h, icon = BB.icon, L = BB.L, D = BB.D;
  var S = BB.S;

  /* ---------- shared: a neutral top bar and a chat thread ---------- */
  // Top bar for screens that are not our app (a social feed, a chat).
  BB.outsideBar = function (title, sub, backHref) {
    return h('header', { class: 'topbar outside' }, h('div', { class: 'topbar-in' },
      h('div', { class: 'row', style: 'flex-wrap:nowrap;gap:10px;min-width:0' },
        backHref ? h('a', { href: backHref, class: 'btn btn-ghost btn-sm', 'aria-label': L('ফিরে যান', 'Back') }, icon('back', 16)) : null,
        h('div', { style: 'min-width:0' }, h('strong', { class: 'ob-title' }, title), sub ? h('div', { class: 'tiny muted' }, sub) : null)),
      BB.EMBED ? null : h('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: BB.toggleLang }, S().lang === 'bn' ? 'English' : 'বাংলা')));
  };
  BB.teamAvatar = function () {
    return h('div', { class: 'avatar avatar-sm bb-av', 'aria-hidden': 'true', html: '<svg width="22" height="22" viewBox="0 0 40 40"><circle cx="15" cy="20" r="12" fill="#C2185B"/><circle cx="25" cy="20" r="12" fill="#F5B700" fill-opacity="0.92"/></svg>' });
  };
  // msgs: [{ out: bool, body: string | node | [nodes], at: timestamp }]
  BB.chat = function (msgs) {
    return h('ol', { class: 'chat', 'aria-label': L('মেসেজ', 'Messages') }, msgs.map(function (m) {
      return h('li', { class: 'msg ' + (m.out ? 'out' : 'in') + (m.wide ? ' wide' : '') },
        m.out || m.wide ? null : BB.teamAvatar(),
        h('div', { class: 'bubble' }, m.body, m.at ? h('span', { class: 'when' }, BB.ago(m.at)) : null));
    }));
  };
  function lines(arr) { return arr.map(function (t) { return h('p', null, t); }); }

  /* ---------- state changes (used by the screens and by journey.js) ---------- */
  BB.sellerRequest = function () {
    var s = S(), b = BB.brand();
    if (s.seller.stage !== 'stranger') return;
    s.requests.unshift({ id: 'r-' + b.id + '-' + BB.now().toString(36), brandId: b.id, budget: 'b20', phone: '018•• •••482', at: BB.now(), status: 'new', picks: [] });
    s.seller.stage = 'requested';
    s.seller.askedAt = BB.now();
    BB.save();
  };
  BB.myRequest = function () {
    var b = BB.brand();
    return S().requests.filter(function (q) { return q.brandId === b.id && q.status !== 'converted'; })[0] ||
           S().requests.filter(function (q) { return q.brandId === b.id; })[0];
  };
  // Sadia books the influencers she ticked: they become her shortlist, with a ready brief.
  BB.sellerPick = function (ids) {
    var s = S(), b = BB.brand();
    if (!ids.length || (s.seller.stage !== 'verified' && s.seller.stage !== 'customer')) return false;
    s.shortlist = ids.slice(0, 5);
    s.brief = Object.assign(BB.NEW_BRIEF(), {
      title: L('ঈদ কালেকশন', 'Eid collection'), product: BB.txt(b.product), format: 'mention', minSec: 30, offer: 10, days: 5,
      notes: L('ঈদের আগে ডেলিভারি, ক্যাশ অন ডেলিভারি আছে, কোডটা মুখে বলবেন', 'Delivery before Eid, cash on delivery available, say the code out loud')
    });
    s.seller.stage = 'customer';
    s.seller.picked = ids.slice(0, 5);
    s.seller.pickedAt = BB.now();
    BB.save();
    return true;
  };

  /* ---------- S1: our post in a sellers' group, and the free-shortlist form ---------- */
  function viewPost() {
    var s = S(), b = BB.brand(), asked = s.seller.stage !== 'stranger';
    picked = null;
    var post = h('article', { class: 'card post' },
      h('div', { class: 'row', style: 'flex-wrap:nowrap' }, BB.teamAvatar(),
        h('div', null, h('strong', null, 'Brandবন্ধু'), h('div', { class: 'tiny muted' }, L('2 ঘণ্টা আগে · গ্রুপে পোস্ট', '2h ago · posted in the group')))),
      h('div', { class: 'post-text' }, lines([
        L('ঈদের আগে বিক্রি বাড়াতে চান?', 'Want more sales before Eid?'),
        L('আপনার পেজের জন্য 5 জন ভেরিফায়েড ইনফ্লুয়েন্সার বেছে দেবো, 24 ঘণ্টায়, একদম ফ্রি।', 'We will pick 5 verified influencers for your page in 24 hours, free.'),
        L('পোস্ট লাইভ হলে তবেই ইনফ্লুয়েন্সার টাকা পান। পোস্ট না হলে পুরো টাকা ফেরত।', 'Influencers are paid only after the post is live. No post, full refund.')
      ])),
      h('div', { class: 'post-vis', 'aria-hidden': 'true' },
        h('span', { class: 'pv-big' }, L('24 ঘণ্টায় 5 জন', '5 in 24 hours')),
        h('span', null, L('ইনফ্লুয়েন্সার শর্টলিস্ট, ফ্রি', 'Influencer shortlist, free'))),
      h('p', { class: 'tiny muted' }, L('গ্রুপে আমাদের ফ্রি পোস্ট, পেইড অ্যাড না। ডেমো: পোস্ট আর গ্রুপ কাল্পনিক।', 'Our free post in the group, not a paid ad. Demo: the post and group are fictional.')));

    var form = asked
      ? h('div', { class: 'card' }, h('span', { class: 'chip chip-green', style: 'align-self:flex-start' }, BB.icon('check', 14), L('পাঠানো হয়েছে', 'Sent')),
          h('p', null, L('ধন্যবাদ! 24 ঘণ্টার মধ্যে আমাদের টিম চ্যাটে আপনার শর্টলিস্ট পাঠাবে।', 'Thanks! Our team will send your shortlist in chat within 24 hours.')),
          h('a', { class: 'btn', href: '#/s/chat', style: 'align-self:flex-start' }, L('চ্যাট খুলুন', 'Open the chat'), icon('arrow', 18)))
      : h('form', { class: 'card', onsubmit: function (e) { e.preventDefault(); BB.sellerRequest(); BB.toast(L('পাঠানো হয়েছে। চ্যাটে উত্তর আসবে।', 'Sent. The reply will come in chat.')); BB.render(); } },
          h('span', { class: 'chip chip-pink', style: 'align-self:flex-start' }, L('আমাদের ওয়েবসাইট', 'Our website')),
          h('h2', null, L('ফ্রি শর্টলিস্ট নিন', 'Get your free shortlist')),
          h('p', { class: 'small muted' }, L('পোস্টের লিংকে ক্লিক করলে আমাদের ওয়েবসাইটে এই ছোট ফর্মটা খোলে। কোনো টাকা লাগে না।', 'The link in the post opens this short form on our website. No payment needed.')),
          BB.field('sp-page', L('আপনার পেজ বা পণ্যের লিংক', 'Your page or product link'), h('input', { id: 'sp-page', type: 'text', value: b.fb, readonly: true })),
          h('div', { class: 'grid two' },
            BB.field('sp-cat', L('কী বিক্রি করেন', 'What you sell'), h('input', { id: 'sp-cat', type: 'text', value: BB.lbl(D.categories, b.cat), readonly: true })),
            BB.field('sp-budget', L('বাজেট', 'Budget'), h('input', { id: 'sp-budget', type: 'text', value: BB.lbl(D.budgets, 'b20'), readonly: true }))),
          BB.field('sp-phone', L('ফোন নম্বর (চ্যাটের জন্য)', 'Phone number (for chat)'), h('input', { id: 'sp-phone', type: 'text', value: '018•• •••482', readonly: true }), L('ডেমো: নম্বর লুকানো আছে', 'Demo: number hidden')),
          h('button', { class: 'btn btn-block', type: 'submit', 'data-j': 'ask-shortlist' }, L('আমার শর্টলিস্ট পাঠান', 'Send me my shortlist'), icon('arrow', 18)));

    return [h('div', { style: 'display:contents' },
      h('div', { class: 'feed-group' }, h('div', { class: 'fg-cover', 'aria-hidden': 'true' }),
        h('div', null, h('strong', null, L('অনলাইন সেলারদের আড্ডা', 'Online sellers\' hangout')), h('div', { class: 'tiny muted' }, L('প্রাইভেট গ্রুপ · 48 হাজার মেম্বার · কাল্পনিক', 'Private group · 48K members · fictional')))),
      post, form),
      L('গ্রুপ পোস্ট', 'Group post'),
      BB.outsideBar(L('ফেসবুক (আমাদের অ্যাপ না)', 'Facebook (not our app)'), L('সাদিয়া ফেসবুকে স্ক্রল করছেন · ডেমো', 'Sadia scrolling Facebook · demo'))];
  }

  /* ---------- seller sign-up and checks (used by the screens and by journey.js) ---------- */
  // Stages: stranger -> requested -> shortlisted -> review (signed up, page connected) -> verified -> customer.
  var STAGES = ['stranger', 'requested', 'shortlisted', 'review', 'verified', 'customer'];
  BB.sellerAt = function (stage) { return STAGES.indexOf(S().seller.stage) >= STAGES.indexOf(stage); };
  BB.sellerOpen = function () { var s = S(); if (s.seller.stage === 'shortlisted' && !s.seller.opened) { s.seller.opened = true; BB.save(); } };
  BB.sellerConnectPage = function () { var s = S(); if (!s.seller.page) { s.seller.page = true; BB.save(); } };
  BB.sellerSignup = function () {
    var s = S();
    if (s.seller.stage !== 'shortlisted' || !s.seller.page) return false;
    s.seller.opened = true; s.seller.stage = 'review'; s.seller.signedAt = BB.now(); BB.save(); return true;
  };

  /* ---------- S2: the shortlist arrives in chat, without names ---------- */
  var picked = null;   // ticked influencers on the unlocked shortlist (screen state only)
  var LETTERS = 'ABCDE';
  function anonRows(q) {
    return h('ul', { class: 'pick-list' }, q.picks.map(BB.byId).map(function (i, k) {
      return h('li', null, h('div', { class: 'pick' },
        h('div', { class: 'avatar avatar-sm anon', 'aria-hidden': 'true' }, '?'),
        h('span', { class: 'pick-main' }, h('strong', null, L('ইনফ্লুয়েন্সার ', 'Influencer ') + LETTERS.charAt(k)), k === 0 ? h('span', { class: 'best' }, L('সবচেয়ে মানানসই', 'Best match')) : null,
          h('span', { class: 'tiny muted' }, BB.D.platforms[i.platform] + ' · ' + BB.lbl(D.cities, i.city) + ' · ' + BB.compact(i.followers) + ' · ' + BB.pct(i.eng))),
        h('strong', { class: 'pick-fee' }, BB.money(i.fee))));
    }));
  }
  function viewChat() {
    var s = S(), b = BB.brand(), q = BB.myRequest(), stage = s.seller.stage;
    var asked = (q && q.at) || s.seller.askedAt || BB.now();
    var msgs = [
      { out: true, at: asked, body: lines([b.fb, BB.lbl(D.categories, b.cat) + ' · ' + BB.lbl(D.budgets, (q && q.budget) || 'b20')]) },
      { out: false, at: asked, body: lines([L('ধন্যবাদ সাদিয়া আপা! 24 ঘণ্টার মধ্যে আপনার শর্টলিস্ট পাঠাচ্ছি।', 'Thanks, Sadia! We will send your shortlist within 24 hours.')]) }
    ];
    if (q && q.picks.length && stage !== 'requested') {
      msgs.push({ out: false, wide: true, at: q.sentAt, body: [
        h('p', null, L('আপনার ঈদ কালেকশনের জন্য 5 জন ভেরিফায়েড ফ্যাশন ইনফ্লুয়েন্সার বেছেছি। ফি, ফলোয়ার আর এনগেজমেন্ট দেখুন।', 'Here are 5 verified fashion influencers for your Eid collection, with their fee, followers and engagement.')),
        anonRows(q),
        h('p', { class: 'small' }, L('নাম দেখতে ফ্রি সাইন আপ করে আপনার পেজটা ভেরিফাই করুন। এতে ইনফ্লুয়েন্সাররা ভুয়া ব্র্যান্ড থেকে সুরক্ষিত থাকেন।', 'To see who they are, sign up free and verify your page. It keeps our influencers safe from fake brands.')),
        stage === 'shortlisted' ? h('button', { type: 'button', class: 'btn btn-block', 'data-j': 'see-names', onclick: function () { BB.sellerOpen(); BB.go('#/s/join'); } },
          L('নাম দেখুন: ফ্রি সাইন আপ', 'See who they are: sign up free'), icon('arrow', 18)) : null
      ] });
      if (BB.sellerAt('review')) msgs.push({ out: false, at: s.seller.signedAt, body: lines([L('সাইন আপের জন্য ধন্যবাদ! আপনার পেজটা চেক করছি, সাধারণত 1 ঘণ্টার মধ্যে।', 'Thanks for signing up! We are checking your page, usually within an hour.')]) });
      if (BB.sellerAt('verified')) msgs.push({ out: false, at: s.seller.verifiedAt, body: [h('p', null, L('আপনার পেজ ভেরিফাই হয়েছে। অ্যাপে এখন নামগুলো দেখা যাচ্ছে।', 'Your page is verified. The names are now open in the app.')),
        h('a', { class: 'btn btn-sm', href: stage === 'customer' ? '#/' : '#/s/join' }, L('অ্যাপ খুলুন', 'Open the app'), icon('arrow', 16))] });
    } else {
      msgs.push({ out: false, body: h('p', { class: 'muted' }, L('টিম আপনার জন্য ইনফ্লুয়েন্সার বাছাই করছে…', 'Our team is picking influencers for you…')) });
    }
    return [h('div', { class: 'chat-wrap' }, BB.chat(msgs)),
      L('চ্যাট', 'Chat'),
      BB.outsideBar(L('Brandবন্ধু টিম', 'Brandবন্ধু team'), L('হোয়াটসঅ্যাপ চ্যাট (আমাদের অ্যাপ না) · সাধারণত 1 ঘণ্টায় উত্তর', 'WhatsApp chat (not our app) · usually replies within an hour'), stage === 'customer' ? '#/' : null)];
  }

  /* ---------- S3: sign up, connect the page, wait for our check, then see names and pick ---------- */
  function checkRow(ok, text) { return h('li', null, icon(ok ? 'check' : 'clock', 18, ok ? 'verified' : null), h('span', null, text)); }
  function viewJoin() {
    var s = S(), b = BB.brand(), q = BB.myRequest(), stage = s.seller.stage;
    if (stage === 'shortlisted') {
      return [h('div', { style: 'display:contents' },
        BB.pageHead(L('ফ্রি অ্যাকাউন্ট খুলুন', 'Create your free account'), L('আপনার 5 জন ইনফ্লুয়েন্সার রেডি। পেজ ভেরিফাই হলেই নাম দেখা যাবে।', 'Your 5 influencers are ready. The names open once your page is verified.')),
        h('div', { class: 'card' }, h('h3', null, L('1. ফোন নম্বর', '1. Phone number')),
          BB.kv(L('নম্বর', 'Number'), '018•• •••482'),
          h('span', { class: 'chip chip-green', style: 'align-self:flex-start' }, icon('check', 14), L('কোড দিয়ে ভেরিফাই হয়েছে (ডেমো)', 'Verified with a code (demo)'))),
        h('div', { class: 'card' }, h('h3', null, L('2. ফেসবুক পেজ কানেক্ট করুন', '2. Connect your Facebook page')),
          s.seller.page
            ? h('div', { style: 'display:contents' },
                h('span', { class: 'chip chip-green', style: 'align-self:flex-start' }, icon('check', 14), L('কানেক্টেড, আপনি পেজের অ্যাডমিন', 'Connected, you are an admin of the page')),
                BB.kv(L('পেজ', 'Page'), b.fb), BB.kv(L('ফলোয়ার', 'Followers'), BB.compact(b.fans)))
            : h('div', { style: 'display:contents' },
                h('p', { class: 'small' }, L('কানেক্ট করলে বোঝা যায় পেজটা সত্যিই আপনার। অন্যের পেজের লিংক দিয়ে কেউ সাইন আপ করতে পারে না।', 'Connecting shows the page is really yours. Nobody can sign up with someone else\'s page.')),
                h('button', { type: 'button', class: 'btn', 'data-j': 'connect-page', style: 'align-self:flex-start', onclick: function () { BB.sellerConnectPage(); BB.toast(L('পেজ কানেক্ট হয়েছে।', 'Page connected.')); BB.render(); } },
                  icon('facebook', 18), L('ফেসবুক পেজ কানেক্ট করুন (ডেমো)', 'Connect Facebook page (demo)')))),
        h('div', { class: 'card' }, h('h3', null, L('3. কী বিক্রি করেন', '3. What you sell')),
          BB.kv(L('ক্যাটাগরি', 'Category'), BB.lbl(D.categories, b.cat)),
          h('p', { class: 'tiny muted' }, L('বেটিং, নকল ওষুধ বা কসমেটিকস, অ্যাডাল্ট কনটেন্ট আর টাকা দ্বিগুণের স্কিমের সাথে আমরা কাজ করি না।', 'We do not work with betting, fake medicines or cosmetics, adult content or get-rich schemes.'))),
        h('button', { type: 'button', class: 'btn btn-yellow btn-block', 'data-j': 'submit-signup', 'aria-disabled': s.seller.page ? null : 'true', onclick: function () {
          if (!s.seller.page) { BB.toast(L('আগে পেজ কানেক্ট করুন।', 'Connect your page first.')); return; }
          BB.sellerSignup(); BB.toast(L('চেকের জন্য পাঠানো হয়েছে।', 'Sent for checking.')); BB.render();
        } }, L('চেকের জন্য পাঠান', 'Send for checking'), icon('arrow', 18))),
        L('সাইন আপ', 'Sign up')];
    }
    if (stage === 'review') {
      return [h('div', { style: 'display:contents' },
        h('div', { class: 'card empty' }, h('span', { class: 'chip chip-cream' }, icon('clock', 14), L('চেক চলছে', 'Being checked')),
          h('h2', null, L('আমরা আপনার পেজ দেখছি', 'We are checking your page')),
          h('p', { class: 'muted' }, L('সাধারণত 1 ঘণ্টার মধ্যে। ভেরিফাই হলে নাম দেখা যাবে আর বুক করতে পারবেন।', 'Usually within an hour. Once verified, you can see the names and book.'))),
        h('div', { class: 'card' }, h('ul', { class: 'ledger' },
          checkRow(true, L('ফোন ভেরিফাই হয়েছে', 'Phone verified')),
          checkRow(true, L('ফেসবুক পেজ কানেক্টেড', 'Facebook page connected')),
          checkRow(false, L('টিমের চেক: পেজ আসল কি না, পণ্যটা চলবে কি না', 'Team check: is the page real, is the product allowed')))),
        q ? h('div', { class: 'card' }, h('h3', null, L('আপনার শর্টলিস্ট (নাম লুকানো)', 'Your shortlist (names hidden)')), anonRows(q)) : null),
        L('চেক চলছে', 'Being checked')];
    }
    // verified: the names open, and she picks who to book
    if (!picked) picked = q && q.picks.length ? [q.picks[0]] : [];
    var people = q ? q.picks.map(BB.byId) : [];
    return [h('div', { style: 'display:contents' },
      h('div', { class: 'chips' }, h('span', { class: 'chip chip-green' }, icon('shield', 14), L('ভেরিফায়েড ব্র্যান্ড', 'Verified brand'))),
      BB.pageHead(L('আপনার শর্টলিস্ট', 'Your shortlist'), L('নামগুলো এখন খোলা। যাকে চান টিক দিন। ফোন নম্বর কখনো শেয়ার হয় না, কথা আর পেমেন্ট সব Brandবন্ধু-তে।', 'The names are open now. Tick who you want. Phone numbers are never shared; talks and payment stay in Brandবন্ধু.')),
      h('ul', { class: 'pick-list' }, people.map(function (i, k) {
        var on = picked.indexOf(i.id) >= 0;
        return h('li', null, h('label', { class: 'pick' + (on ? ' on' : '') },
          h('input', { type: 'checkbox', checked: on, onchange: function (e) {
            var at = picked.indexOf(i.id);
            if (e.target.checked && at < 0) picked.push(i.id); else if (!e.target.checked && at >= 0) picked.splice(at, 1);
            BB.render();
          } }),
          BB.avatar(i, 'avatar-sm'),
          h('span', { class: 'pick-main' }, h('strong', null, BB.infName(i)), k === 0 ? h('span', { class: 'best' }, L('সবচেয়ে মানানসই', 'Best match')) : null,
            h('span', { class: 'tiny muted' }, i.handle + ' · ' + BB.D.platforms[i.platform] + ' · ' + BB.lbl(D.cities, i.city) + ' · ' + BB.compact(i.followers))),
          h('strong', { class: 'pick-fee' }, BB.money(i.fee))));
      })),
      h('button', { type: 'button', class: 'btn btn-block', 'data-j': 'book-picked', disabled: !picked.length, onclick: function () {
        if (!BB.sellerPick(picked)) return;
        BB.toast(L('ব্রিফ লিখে দাম দেখুন।', 'Now write the brief and see the price.'));
        BB.go('#/brief');
      } }, L('টিক দেওয়াদের বুক করুন (' + picked.length + ' জন)', 'Book the ticked ones (' + picked.length + ')'), icon('arrow', 18))),
      L('শর্টলিস্ট', 'Shortlist')];
  }

  BB.hooks.reset.push(function () { picked = null; });
  BB.views.s = function (r) {
    var st = S().seller.stage;
    if (st === 'stranger' || r.id === 'post') return viewPost();
    if (r.id === 'join' && BB.sellerAt('shortlisted') && st !== 'customer') return viewJoin();
    return viewChat();
  };
})();
