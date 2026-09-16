const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../assets/js/catalog.js');

const curated = [
    { id: 'a', brand: 'Sony', model: 'X', title: 'Sony X Thing', category: 'Audio', sub: 'Earbuds', tier: 'mid', tags: ['anc'], blurb: 'b', specs: ['1', '2', '3'], query: 'Sony X earbuds', asin: null, added: '2026-09', heat: 70 },
    { id: 'b', brand: 'Anker', model: 'Y', title: 'Anker Y', category: 'Accessories', sub: 'Charger', tier: 'budget', tags: [], blurb: 'b', specs: [], query: 'Anker Y', asin: 'B0TEST1234', added: '2026-09', heat: 40 }
];
const legacy = [
    { id: 'kindle-paperwhite', title: 'Kindle Paperwhite', category: 'Kindle & E-Readers', image: 'assets/images/k/1.jpg', price: 'AED 1', url: 'https://amzn.to/abc', asin: 'B09TMR67G8', gallery: ['assets/images/k/1.jpg', 'assets/images/k/2.jpg'] },
    { id: 'a', title: 'Duplicate of a', category: 'Audio' }
];

test('search links are built with encoded query and affiliate tag', () => {
    const [a] = C.build([curated[0]], []);
    assert.equal(a.url, 'https://www.amazon.ae/s?k=Sony%20X%20earbuds&tag=gadgetsdxb-21');
});

test('known ASIN links go straight to the product page', () => {
    const b = C.build(curated, []).find(p => p.id === 'b');
    assert.equal(b.url, 'https://www.amazon.ae/dp/B0TEST1234?tag=gadgetsdxb-21');
});

test('legacy products keep their shortlink, photos and get remapped category + metadata', () => {
    const [k] = C.build([], [legacy[0]]);
    assert.equal(k.url, 'https://amzn.to/abc');
    assert.equal(k.category, 'Tech');
    assert.equal(k.brand, 'Amazon');
    assert.equal(k.sub, 'E-Reader');
    assert.equal(k.gallery.length, 2);
    assert.equal(k.image, '/assets/images/k/1.jpg', 'local paths become root-absolute');
    assert.equal(k.gallery[1], '/assets/images/k/2.jpg');
    assert.equal(k.hasImage, true);
    assert.equal(k.specs.length, 3);
    assert.equal(k.price, undefined, 'stale prices must not leak into the catalog');
});

test('legacy wins on duplicate ids and curated items have no image', () => {
    const all = C.build(curated, legacy);
    assert.equal(all.length, 3);
    assert.equal(all.find(p => p.id === 'a').title, 'Duplicate of a');
    assert.equal(all.find(p => p.id === 'b').hasImage, false);
});

test('every category in the config has unique slug and key', () => {
    const keys = new Set(C.CATEGORIES.map(c => c.key));
    const slugs = new Set(C.CATEGORIES.map(c => c.slug));
    assert.equal(keys.size, C.CATEGORIES.length);
    assert.equal(slugs.size, C.CATEGORIES.length);
    assert.equal(C.categoryBySlug('smarthome').key, 'Smart Home');
    assert.equal(C.category('Nope'), null);
});

test('search matches brand, tags and multiple words, ranks full matches first', () => {
    const all = C.build(curated, []);
    assert.deepEqual(C.search(all, 'anker').map(p => p.id), ['b']);
    assert.deepEqual(C.search(all, 'anc').map(p => p.id), ['a']);
    assert.deepEqual(C.search(all, 'sony earbuds').map(p => p.id), ['a']);
    assert.deepEqual(C.search(all, 'x'), [], 'single character queries return nothing');
});

test('brands are counted and sorted by frequency', () => {
    const all = C.build(curated, [legacy[0]]);
    const b = C.brands(all);
    assert.equal(b.length, 3);
    assert.ok(b.every(x => x.count === 1));
    assert.deepEqual(b.map(x => x.name), ['Amazon', 'Anker', 'Sony']);
});
