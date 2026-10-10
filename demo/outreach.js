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
    if (!ids.length) return false;
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

  /* ---------- S2: the shortlist arrives in chat ---------- */
  var picked = null;   // ticked influencers in the shortlist message (screen state only)
  function viewChat() {
    var s = S(), b = BB.brand(), q = BB.myRequest(), stage = s.seller.stage;
    if (stage === 'requested') picked = null;
    var asked = (q && q.at) || s.seller.askedAt || BB.now();
    var msgs = [
      { out: true, at: asked, body: lines([b.fb, BB.lbl(D.categories, b.cat) + ' · ' + BB.lbl(D.budgets, (q && q.budget) || 'b20')]) },
      { out: false, at: asked, body: lines([L('ধন্যবাদ সাদিয়া আপা! 24 ঘণ্টার মধ্যে আপনার শর্টলিস্ট পাঠাচ্ছি।', 'Thanks, Sadia! We will send your shortlist within 24 hours.')]) }
    ];
    if (q && q.picks.length && stage !== 'requested') {
      if (!picked) picked = [q.picks[0]];
      var people = q.picks.map(BB.byId);
      var booked = stage === 'customer';
      msgs.push({ out: false, wide: true, at: q.sentAt, body: [
        h('p', null, L('আপনার ঈদ কালেকশনের জন্য 5 জন ভেরিফায়েড ফ্যাশন ইনফ্লুয়েন্সার বেছেছি। ফি আর অডিয়েন্স দেখে যাকে চান টিক দিন।',
                       'Here are 5 verified fashion influencers for your Eid collection. Check their fee and audience, then tick who you want.')),
        h('ul', { class: 'pick-list' }, people.map(function (i, k) {
          var on = picked.indexOf(i.id) >= 0;
          return h('li', null, h('label', { class: 'pick' + (on ? ' on' : '') },
            h('input', { type: 'checkbox', checked: on, disabled: booked, onchange: function (e) {
              var at = picked.indexOf(i.id);
              if (e.target.checked && at < 0) picked.push(i.id); else if (!e.target.checked && at >= 0) picked.splice(at, 1);
              BB.render();
            } }),
            h('span', { class: 'pick-main' }, h('strong', null, BB.infName(i)), k === 0 ? h('span', { class: 'best' }, L('সবচেয়ে মানানসই', 'Best match')) : null,
              h('span', { class: 'tiny muted' }, BB.D.platforms[i.platform] + ' · ' + BB.lbl(D.cities, i.city) + ' · ' + BB.compact(i.followers))),
            h('strong', { class: 'pick-fee' }, BB.money(i.fee))));
        })),
        booked ? null : h('button', { type: 'button', class: 'btn btn-block', 'data-j': 'book-picked', disabled: !picked.length, onclick: function () {
          if (!BB.sellerPick(picked)) return;
          BB.toast(L('ব্রিফ লিখে দাম দেখুন।', 'Now write the brief and see the price.'));
          BB.go('#/brief');
        } }, L('টিক দেওয়াদের বুক করুন (' + picked.length + ' জন)', 'Book the ticked ones (' + picked.length + ')'), icon('arrow', 18))
      ] });
      var names = (s.seller.picked || []).map(function (id) { return BB.infName(BB.byId(id)); }).join(', ');
      if (booked && names) {
        msgs.push({ out: true, at: s.seller.pickedAt, body: lines([L('শুরুতে ' + names + ' দিয়ে করি।', 'Let\'s start with ' + names + '.')]) });
        msgs.push({ out: false, at: s.seller.pickedAt, body: [h('p', null, L('দারুণ! অ্যাপে ব্রিফ আর দাম রেডি আছে।', 'Great! Your brief and price are ready in the app.')),
          h('a', { class: 'btn btn-sm', href: '#/' }, L('অ্যাপ খুলুন', 'Open the app'), icon('arrow', 16))] });
      }
    } else {
      msgs.push({ out: false, body: h('p', { class: 'muted' }, L('টিম আপনার জন্য ইনফ্লুয়েন্সার বাছাই করছে…', 'Our team is picking influencers for you…')) });
    }
    return [h('div', { class: 'chat-wrap' }, BB.chat(msgs)),
      L('চ্যাট', 'Chat'),
      BB.outsideBar(L('Brandবন্ধু টিম', 'Brandবন্ধু team'), L('হোয়াটসঅ্যাপ চ্যাট (আমাদের অ্যাপ না) · সাধারণত 1 ঘণ্টায় উত্তর', 'WhatsApp chat (not our app) · usually replies within an hour'), stage === 'customer' ? '#/' : null)];
  }

  BB.hooks.reset.push(function () { picked = null; });
  BB.views.s = function (r) { return r.id === 'chat' && S().seller.stage !== 'stranger' ? viewChat() : viewPost(); };
})();
