const products = [
  {
    id: 'bambu-lab-a1',
    title: 'Bambu Lab A1 Combo with AMS Lite 3D Printer',
    category: '3D Printing',
    image: 'assets/images/bambulaba1/1.jpg',
    price: 'AED 2,985.00',
    original: 'AED 3,140.00',
    discount: '-5%',
    url: 'https://amzn.to/4pX45F7',
    asin: 'B0D382K3XF',
    gallery: [
      'assets/images/bambulaba1/1.jpg',
      'assets/images/bambulaba1/2.jpg'
    ]
  },
  {
    id: 'switch2',
    title: 'Nintendo Switch 2 Gaming Console [UAE Version] - 1 Year Manufacturer Warranty',
    category: 'Gaming',
    image: 'assets/images/nintendo/switch2/1.jpg',
    price: 'AED 1,730.00',
    original: 'AED 2,349.00',
    discount: '-26%',
    url: 'https://amzn.to/3GhMF4p',
    asin: 'B0F3GWXLTS',
    review: 'https://www.youtube.com/watch?v=K3CR6RiWS2U&t=33s',
    gallery: [
      'assets/images/nintendo/switch2/1.jpg',
      'assets/images/nintendo/switch2/2.jpg',
      'assets/images/nintendo/switch2/3.jpg',
      'assets/images/nintendo/switch2/4.jpg',
      'assets/images/nintendo/switch2/5.jpg',
      'assets/images/nintendo/switch2/6.jpg',
      'assets/images/nintendo/switch2/7.jpg',
      'assets/images/nintendo/switch2/8.jpg',
      'assets/images/nintendo/switch2/9.jpg',
      'assets/images/nintendo/switch2/10.jpg',
      'assets/images/nintendo/switch2/11.jpg'
    ]
  },
  {
    id: 'procontroller',
    title: 'Nintendo Switch 2 Pro Controller',
    category: 'Gaming',
    image: 'assets/images/nintendo/procontroller2/1.jpg',
    price: 'AED 296.00',
    original: 'AED 330.00',
    discount: '-10%',
    url: 'https://amzn.to/4eud8s0',
    asin: 'B0F3JR79YY',
    review: 'https://www.youtube.com/shorts/MLg8YJbazoM',
    gallery: [
      'assets/images/nintendo/procontroller2/1.jpg',
      'assets/images/nintendo/procontroller2/2.jpg',
      'assets/images/nintendo/procontroller2/3.jpg',
      'assets/images/nintendo/procontroller2/4.jpg',
      'assets/images/nintendo/procontroller2/5.jpg',
      'assets/images/nintendo/procontroller2/6.jpg',
      'assets/images/nintendo/procontroller2/7.jpg'
    ]
  },
  {
    id: 'sandisk-switch2-sd',
    title: 'SanDisk microSD Express 256GB for Nintendo Switch 2',
    category: 'Gaming',
    image: 'assets/images/nintendo/sd/sd1.jpg',
    price: 'AED 223.03',
    url: 'https://amzn.to/3Tmgofm',
    asin: 'B0F3P3X5P2',
    gallery: [
      'assets/images/nintendo/sd/sd1.jpg',
      'assets/images/nintendo/sd/sd2.jpg'
    ],
    description: 'Official memory card for Nintendo Switch 2, next-generation speed, ideal for games and extra storage. Capacity: 256GB. Brand: SanDisk.'
  },
  {
    id: 'neo-cable-txm',
    title: 'Neo Products d+ TXM Class B / 2.0m - Audio Cable TRS Male to XLR Male',
    category: 'Audio',
    image: 'assets/images/cable/71EnCXTCfpL._AC_SL1500_.jpg',
    price: 'AED 175.00',
    url: 'https://amzn.to/3LtQqGo',
    asin: 'B007ROO26E', // Extracted from product page or placeholder if unknown
    gallery: [
      'assets/images/cable/71EnCXTCfpL._AC_SL1500_.jpg'
    ]
  },
  {
    id: 'streamdeck-neo',
    title: 'Elgato Stream Deck Neo — 8 Customizable LCD Keys',
    category: 'Tech',
    image: 'assets/images/streamneo/1.jpg',
    query: 'Elgato Stream Deck Neo',
    gallery: [
      'assets/images/streamneo/1.jpg',
      'assets/images/streamneo/2.jpg',
      'assets/images/streamneo/3.jpg',
      'assets/images/streamneo/4.jpg'
    ]
  },
  {
    id: 'philips-hue-starter',
    title: 'Philips Hue Smart Bridge and White/Color Bulbs Starter Kit',
    category: 'Smart Home',
    image: 'assets/images/generated/philips_hue_lifestyle.png',
    price: 'AED 649.00',
    original: 'AED 849.00',
    discount: '-24%',
    url: 'https://www.amazon.ae/dp/B07351P9QD?tag=gadgetsdxb-21',
    asin: 'B07351P9QD',
    gallery: ['assets/images/generated/philips_hue_lifestyle.png']
  },
  // Additional products to ensure 3+ per category
  // Bambu Lab A1 moved to top
  {
    id: 'biqu-panda',
    title: 'BIQU Panda Build Plate CryoGrip™ Pro Glacier 257x257mm for Bambu Lab',
    category: '3D Printing',
    image: 'assets/images/biqu/61P3DzQvkgL._AC_SL1500_.jpg',
    price: 'AED 167.00',
    url: 'https://amzn.to/4aErWEH',
    gallery: [
      'assets/images/biqu/61P3DzQvkgL._AC_SL1500_.jpg',
      'assets/images/biqu/61sTSxt0-IL._AC_SL1500_.jpg'
    ]
  }
];
window.products = products;