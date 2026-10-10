/* Brandবন্ধু demo: fictional preset data. Names, pages and numbers are invented; any resemblance to
   real people or businesses is coincidental. */
(function () {
  'use strict';

  var categories = {
    fashion:   { bn: 'ফ্যাশন',        en: 'Fashion' },
    beauty:    { bn: 'বিউটি',         en: 'Beauty' },
    food:      { bn: 'খাবার',         en: 'Food' },
    tech:      { bn: 'টেক ও গ্যাজেট', en: 'Tech & gadgets' },
    education: { bn: 'পড়াশোনা',      en: 'Education' },
    parenting: { bn: 'প্যারেন্টিং',    en: 'Parenting' },
    travel:    { bn: 'ট্রাভেল',        en: 'Travel' },
    gaming:    { bn: 'গেমিং',         en: 'Gaming' }
  };

  var cities = {
    dhaka:      { bn: 'ঢাকা',       en: 'Dhaka' },
    chattogram: { bn: 'চট্টগ্রাম',   en: 'Chattogram' },
    sylhet:     { bn: 'সিলেট',      en: 'Sylhet' },
    rajshahi:   { bn: 'রাজশাহী',    en: 'Rajshahi' },
    khulna:     { bn: 'খুলনা',      en: 'Khulna' },
    rangpur:    { bn: 'রংপুর',      en: 'Rangpur' },
    barishal:   { bn: 'বরিশাল',     en: 'Barishal' },
    mymensingh: { bn: 'ময়মনসিংহ',  en: 'Mymensingh' }
  };

  var platforms = { facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube', instagram: 'Instagram' };

  // How sponsored content really happens. "hold" = hours the post must stay up before the fee is released.
  var formats = {
    mention: { bn: 'নিজের ভিডিওতে উল্লেখ',  en: 'Mention in their regular video', hold: 72 },
    reel:    { bn: 'আলাদা রিল বা পোস্ট',    en: 'Dedicated reel or post',          hold: 72 },
    story:   { bn: 'স্টোরি',               en: 'Story',                            hold: 24 },
    live:    { bn: 'লাইভে শাউটআউট',        en: 'Live shoutout',                    hold: 24 }
  };

  // id, English name, Bangla name, handle, platform, city, category,
  // followers, engagement %, rating, fee (৳), audience [type, age, share %]
  function I(id, nameEn, nameBn, handle, platform, city, category, followers, eng, rating, fee, aud) {
    return {
      id: id, nameEn: nameEn, nameBn: nameBn, handle: handle, platform: platform, city: city,
      category: category, followers: followers, eng: eng, rating: rating, fee: fee,
      aud: { type: aud[0], age: aud[1], pct: aud[2] }
    };
  }

  var influencers = [
    // the four example influencers on the landing page keep their names and numbers
    I('nusrat',  'Nusrat Jahan',        'নুসরাত জাহান',          '@nusrat.styles',        'instagram', 'dhaka',      'fashion',    48000, 3.8, 4.8,  8000, ['f', '18–24', 52]),
    I('rafi',    'Rafi Ahmed',          'রাফি আহমেদ',            '@rafi.eats.ctg',        'facebook',  'chattogram', 'food',      126000, 1.2, 4.9, 15000, ['local', null, 71]),
    I('tasnim',  'Tasnim Akter',        'তাসনিম আক্তার',         '@tasnimglow',           'tiktok',    'sylhet',     'beauty',    210000, 6.8, 4.7, 25000, ['f', '18–24', 46]),
    I('arif',    'Arif Hossain',        'আরিফ হোসেন',            '@arif.techbd',          'youtube',   'rajshahi',   'tech',       85000, 3.9, 4.8, 20000, ['m', '18–34', 76]),
    I('mim',     'Mim Chowdhury',       'মিম চৌধুরী',            '@mim.in.dhaka',         'instagram', 'dhaka',      'fashion',    31000, 4.1, 4.6,  8000, ['f', '18–24', 55]),
    I('sabbir',  'Sabbir Hossain Rony', 'সাব্বির হোসেন রনি',      '@sabbir.tech.review',   'facebook',  'dhaka',      'tech',       64000, 1.4, 4.5, 12000, ['m', '18–34', 69]),
    I('farzana', 'Farzana Yeasmin',     'ফারজানা ইয়াসমিন',       '@farzanas.kitchen',     'youtube',   'khulna',     'food',       41000, 3.2, 4.8,  9000, ['f', '25–34', 61]),
    I('tania',   'Tania Sultana',       'তানিয়া সুলতানা',        '@taniaglam.studio',     'tiktok',    'dhaka',      'beauty',     95000, 7.2, 4.6, 14000, ['f', '18–24', 49]),
    I('imran',   'Imran Hasan Shuvo',   'ইমরান হাসান শুভ',        '@shuvo.wanders',        'instagram', 'sylhet',     'travel',     33000, 3.5, 4.7,  8000, ['mix', '18–34', 58]),
    I('nabila',  'Nabila Khan',         'নাবিলা খান',            '@nabila.mom.life',      'facebook',  'dhaka',      'parenting',  78000, 1.5, 4.9, 13000, ['f', '25–34', 66]),
    I('shakil',  'Shakil Ahmed',        'শাকিল আহমেদ',           '@shakilplaysbd',        'youtube',   'dhaka',      'gaming',    150000, 4.4, 4.5, 30000, ['m', '15–24', 72]),
    I('rima',    'Rima Begum',          'রিমা বেগম',             '@rima.sharee.ghor',     'facebook',  'rajshahi',   'fashion',    54000, 1.3, 4.7,  9000, ['f', '25–34', 63]),
    I('tahmid',  'Tahmid Islam',        'তাহমিদ ইসলাম',          '@tahmid.ctg.eats',      'tiktok',    'chattogram', 'food',      180000, 6.1, 4.6, 22000, ['local', null, 64]),
    I('sumaiya', 'Sumaiya Akter Lima',  'সুমাইয়া আক্তার লিমা',    '@lima.studies',         'youtube',   'dhaka',      'education',  72000, 3.6, 4.9, 16000, ['mix', '16–24', 60]),
    I('jannat',  'Jannat Ara Keya',     'জান্নাত আরা কেয়া',       '@keya.hijab.corner',    'instagram', 'dhaka',      'fashion',    36000, 4.0, 4.8,  8000, ['f', '18–24', 57]),
    I('mahin',   'Mahin Chowdhury',     'মাহিন চৌধুরী',          '@mahin.gadget.bd',      'facebook',  'chattogram', 'tech',      110000, 1.1, 4.4, 18000, ['m', '18–34', 71]),
    I('priya',   'Priya Das',           'প্রিয়া দাশ',            '@priya.skin.sylhet',    'instagram', 'sylhet',     'beauty',     18000, 4.6, 4.7,  5000, ['f', '18–24', 62]),
    I('rakib',   'Rakib Hasan',         'রাকিব হাসান',           '@foodie.rakib',         'facebook',  'dhaka',      'food',         9000, 2.4, 4.5,  3000, ['local', null, 67]),
    I('lamia',   'Lamia Noor',          'লামিয়া নূর',            '@lamia.makeup.khulna',  'tiktok',    'khulna',     'beauty',       7500, 8.9, 4.6,  3000, ['f', '18–24', 59]),
    I('sohel',   'Sohel Rana',          'সোহেল রানা',            '@sohel.rana.travels',   'youtube',   'rangpur',    'travel',      29000, 3.8, 4.6,  6000, ['m', '18–34', 64]),
    I('anika',   'Anika Tabassum',      'আনিকা তাবাসসুম',        '@anika.barishal.style', 'instagram', 'barishal',   'fashion',     38000, 4.2, 4.7,  8000, ['f', '18–24', 54]),
    I('fahim',   'Fahim Reza',          'ফাহিম রেজা',            '@fahim.tech.bd',        'tiktok',    'rajshahi',   'tech',        52000, 6.5, 4.4,  9000, ['m', '18–24', 68]),
    I('nazia',   'Nazia Haque',         'নাজিয়া হক',            '@nazia.maa.o.shishu',   'facebook',  'mymensingh', 'parenting',   31000, 1.6, 4.8,  6000, ['f', '25–34', 70]),
    I('zubayer', 'Zubayer Alam',        'জুবায়ের আলম',          '@zubayer.bd.travel',    'facebook',  'khulna',     'travel',     140000, 1.0, 4.5, 20000, ['mix', '18–34', 56]),
    I('sharmin', 'Sharmin Sultana',     'শারমিন সুলতানা',         '@sharmin.kids.corner',  'tiktok',    'dhaka',      'parenting',   66000, 6.4, 4.7, 11000, ['f', '25–34', 63])
  ];

  var brands = [
    {
      id: 'dhaka-threads', slug: 'dhakathreads', nameEn: 'Dhaka Threads', nameBn: 'ঢাকা থ্রেডস',
      cat: 'fashion', city: 'dhaka', fb: 'facebook.com/dhakathreadsbd', fans: 62000,
      owner: { bn: 'সাদিয়া করিম', en: 'Sadia Karim' },
      product: { bn: 'ঈদের পাঞ্জাবি আর কুর্তি কালেকশন', en: 'Eid punjabi and kurti collection' }
    },
    {
      id: 'chattala-bites', slug: 'mezbankitchen', nameEn: 'Mezban Kitchen CTG', nameBn: 'মেজবান কিচেন চট্টগ্রাম',
      cat: 'food', city: 'chattogram', fb: 'facebook.com/mezbankitchenctg', fans: 38000,
      owner: { bn: 'ইফতেখার হোসেন', en: 'Iftekhar Hossain' },
      product: { bn: 'মেজবান বিরিয়ানি বক্স', en: 'Mezban biryani box' }
    },
    {
      id: 'sylhet-glow', slug: 'surmaskincare', nameEn: 'Surma Skin Care', nameBn: 'সুরমা স্কিন কেয়ার',
      cat: 'beauty', city: 'sylhet', fb: 'facebook.com/surmaskincarebd', fans: 24000,
      owner: { bn: 'তামান্না বেগম', en: 'Tamanna Begum' },
      product: { bn: 'নিম ফেসওয়াশ আর SPF 50 সানস্ক্রিন', en: 'Neem face wash and SPF 50 sunscreen' }
    }
  ];

  // Creators our team is talking to but who are not in the directory yet (team pipeline).
  // stage: found, messaged, replied, joined (waiting for review), verified. ago = hours since last step.
  // flag marks something our team has to look at before approving.
  var prospects = [
    { id: 'ritu',    nameEn: 'Ritu Moni',     nameBn: 'ঋতু মনি',      handle: '@ritu.ranna.ghor',   platform: 'facebook',  category: 'food',      followers: 22000, eng: 2.1, stage: 'found',    ago: 5 },
    { id: 'tanvir',  nameEn: 'Tanvir Hasan',  nameBn: 'তানভীর হাসান',  handle: '@tanvir.unboxes',    platform: 'youtube',   category: 'tech',      followers: 41000, eng: 3.4, stage: 'found',    ago: 9 },
    { id: 'nadia',   nameEn: 'Nadia Islam',   nameBn: 'নাদিয়া ইসলাম',  handle: '@nadia.drapes',      platform: 'instagram', category: 'fashion',   followers: 27000, eng: 4.4, stage: 'messaged', ago: 20 },
    { id: 'rubel',   nameEn: 'Rubel Mia',     nameBn: 'রুবেল মিয়া',    handle: '@rubel.street.eats', platform: 'tiktok',    category: 'food',      followers: 63000, eng: 7.0, stage: 'replied',  ago: 14 },
    { id: 'sumi',    nameEn: 'Sumi Akter',    nameBn: 'সুমি আক্তার',   handle: '@sumi.skin.diary',   platform: 'instagram', category: 'beauty',    followers: 19000, eng: 0.6, stage: 'joined',   ago: 26,
      flag: { bn: '2 দিনে হঠাৎ 6,000 ফলোয়ার বেড়েছে, এনগেজমেন্ট খুব কম', en: 'Gained 6,000 followers in 2 days, and engagement is very low' } }
  ];

  // Budget choices on the free-shortlist form (same as the landing page).
  var budgets = {
    b20:  { bn: '৳20,000-এর কম',          en: 'Under ৳20,000',          max: 20000 },
    b50:  { bn: '৳20,000 – ৳50,000',    en: '৳20,000 to ৳50,000',     max: 50000 },
    b100: { bn: '৳50,000 – ৳100,000',  en: '৳50,000 to ৳100,000',   max: 100000 }
  };

  window.BB_DATA = {
    categories: categories, cities: cities, platforms: platforms, formats: formats,
    influencers: influencers, brands: brands, prospects: prospects, budgets: budgets
  };
})();
