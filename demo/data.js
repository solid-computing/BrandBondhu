/* Brandবন্ধু demo: fictional preset data. No real people, brands or numbers. */
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

  var formats = {
    reel:   { bn: 'রিল',         en: 'Reel' },
    story:  { bn: 'স্টোরি',       en: 'Story' },
    review: { bn: 'ভিডিও রিভিউ', en: 'Video review' },
    post:   { bn: 'পোস্ট',        en: 'Post' }
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
    I('nusrat',  'Nusrat Jahan',     'নুসরাত জাহান',        '@nusrat.styles',       'instagram', 'dhaka',      'fashion',   48000, 3.8, 4.8,  8000, ['f', '18–24', 52]),
    I('rafi',    'Rafi Ahmed',       'রাফি আহমেদ',          '@rafi.eats.ctg',       'facebook',  'chattogram', 'food',     126000, 1.2, 4.9, 15000, ['local', null, 71]),
    I('tasnim',  'Tasnim Akter',     'তাসনিম আক্তার',       '@tasnimglow',          'tiktok',    'sylhet',     'beauty',   210000, 6.8, 4.7, 25000, ['f', '18–24', 46]),
    I('arif',    'Arif Hossain',     'আরিফ হোসেন',          '@arif.techbd',         'youtube',   'rajshahi',   'tech',      85000, 3.9, 4.8, 20000, ['m', '18–34', 76]),
    I('mim',     'Mim Chowdhury',    'মিম চৌধুরী',          '@mim.daily',           'instagram', 'dhaka',      'fashion',   31000, 4.1, 4.6,  8000, ['f', '18–24', 55]),
    I('sabbir',  'Sabbir Rahman',    'সাব্বির রহমান',       '@sabbir.reviews',      'facebook',  'dhaka',      'tech',      64000, 1.4, 4.5, 12000, ['m', '18–34', 69]),
    I('farzana', 'Farzana Yasmin',   'ফারজানা ইয়াসমিন',     '@farzana.kitchen',     'youtube',   'khulna',     'food',      41000, 3.2, 4.8,  9000, ['f', '25–34', 61]),
    I('tania',   'Tania Sultana',    'তানিয়া সুলতানা',      '@tania.glam',          'tiktok',    'dhaka',      'beauty',    95000, 7.2, 4.6, 14000, ['f', '18–24', 49]),
    I('imran',   'Imran Hasan',      'ইমরান হাসান',         '@imran.travels',       'instagram', 'sylhet',     'travel',    33000, 3.5, 4.7,  8000, ['mix', '18–34', 58]),
    I('nabila',  'Nabila Khan',      'নাবিলা খান',          '@nabila.mom',          'facebook',  'dhaka',      'parenting', 78000, 1.5, 4.9, 13000, ['f', '25–34', 66]),
    I('shakil',  'Shakil Ahmed',     'শাকিল আহমেদ',         '@shakil.plays',        'youtube',   'dhaka',      'gaming',   150000, 4.4, 4.5, 30000, ['m', '15–24', 72]),
    I('rima',    'Rima Begum',       'রিমা বেগম',           '@rima.sari.house',     'facebook',  'rajshahi',   'fashion',   54000, 1.3, 4.7,  9000, ['f', '25–34', 63]),
    I('tahmid',  'Tahmid Islam',     'তাহমিদ ইসলাম',        '@tahmid.bites',        'tiktok',    'chattogram', 'food',     180000, 6.1, 4.6, 22000, ['local', null, 64]),
    I('sumaiya', 'Sumaiya Akter',    'সুমাইয়া আক্তার',      '@sumaiya.studies',     'youtube',   'dhaka',      'education',  72000, 3.6, 4.9, 16000, ['mix', '16–24', 60]),
    I('jannat',  'Jannat Ara',       'জান্নাত আরা',         '@jannat.hijab.style',  'instagram', 'dhaka',      'fashion',   36000, 4.0, 4.8,  8000, ['f', '18–24', 57]),
    I('mahin',   'Mahin Chowdhury',  'মাহিন চৌধুরী',        '@mahin.gadgets',       'facebook',  'chattogram', 'tech',     110000, 1.1, 4.4, 18000, ['m', '18–34', 71]),
    I('priya',   'Priya Das',        'প্রিয়া দাশ',          '@priya.glow.sylhet',   'instagram', 'sylhet',     'beauty',    18000, 4.6, 4.7,  5000, ['f', '18–24', 62]),
    I('rakib',   'Rakib Hasan',      'রাকিব হাসান',         '@rakib.foodie',        'facebook',  'dhaka',      'food',        9000, 2.4, 4.5,  3000, ['local', null, 67]),
    I('lamia',   'Lamia Noor',       'লামিয়া নূর',          '@lamia.noor.makeup',   'tiktok',    'khulna',     'beauty',      7500, 8.9, 4.6,  3000, ['f', '18–24', 59]),
    I('sohel',   'Sohel Rana',       'সোহেল রানা',          '@sohel.rana.vlogs',    'youtube',   'rangpur',    'travel',     29000, 3.8, 4.6,  6000, ['m', '18–34', 64]),
    I('anika',   'Anika Tabassum',   'আনিকা তাবাসসুম',      '@anika.tabassum',      'instagram', 'barishal',   'fashion',    38000, 4.2, 4.7,  8000, ['f', '18–24', 54]),
    I('fahim',   'Fahim Reza',       'ফাহিম রেজা',          '@fahim.reza.tech',     'tiktok',    'rajshahi',   'tech',       52000, 6.5, 4.4,  9000, ['m', '18–24', 68]),
    I('nazia',   'Nazia Haque',      'নাজিয়া হক',          '@nazia.mom.diaries',   'facebook',  'mymensingh', 'parenting',  31000, 1.6, 4.8,  6000, ['f', '25–34', 70]),
    I('zubayer', 'Zubayer Alam',     'জুবায়ের আলম',        '@zubayer.travel.bd',   'facebook',  'khulna',     'travel',    140000, 1.0, 4.5, 20000, ['mix', '18–34', 56]),
    I('sadia',   'Sadia Islam',      'সাদিয়া ইসলাম',        '@sadia.kids.corner',   'tiktok',    'dhaka',      'parenting',  66000, 6.4, 4.7, 11000, ['f', '25–34', 63])
  ];

  var brands = [
    {
      id: 'dhaka-threads', slug: 'dhakathreads', nameEn: 'Dhaka Threads', nameBn: 'ঢাকা থ্রেডস',
      cat: 'fashion', city: 'dhaka',
      owner: { bn: 'সাদিয়া করিম', en: 'Sadia Karim' },
      product: { bn: 'ঈদের পাঞ্জাবি আর কুর্তি', en: 'Eid punjabi and kurti' }
    },
    {
      id: 'chattala-bites', slug: 'chattalabites', nameEn: 'Chattala Bites', nameBn: 'চট্টলা বাইটস',
      cat: 'food', city: 'chattogram',
      owner: { bn: 'ইফতেখার হোসেন', en: 'Iftekhar Hossain' },
      product: { bn: 'নতুন মেনু: মেজবান বিরিয়ানি বক্স', en: 'New menu: mezban biryani box' }
    },
    {
      id: 'sylhet-glow', slug: 'sylhetglow', nameEn: 'Sylhet Glow', nameBn: 'সিলেট গ্লো',
      cat: 'beauty', city: 'sylhet',
      owner: { bn: 'তামান্না বেগম', en: 'Tamanna Begum' },
      product: { bn: 'নতুন ফেসওয়াশ আর সানস্ক্রিন', en: 'New face wash and sunscreen' }
    }
  ];

  window.BB_DATA = {
    categories: categories, cities: cities, platforms: platforms, formats: formats,
    influencers: influencers, brands: brands
  };
})();
