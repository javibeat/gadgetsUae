/**
 * Catalog — single source of truth for the frontend.
 *
 * Merges two inputs into one normalised list:
 *   1. CATALOG_ITEMS  (assets/data/catalog-items.js)  — curated products without photos
 *   2. products       (assets/js/products.js)          — legacy products WITH local photos
 *
 * No prices live here on purpose: Amazon only allows showing prices that come
 * fresh from its API. Until the Creators API is unlocked every card links out
 * with "View on Amazon.ae".
 *
 * Works in the browser (window.Catalog) and in Node (module.exports) so the
 * same code is unit-tested and reused by build scripts.
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) module.exports = factory();
    else root.Catalog = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const TAG = 'gadgetsdxb-21';

    const CATEGORIES = [
        { key: 'Gaming',      slug: 'gaming',      label: 'Gaming',            page: '/gaming.html',      hue: 262, icon: 'gamepad',  tagline: 'Consoles, controllers, handhelds and PC gaming gear.' },
        { key: 'Mobiles',     slug: 'mobiles',     label: 'Phones & Tablets',  page: '/mobiles.html',     hue: 205, icon: 'phone',    tagline: 'Flagships, value phones and tablets with UAE warranty.' },
        { key: 'Audio',       slug: 'audio',       label: 'Audio',             page: '/audio.html',       hue: 335, icon: 'headphones', tagline: 'Headphones, earbuds and speakers for commutes and home.' },
        { key: 'Tech',        slug: 'tech',        label: 'Computers & Tech',  page: '/tech.html',        hue: 225, icon: 'laptop',   tagline: 'Laptops, monitors, e-readers, storage and peripherals.' },
        { key: 'Smart Home',  slug: 'smarthome',   label: 'Smart Home',        page: '/smarthome.html',   hue: 155, icon: 'home',     tagline: 'Robot vacuums, lighting, security and kitchen tech.' },
        { key: 'Wearables',   slug: 'wearables',   label: 'Wearables',         page: '/wearables.html',   hue: 25,  icon: 'watch',    tagline: 'Smartwatches, fitness bands and health trackers.' },
        { key: 'Accessories', slug: 'accessories', label: 'Accessories',       page: '/accessories.html', hue: 45,  icon: 'plug',     tagline: 'Chargers, power banks, hubs, cables and mounts.' },
        { key: '3D Printing', slug: '3d-printing', label: '3D Printing',       page: '/3d-printing.html', hue: 180, icon: 'cube',     tagline: 'Printers, filament and upgrades for makers.' }
    ];

    const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));
    const LEGACY_CATEGORY_MAP = { 'Kindle & E-Readers': 'Tech' };

    /** Metadata for the legacy products that ship with local photos. */
    const LEGACY_META = {
        'bambu-lab-a1':       { brand: 'Bambu Lab', model: 'A1 Combo', sub: '3D Printer', tier: 'mid', tags: ['multicolor', 'beginner', 'fast'], blurb: 'Multi-colour printing out of the box with the AMS Lite — the easiest serious printer to start with.', specs: ['AMS Lite 4-colour', '500 mm/s', 'Auto-level'], heat: 84 },
        'kindlecolor':        { brand: 'Amazon', model: 'Kindle Colorsoft', sub: 'E-Reader', tier: 'premium', tags: ['reading', 'colour', 'waterproof'], blurb: 'The first colour Kindle: comics, covers and highlights in colour, still weeks of battery.', specs: ['7" colour E Ink', 'Waterproof', '16 GB'], heat: 78 },
        'xiaomivacuumx20':    { brand: 'Xiaomi', model: 'Robot Vacuum X20 Pro', sub: 'Robot Vacuum', tier: 'mid', tags: ['cleaning', 'mop', 'self-empty'], blurb: 'Vacuums, mops and empties itself — a strong pick for dusty UAE apartments with hard floors.', specs: ['7,000 Pa', 'Self-wash mop', 'Auto-empty'], heat: 80 },
        'nespresso':          { brand: 'Nespresso', model: 'Inissia', sub: 'Coffee Machine', tier: 'budget', tags: ['coffee', 'compact', 'kitchen'], blurb: 'Compact capsule machine that heats in 25 seconds — the classic office and studio coffee fix.', specs: ['25 s heat-up', '19 bar', 'Compact'], heat: 60 },
        'switch2':            { brand: 'Nintendo', model: 'Switch 2', sub: 'Console', tier: 'premium', tags: ['nintendo', 'handheld', 'family'], blurb: 'Bigger 1080p screen, 4K docked and full backwards compatibility with your Switch library.', specs: ['7.9" 120 Hz', '4K docked', '256 GB'], heat: 96 },
        'procontroller':      { brand: 'Nintendo', model: 'Switch 2 Pro Controller', sub: 'Controller', tier: 'mid', tags: ['nintendo', 'controller'], blurb: 'The controller to buy for long docked sessions: back buttons, headphone jack and 40-hour battery.', specs: ['40 h battery', 'GL/GR buttons', '3.5 mm jack'], heat: 74 },
        'sandisk-switch2-sd': { brand: 'SanDisk', model: 'microSD Express 256GB', sub: 'Storage', tier: 'mid', tags: ['nintendo', 'storage'], blurb: 'The only card type Switch 2 accepts for games — officially licensed and fast enough to load from.', specs: ['microSD Express', '256 GB', 'Licensed'], heat: 70 },
        's24-ultra':          { brand: 'Samsung', model: 'Galaxy S24 Ultra', sub: 'Smartphone', tier: 'premium', tags: ['android', 'camera', 's-pen'], blurb: 'Still the S Pen flagship to beat on value now that newer models have landed.', specs: ['200 MP camera', 'S Pen', 'Titanium'], heat: 72 },
        'iphone-16-pro':      { brand: 'Apple', model: 'iPhone 16 Pro', sub: 'Smartphone', tier: 'premium', tags: ['ios', 'camera', 'apple'], blurb: 'Pro camera system and A18 Pro at a lower price than the 17 series — the smart iPhone buy this year.', specs: ['A18 Pro', '48 MP Fusion', '120 Hz'], heat: 85 },
        'sony-wh1000xm5':     { brand: 'Sony', model: 'WH-1000XM5', sub: 'Headphones', tier: 'premium', tags: ['anc', 'wireless', 'travel'], blurb: 'Excellent noise cancelling and comfort; the previous flagship, now the value pick for flyers.', specs: ['30 h battery', 'ANC', 'Multipoint'], heat: 80 },
        'neo-cable-txm':      { brand: 'Neo by Oyaide', model: 'd+ TXM Cable', sub: 'Audio Cable', tier: 'budget', tags: ['studio', 'cable', 'xlr'], blurb: 'Studio-grade TRS to XLR cable for monitors and interfaces — the reliable link most home studios skip.', specs: ['TRS to XLR', '2.0 m', 'Class B'], heat: 30 },
        'streamdeck-neo':     { brand: 'Elgato', model: 'Stream Deck Neo', sub: 'Stream Controller', tier: 'mid', tags: ['streaming', 'productivity', 'desk'], blurb: 'Eight customisable keys for shortcuts, scenes and apps — handy far beyond streaming.', specs: ['8 LCD keys', 'Info bar', 'USB-C'], heat: 55 },
        'airpods-pro-2':      { brand: 'Apple', model: 'AirPods Pro 2', sub: 'Earbuds', tier: 'premium', tags: ['ios', 'anc', 'earbuds'], blurb: 'Best earbuds for iPhone owners with hearing-aid features and adaptive noise control.', specs: ['USB-C', 'Adaptive ANC', 'Hearing aid'], heat: 88 },
        'macbook-air-m3':     { brand: 'Apple', model: 'MacBook Air M3', sub: 'Laptop', tier: 'premium', tags: ['apple', 'laptop', 'ultrabook'], blurb: 'Fanless, 18-hour battery and dual external displays — the default laptop for most people.', specs: ['M3 chip', '18 h battery', '13.6" Liquid'], heat: 82 },
        'rog-zephyrus-g14':   { brand: 'ASUS', model: 'ROG Zephyrus G14', sub: 'Gaming Laptop', tier: 'premium', tags: ['gaming', 'laptop', 'oled'], blurb: 'A 14-inch OLED gaming laptop that still fits a backpack — power without the brick-sized chassis.', specs: ['14" OLED 120 Hz', 'RTX 40', '1.5 kg'], heat: 70 },
        'philips-hue-starter': { brand: 'Philips Hue', model: 'Starter Kit', sub: 'Smart Lighting', tier: 'mid', tags: ['lighting', 'homekit', 'alexa'], blurb: 'Bridge plus colour bulbs: the most reliable smart-lighting ecosystem, works with every assistant.', specs: ['3 colour bulbs', 'Hue Bridge', 'Matter'], heat: 66 },
        'ring-video-doorbell': { brand: 'Ring', model: 'Video Doorbell', sub: 'Security', tier: 'budget', tags: ['security', 'alexa', 'doorbell'], blurb: 'See and talk to whoever is at the door from your phone — battery powered, no wiring needed.', specs: ['1080p HD', 'Battery', 'Two-way talk'], heat: 68 },
        'kindle-paperwhite':  { brand: 'Amazon', model: 'Kindle Paperwhite', sub: 'E-Reader', tier: 'mid', tags: ['reading', 'waterproof'], blurb: 'The Kindle most people should buy: warm light, waterproof and weeks of battery.', specs: ['6.8" 300 ppi', 'Waterproof', 'Warm light'], heat: 86 },
        'iphone-15':          { brand: 'Apple', model: 'iPhone 15', sub: 'Smartphone', tier: 'mid', tags: ['ios', 'apple', 'value'], blurb: 'Dynamic Island, USB-C and a 48 MP camera at the lowest current iPhone price point.', specs: ['A16 Bionic', '48 MP', 'USB-C'], heat: 76 },
        'samsung-buds-pro':   { brand: 'Samsung', model: 'Galaxy Buds2 Pro', sub: 'Earbuds', tier: 'mid', tags: ['android', 'anc', 'earbuds'], blurb: 'Compact ANC earbuds that pair seamlessly with Galaxy phones and watches.', specs: ['24-bit audio', 'ANC', 'IPX7'], heat: 62 },
        'ipad-10th-gen':      { brand: 'Apple', model: 'iPad (10th gen)', sub: 'Tablet', tier: 'mid', tags: ['apple', 'tablet', 'students'], blurb: 'The entry iPad with USB-C and a 10.9-inch screen — ideal for students and streaming.', specs: ['10.9" Liquid', 'A14 Bionic', 'USB-C'], heat: 74 },
        'biqu-panda':         { brand: 'BIQU', model: 'Panda CryoGrip Pro', sub: '3D Printer Upgrade', tier: 'budget', tags: ['bambu', 'upgrade', 'build-plate'], blurb: 'Cold-plate that grips PLA and PETG without glue and releases prints as it cools — a favourite Bambu upgrade.', specs: ['257×257 mm', 'Glacier finish', 'Bambu Lab'], heat: 45 }
    };

    /** Make local asset paths root-absolute so they work from /guides/ too. */
    function rootPath(src) {
        if (!src || /^(https?:)?\/\//.test(src) || src.charAt(0) === '/') return src;
        return '/' + src;
    }

    function affiliateUrl(p) {
        if (p.url) return p.url;
        if (p.asin) return 'https://www.amazon.ae/dp/' + p.asin + '?tag=' + TAG;
        const q = p.query || (p.brand ? p.brand + ' ' + p.model : p.title);
        return 'https://www.amazon.ae/s?k=' + encodeURIComponent(q) + '&tag=' + TAG;
    }

    function normalize(raw, legacy, images) {
        const category = LEGACY_CATEGORY_MAP[raw.category] || raw.category;
        const meta = legacy ? (LEGACY_META[raw.id] || {}) : {};
        const found = images && images[raw.id] && images[raw.id].length ? images[raw.id] : null;
        let own = raw.gallery && raw.gallery.length ? raw.gallery : (raw.image ? [raw.image] : []);
        // Externally hosted legacy images (e.g. Amazon CDN) give way to photos we host ourselves.
        if (found && own.length && own.every(src => /^https?:\/\//.test(src))) own = [];
        const useFound = !own.length && !!found;
        const gallery = (own.length ? own : (found || [])).map(rootPath);
        const item = {
            id: raw.id,
            brand: raw.brand || meta.brand || raw.title.split(' ')[0],
            model: raw.model || meta.model || raw.title,
            title: raw.title,
            category: category,
            sub: raw.sub || meta.sub || category,
            tier: raw.tier || meta.tier || 'mid',
            tags: raw.tags || meta.tags || [],
            blurb: raw.blurb || meta.blurb || '',
            specs: raw.specs || meta.specs || [],
            query: raw.query || null,
            asin: raw.asin || null,
            image: gallery[0] || null,
            gallery: gallery,
            added: raw.added || (legacy ? '2026-04' : '2026-09'),
            heat: typeof raw.heat === 'number' ? raw.heat : (meta.heat || 50)
        };
        item.url = affiliateUrl(Object.assign({}, raw, item));
        item.hasImage = !!item.image;
        item.imageFit = useFound ? 'contain' : 'cover'; // official renders sit on clean backgrounds → never crop them
        return item;
    }

    /**
     * Build the merged catalog.
     * @param {Array}  items   curated items (CATALOG_ITEMS)
     * @param {Array}  legacy  legacy products with photos (window.products)
     * @param {Object} images  optional map id → [image paths] discovered in assets/images/<id>/ (CATALOG_IMAGES)
     */
    function build(items, legacy, images) {
        const seen = new Set();
        const out = [];
        (legacy || []).forEach(p => { if (!seen.has(p.id)) { seen.add(p.id); out.push(normalize(p, true, images)); } });
        (items || []).forEach(p => { if (!seen.has(p.id)) { seen.add(p.id); out.push(normalize(p, false, images)); } });
        return out;
    }

    function category(key) { return CATEGORY_BY_KEY[key] || null; }
    function categoryBySlug(slug) { return CATEGORIES.find(c => c.slug === slug) || null; }

    function brands(list) {
        const counts = {};
        list.forEach(p => { counts[p.brand] = (counts[p.brand] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count }));
    }

    function search(list, term) {
        const t = (term || '').trim().toLowerCase();
        if (t.length < 2) return [];
        const words = t.split(/\s+/);
        return list
            .map(p => {
                const hay = [p.title, p.brand, p.model, p.category, p.sub, (p.tags || []).join(' ')].join(' ').toLowerCase();
                const score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
                return { p, score: words.every(w => hay.includes(w)) ? score + 10 : score };
            })
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score || b.p.heat - a.p.heat)
            .map(x => x.p);
    }

    return { TAG, CATEGORIES, LEGACY_META, build, normalize, affiliateUrl, category, categoryBySlug, brands, search };
});

// Browser bootstrap: expose the merged list as window.CATALOG
if (typeof window !== 'undefined' && window.Catalog) {
    window.CATALOG = window.Catalog.build(window.CATALOG_ITEMS || [], window.products || [], window.CATALOG_IMAGES || {});
}
