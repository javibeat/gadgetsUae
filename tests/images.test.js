const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { discover, render } = require('../scripts/build-images.js');
const Catalog = require('../assets/js/catalog.js');

function tmpImages() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'imgs-'));
    fs.mkdirSync(path.join(dir, 'ps5-pro'));
    fs.writeFileSync(path.join(dir, 'ps5-pro', '10.jpg'), '');
    fs.writeFileSync(path.join(dir, 'ps5-pro', '2.webp'), '');
    fs.writeFileSync(path.join(dir, 'ps5-pro', 'notes.txt'), '');
    fs.mkdirSync(path.join(dir, 'unknown-folder'));
    fs.writeFileSync(path.join(dir, 'unknown-folder', '1.jpg'), '');
    fs.mkdirSync(path.join(dir, 'empty-id'));
    return dir;
}

test('discover only picks catalog ids, image files, natural order', () => {
    const map = discover(['ps5-pro', 'empty-id'], tmpImages());
    assert.deepEqual(Object.keys(map), ['ps5-pro']);
    assert.deepEqual(map['ps5-pro'], ['/assets/images/ps5-pro/2.webp', '/assets/images/ps5-pro/10.jpg']);
});

test('render produces loadable JS', () => {
    const src = render({ a: ['/assets/images/a/1.jpg'] });
    const mod = { exports: {} };
    new Function('module', src)(mod);
    assert.deepEqual(mod.exports.CATALOG_IMAGES.a, ['/assets/images/a/1.jpg']);
});

test('discovered photos flow into curated items but never override legacy galleries', () => {
    const curated = [{ id: 'x', brand: 'B', model: 'M', title: 'B M', category: 'Audio', sub: 'Earbuds', tier: 'mid', tags: [], blurb: 'b', specs: [], query: 'q', asin: null, added: '2026-09', heat: 1 }];
    const legacy = [{ id: 'y', title: 'Y', category: 'Audio', image: 'assets/images/y/1.jpg', url: 'https://amzn.to/y' }];
    const all = Catalog.build(curated, legacy, { x: ['/assets/images/x/1.jpg', '/assets/images/x/2.jpg'], y: ['/assets/images/y/9.jpg'] });
    const x = all.find(p => p.id === 'x'), y = all.find(p => p.id === 'y');
    assert.equal(x.hasImage, true);
    assert.equal(x.gallery.length, 2);
    assert.equal(y.image, '/assets/images/y/1.jpg');
    assert.equal(Catalog.build(curated, [], {})[0].hasImage, false);
});
