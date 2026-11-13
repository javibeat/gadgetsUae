const test = require('node:test');
const assert = require('node:assert/strict');
const { inlineInclude } = require('../scripts/inline-includes.js');
const { CATEGORY_PAGES, GUIDES } = require('../scripts/site-content.js');

test('inlineInclude fills an empty include and is idempotent', () => {
    const page = '<body><div id="menu-include"></div><main>x</main></body>';
    const once = inlineInclude(page, 'menu', '<nav><a href="/">Home</a></nav>');
    assert.match(once, /<div id="menu-include"><!--include:menu-->\n<nav><a href="\/">Home<\/a><\/nav>\n<!--\/include:menu--><\/div>/);
    assert.equal(inlineInclude(once, 'menu', '<nav><a href="/">Home</a></nav>'), once);
    const updated = inlineInclude(once, 'menu', '<nav>New</nav>');
    assert.ok(updated.includes('<nav>New</nav>') && !updated.includes('Home'));
});

test('inlineInclude leaves pages without the placeholder untouched', () => {
    const page = '<body><main>no includes</main></body>';
    assert.equal(inlineInclude(page, 'footer', '<footer></footer>'), page);
});

test('page titles fit in Google results (≤ 62 chars) and H1s name the UAE', () => {
    for (const [key, c] of Object.entries(CATEGORY_PAGES)) {
        assert.ok(c.title.length <= 62, `${key} title too long (${c.title.length})`);
        assert.match(c.h1, /UAE/, `${key} H1 should mention UAE`);
    }
    for (const g of GUIDES) assert.ok(g.seoTitle.length <= 62, `${g.slug} title too long (${g.seoTitle.length})`);
});

test('the card renderer works in Node so pages can be pre-rendered', () => {
    globalThis.Catalog = require('../assets/js/catalog.js');
    const ProductRenderer = require('../assets/js/product-renderer.js');
    const p = { id: 'x', title: 'Sony Test', brand: 'Sony', model: 'Test', category: 'Audio', sub: 'Earbuds', tags: [], specs: ['a', 'b', 'c'], blurb: 'A useful sentence.', url: 'https://www.amazon.ae/s?k=x&tag=gadgetsdxb-21', hasImage: false, tier: 'mid', heat: 1 };
    const html = new ProductRenderer([p]).createCard(p);
    assert.match(html, /data-id="x"/);
    assert.match(html, /tag=gadgetsdxb-21/);
    assert.match(html, /rel="sponsored noopener noreferrer"/);
});
