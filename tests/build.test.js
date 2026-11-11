const test = require('node:test');
const assert = require('node:assert/strict');
const Catalog = require('../assets/js/catalog.js');
const { CATALOG_ITEMS } = require('../assets/data/catalog-items.js');
const { toFeed, loadLegacy } = require('../scripts/build-data.js');
const { CATEGORY_PAGES, GUIDES } = require('../scripts/site-content.js');
const T = require('../scripts/site-templates.js');

const catalog = Catalog.build(CATALOG_ITEMS, loadLegacy());
const ids = new Set(catalog.map(p => p.id));

test('real catalog is consistent: unique ids, known categories, complete cards', () => {
    assert.equal(ids.size, catalog.length);
    assert.ok(catalog.length >= 120);
    const known = new Set(Catalog.CATEGORIES.map(c => c.key));
    for (const p of catalog) {
        assert.ok(known.has(p.category), `${p.id}: unknown category ${p.category}`);
        assert.ok(p.brand && p.model && p.title, `${p.id}: missing names`);
        assert.equal(p.specs.length, 3, `${p.id}: needs 3 specs`);
        assert.ok(p.blurb.length > 20 && p.blurb.length <= 125, `${p.id}: blurb length`);
        assert.match(p.url, /^https:\/\/(www\.amazon\.ae\/|amzn\.to\/)/, `${p.id}: bad url`);
        assert.ok(/tag=gadgetsdxb-21/.test(p.url) || /amzn\.to/.test(p.url), `${p.id}: missing affiliate tag`);
        assert.ok(!('price' in p), `${p.id}: prices must not be in the catalog`);
    }
});

test('every category has page content and every guide references real products', () => {
    Catalog.CATEGORIES.forEach(c => assert.ok(CATEGORY_PAGES[c.key], 'missing content for ' + c.key));
    const slugs = new Set();
    for (const g of GUIDES) {
        assert.ok(!slugs.has(g.slug), 'duplicate guide slug ' + g.slug); slugs.add(g.slug);
        // category: null marks a cross-category (seasonal) guide
        assert.ok(g.category === null || Catalog.category(g.category), g.slug + ': unknown category');
        if (g.updated) assert.ok(T.isoMonth(g.updated), g.slug + ': updated must look like "November 2026"');
        assert.ok(g.picks.length >= 4);
        for (const p of g.picks) assert.ok(ids.has(p.id), `${g.slug}: unknown product ${p.id}`);
        assert.equal(new Set(g.picks.map(p => p.id)).size, g.picks.length, g.slug + ': duplicate picks');
    }
});

test('JSON feed for the app has products, rotation and absolute image urls', () => {
    const feed = toFeed(catalog, new Date('2026-09-16T10:00:00Z'));
    assert.equal(feed.products.length, catalog.length);
    assert.ok(ids.has(feed.rotation.dealOfDay));
    assert.equal(feed.rotation.trending.length, 8);
    assert.ok(!feed.rotation.trending.includes(feed.rotation.dealOfDay));
    const withImg = feed.products.filter(p => p.image);
    assert.ok(withImg.length >= 20);
    assert.ok(withImg.every(p => /^https:\/\//.test(p.image)));
    assert.ok(withImg.some(p => p.image.startsWith('https://gadgetsdxb.com/assets/images/')));
    assert.ok(feed.categories.every(c => c.count > 0));
    assert.ok(!JSON.stringify(feed).includes('AED'));
});

test('templates escape user-visible text and build valid breadcrumbs', () => {
    assert.equal(T.esc('<b>"x" & y</b>'), '&lt;b&gt;&quot;x&quot; &amp; y&lt;/b&gt;');
    const bc = T.breadcrumb([{ label: 'Home', href: '/' }, { label: 'A & B' }]);
    assert.ok(bc.includes('<a href="/">Home</a>') && bc.includes('<strong>A &amp; B</strong>'));
    const html = T.page({ title: 'T', description: 'D', path: '/x.html', main: '<p>hi</p>', bodyAttrs: 'data-page="x"' });
    assert.ok(html.startsWith('<!DOCTYPE html>') && html.includes('<link rel="canonical" href="https://gadgetsdxb.com/x.html">'));
    assert.ok(html.includes('data-page="x"') && html.includes('/assets/js/page.js'));
    assert.equal(T.faq([]), '');
    assert.ok(T.faqJsonLd([{ q: 'Q?', a: 'A.' }]).includes('"FAQPage"'));
});

test('isoMonth turns a "Month YYYY" label into a schema.org date', () => {
    assert.equal(T.isoMonth('November 2026'), '2026-11-01');
    assert.equal(T.isoMonth(' january 2027 '), '2027-01-01');
    assert.equal(T.isoMonth(''), null);
    assert.equal(T.isoMonth('Nov 2026'), null);
    assert.equal(T.isoMonth(undefined), null);
});

test('seasonal Black Friday guide exists, has FAQs and never mentions prices', () => {
    const bf = GUIDES.find(g => g.slug === 'black-friday-white-friday-uae-2026');
    assert.ok(bf, 'Black Friday guide missing');
    assert.equal(bf.category, null);
    assert.ok(bf.faq.length >= 4);
    const text = JSON.stringify(bf);
    assert.ok(!/AED|Dh\s?\d|\$\d|\d+\s?%/.test(text), 'no prices or percentages in the Black Friday guide');
});
