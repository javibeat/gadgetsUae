const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../assets/js/stats.js');

test('stats only load on the real domain and with a website id', () => {
    assert.equal(S.shouldLoad('abc', 'gadgetsdxb.com'), true);
    assert.equal(S.shouldLoad('abc', 'www.gadgetsdxb.com'), true);
    assert.equal(S.shouldLoad('abc', 'localhost'), false);
    assert.equal(S.shouldLoad('', 'gadgetsdxb.com'), false);
});

test('amazon links are recognised, other links are not', () => {
    assert.equal(S.isAmazonLink('https://www.amazon.ae/dp/B09TMR67G8?tag=gadgetsdxb-21'), true);
    assert.equal(S.isAmazonLink('https://amzn.to/abc'), true);
    assert.equal(S.isAmazonLink('https://amazon.ae/s?k=x'), true);
    assert.equal(S.isAmazonLink('https://www.amazon.com/dp/B09TMR67G8'), false);
    assert.equal(S.isAmazonLink('https://fakeamazon.ae/x'), false);
    assert.equal(S.isAmazonLink('/gaming.html'), false);
    assert.equal(S.isAmazonLink(''), false);
});

test('amazon click data includes product, asin and page when known', () => {
    assert.deepEqual(
        S.amazonClickData('https://www.amazon.ae/dp/b09tmr67g8?tag=x', 'kindle', '/deals.html'),
        { page: '/deals.html', product: 'kindle', asin: 'B09TMR67G8' }
    );
    assert.deepEqual(S.amazonClickData('https://amzn.to/abc', undefined, ''), { page: '/' });
});

test('search events are normalised and skip empty queries', () => {
    assert.deepEqual(S.searchEventData('  AirPods Pro ', 3), { query: 'airpods pro', results: 3 });
    assert.equal(S.searchEventData(' ', 0), null);
    assert.equal(S.searchEventData(undefined, 0), null);
    assert.equal(S.searchEventData('x'.repeat(100), 0).query.length, 60);
});
