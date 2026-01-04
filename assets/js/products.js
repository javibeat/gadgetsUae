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
    id: 'kindlecolor',
    title: 'Amazon Kindle Colorsoft (16 GB)',
    category: 'Kindle & E-Readers',
    image: 'assets/images/kindlecolor/1.jpg',
    price: 'AED 759.00',
    original: 'AED 959.00',
    discount: '-21%',
    url: 'https://amzn.to/4rvuvir',
    asin: 'B0CX8MT2M2',
    gallery: [
      'assets/images/kindlecolor/1.jpg',
      'assets/images/kindlecolor/2.jpg',
      'assets/images/kindlecolor/3.jpg',
      'assets/images/kindlecolor/4.jpg',
      'assets/images/kindlecolor/5.jpg',
      'assets/images/kindlecolor/6.jpg',
      'assets/images/kindlecolor/7.jpg'
    ]
  },
  {
    id: 'xiaomivacuumx20',
    title: 'Xiaomi Robot Vacuum X20 Pro with All-in-One Station',
    category: 'Smart Home',
    image: 'assets/images/xiaomivacuumx20/1.jpg',
    price: 'AED 1,390.90',
    original: 'AED 1,699.00',
    discount: '-18%',
    url: 'https://amzn.to/48BJqQt',
    asin: 'B0DK6PT2B2',
    gallery: [
      'assets/images/xiaomivacuumx20/1.jpg',
      'assets/images/xiaomivacuumx20/2.jpg',
      'assets/images/xiaomivacuumx20/3.jpg',
      'assets/images/xiaomivacuumx20/4.jpg',
      'assets/images/xiaomivacuumx20/5.jpg',
      'assets/images/xiaomivacuumx20/6.jpg',
      'assets/images/xiaomivacuumx20/7.jpg',
      'assets/images/xiaomivacuumx20/8.jpg',
      'assets/images/xiaomivacuumx20/9.jpg',
      'assets/images/xiaomivacuumx20/10.jpg',
      'assets/images/xiaomivacuumx20/11.jpg',
      'assets/images/xiaomivacuumx20/12.jpg',
      'assets/images/xiaomivacuumx20/13.jpg'
    ]
  },
  {
    id: 'nespresso',
    title: 'Nespresso Inissia coffee machine (UAE Version)',
    category: 'Smart Home',
    image: 'assets/images/nespresso/1.jpg',
    price: 'AED 377.00',
    original: 'AED 749.00',
    discount: '-50%',
    url: 'https://amzn.to/4oNisdJ',
    asin: 'B019AW2OY8',
    gallery: [
      'assets/images/nespresso/1.jpg',
      'assets/images/nespresso/2.jpg',
      'assets/images/nespresso/3.jpg',
      'assets/images/nespresso/4.jpg',
      'assets/images/nespresso/5.jpg',
      'assets/images/nespresso/6.jpg',
      'assets/images/nespresso/7.jpg',
      'assets/images/nespresso/8.jpg',
      'assets/images/nespresso/9.jpg'
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
    id: 's24-ultra',
    title: 'Samsung Galaxy S24 Ultra, 256GB, Titanium Gray',
    category: 'Mobiles',
    image: 'assets/images/generated/samsung_s24_ultra_lifestyle.png',
    price: 'AED 3,499.00',
    original: 'AED 5,099.00',
    discount: '-31%',
    url: 'https://www.amazon.ae/dp/B0CS8X4GJS?tag=gadgetsdxb-21',
    asin: 'B0CS8X4GJS',
    gallery: ['assets/images/generated/samsung_s24_ultra_lifestyle.png', 'https://m.media-amazon.com/images/I/71WjsZ8nBDL._AC_SL1500_.jpg']
  },
  {
    id: 'iphone-16-pro',
    title: 'Apple iPhone 16 Pro Max, 256GB, Desert Titanium',
    category: 'Mobiles',
    image: 'assets/images/generated/iphone_16_pro_lifestyle.png',
    price: 'AED 5,099.00',
    original: 'AED 5,099.00',
    url: 'https://www.amazon.ae/dp/B0DHX997C8?tag=gadgetsdxb-21',
    asin: 'B0DHX997C8',
    gallery: ['assets/images/generated/iphone_16_pro_lifestyle.png', 'https://m.media-amazon.com/images/I/61fI2lGq-5L._AC_SL1500_.jpg']
  },
  {
    id: 'sony-wh1000xm5',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    category: 'Audio',
    image: 'assets/images/generated/sony_headphones_lifestyle.png',
    price: 'AED 1,049.00',
    original: 'AED 1,499.00',
    discount: '-30%',
    url: 'https://www.amazon.ae/dp/B09XVHJG6X?tag=gadgetsdxb-21',
    asin: 'B09XVHJG6X',
    gallery: ['assets/images/generated/sony_headphones_lifestyle.png', 'https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1200_.jpg']
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
    id: 'airpods-pro-2',
    title: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
    category: 'Audio',
    image: 'assets/images/generated/airpods_pro_lifestyle.png',
    price: 'AED 789.00',
    original: 'AED 949.00',
    discount: '-17%',
    url: 'https://www.amazon.ae/dp/B0CHXB8MT8?tag=gadgetsdxb-21',
    asin: 'B0CHXB8MT8',
    gallery: ['assets/images/generated/airpods_pro_lifestyle.png', 'https://m.media-amazon.com/images/I/61SUj2W5yXL._AC_SL1500_.jpg']
  },
  {
    id: 'macbook-air-m3',
    title: 'Apple 2024 MacBook Air 13-inch Laptop with M3 chip',
    category: 'Tech',
    image: 'assets/images/generated/macbook_air_lifestyle.png',
    price: 'AED 4,099.00',
    original: 'AED 4,599.00',
    discount: '-11%',
    url: 'https://www.amazon.ae/dp/B0CX25XGNP?tag=gadgetsdxb-21',
    asin: 'B0CX25XGNP',
    gallery: ['assets/images/generated/macbook_air_lifestyle.png', 'https://m.media-amazon.com/images/I/71ItMQuojUL._AC_SL1500_.jpg']
  },
  {
    id: 'rog-zephyrus-g14',
    title: 'ASUS ROG Zephyrus G14 (2024) Gaming Laptop',
    category: 'Tech',
    image: 'assets/images/generated/rog_zephyrus_lifestyle.png',
    price: 'AED 6,999.00',
    url: 'https://www.amazon.ae/dp/B0D1G5Y8Z6?tag=gadgetsdxb-21',
    asin: 'B0D1G5Y8Z6',
    gallery: ['assets/images/generated/rog_zephyrus_lifestyle.png', 'https://m.media-amazon.com/images/I/71f-0eM6t+L._AC_SL1500_.jpg']
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
    gallery: ['assets/images/generated/philips_hue_lifestyle.png', 'https://m.media-amazon.com/images/I/61L9pY-z2+L._AC_SL1500_.jpg']
  },
  {
    id: 'ring-video-doorbell',
    title: 'Ring Video Doorbell (2nd Gen) - 1080p HD Video',
    category: 'Smart Home',
    image: 'assets/images/generated/ring_doorbell_lifestyle.png',
    price: 'AED 249.00',
    original: 'AED 399.00',
    discount: '-38%',
    url: 'https://www.amazon.ae/dp/B08N5S5S8G?tag=gadgetsdxb-21',
    asin: 'B08N5S5S8G',
    gallery: ['assets/images/generated/ring_doorbell_lifestyle.png', 'https://m.media-amazon.com/images/I/51A31q12RML._AC_SL1000_.jpg']
  },
  {
    id: 'kindle-paperwhite',
    title: 'Kindle Paperwhite (16 GB) – 6.8" display, waterproof, USB-C',
    category: 'Kindle & E-Readers',
    image: 'assets/images/generated/kindle_paperwhite_lifestyle.png',
    price: 'AED 549.00',
    original: 'AED 749.00',
    discount: '-27%',
    url: 'https://www.amazon.ae/dp/B09TMR67G8?tag=gadgetsdxb-21',
    asin: 'B09TMR67G8',
    gallery: ['assets/images/generated/kindle_paperwhite_lifestyle.png', 'https://m.media-amazon.com/images/I/51f9Vq4Wk4L._AC_SL1000_.jpg']
  },
  // Additional products to ensure 3+ per category
  {
    id: 'iphone-15',
    title: 'Apple iPhone 15, 128GB, Black',
    category: 'Mobiles',
    image: 'assets/images/iphone/1.jpg',
    price: 'AED 2,949.00',
    original: 'AED 3,399.00',
    discount: '-13%',
    url: 'https://www.amazon.ae/dp/B0CHX1W1XY?tag=gadgetsdxb-21',
    asin: 'B0CHX1W1XY',
    gallery: ['assets/images/iphone/1.jpg']
  },
  {
    id: 'samsung-buds-pro',
    title: 'Samsung Galaxy Buds2 Pro, Graphite',
    category: 'Audio',
    image: 'https://m.media-amazon.com/images/I/61Qqg+T8nsL._AC_SL1500_.jpg',
    price: 'AED 449.00',
    original: 'AED 699.00',
    discount: '-36%',
    url: 'https://www.amazon.ae/dp/B0B8F7XVNJ?tag=gadgetsdxb-21',
    asin: 'B0B8F7XVNJ',
    gallery: ['https://m.media-amazon.com/images/I/61Qqg+T8nsL._AC_SL1500_.jpg']
  },
  {
    id: 'ipad-10th-gen',
    title: 'Apple iPad 10th Gen, 64GB, Wi-Fi, Blue',
    category: 'Tech',
    image: 'https://m.media-amazon.com/images/I/61nKf1zdbDL._AC_SL1500_.jpg',
    price: 'AED 1,549.00',
    original: 'AED 1,899.00',
    discount: '-18%',
    url: 'https://www.amazon.ae/dp/B0BJLXMVMV?tag=gadgetsdxb-21',
    asin: 'B0BJLXMVMV',
    gallery: ['https://m.media-amazon.com/images/I/61nKf1zdbDL._AC_SL1500_.jpg']
  },
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