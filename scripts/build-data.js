#!/usr/bin/env node
/**
 * Exports the merged catalog as JSON for external consumers (e.g. the Nibango app).
 * Output: assets/data/catalog.json  → https://gadgetsdxb.com/assets/data/catalog.json
 * Run: npm run build:data
 */
const fs = require('fs');
const path = require('path');
const Catalog = require('../assets/js/catalog.js');
const Rotation = require('../assets/js/rotation.js');
const { CATALOG_ITEMS } = require('../assets/data/catalog-items.js');
const { discover } = require('./build-images.js');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://gadgetsdxb.com';

function loadLegacy() {
    const src = fs.readFileSync(path.join(ROOT, 'assets/js/products.js'), 'utf8');
    return new Function(src.replace('window.products = products;', 'return products;'))();
}

function absolute(img) {
    if (!img) return null;
    return /^https?:\/\//.test(img) ? img : SITE + '/' + img.replace(/^\//, '');
}

function toFeed(catalog, now) {
    const deal = Rotation.dealOfDay(catalog, now);
    return {
        version: 1,
        generatedAt: now.toISOString(),
        site: SITE,
        disclosure: 'As an Amazon Associate, GadgetsUAE earns from qualifying purchases.',
        note: 'No prices: use the url field, prices are shown live on Amazon.ae.',
        categories: Catalog.CATEGORIES.map(c => ({ key: c.key, slug: c.slug, label: c.label, page: SITE + c.page, count: catalog.filter(p => p.category === c.key).length })),
        rotation: {
            dayIndex: Rotation.dayIndex(now),
            dealOfDay: deal ? deal.id : null,
            trending: Rotation.trending(catalog, 8, now, deal ? [deal.id] : []).map(p => p.id)
        },
        products: catalog.map(p => ({
            id: p.id, brand: p.brand, model: p.model, title: p.title,
            category: p.category, sub: p.sub, tier: p.tier, tags: p.tags,
            blurb: p.blurb, specs: p.specs, url: p.url, asin: p.asin,
            image: absolute(p.image),
            added: p.added, heat: p.heat
        }))
    };
}

if (require.main === module) {
    const legacy = loadLegacy();
    const catalog = Catalog.build(CATALOG_ITEMS, legacy, discover(CATALOG_ITEMS.map(p => p.id).concat(legacy.map(p => p.id))));
    const feed = toFeed(catalog, new Date());
    const out = path.join(ROOT, 'assets/data/catalog.json');
    fs.writeFileSync(out, JSON.stringify(feed, null, 2) + '\n');
    console.log(`✓ assets/data/catalog.json — ${feed.products.length} products`);
}

module.exports = { toFeed, loadLegacy, absolute };
