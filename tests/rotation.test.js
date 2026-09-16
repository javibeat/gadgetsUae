const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../assets/js/rotation.js');

const items = Array.from({ length: 60 }, (_, i) => ({
    id: 'p' + i,
    category: ['Gaming', 'Audio', 'Tech'][i % 3],
    sub: i % 2 ? 'A' : 'B',
    tags: i % 4 ? ['x'] : ['y'],
    heat: 10 + (i * 7) % 90,
    added: i < 10 ? '2026-09' : '2026-04'
}));

const dayA = new Date('2026-09-16T10:00:00Z');
const dayB = new Date('2026-09-17T10:00:00Z');

test('dayIndex rolls over at midnight UAE (20:00 UTC)', () => {
    const before = new Date('2026-09-16T19:59:59Z');
    const after = new Date('2026-09-16T20:00:00Z');
    assert.equal(R.dayIndex(after) - R.dayIndex(before), 1);
});

test('picks are deterministic for the same day', () => {
    assert.deepEqual(R.daily(items, 6, 's', dayA).map(p => p.id), R.daily(items, 6, 's', dayA).map(p => p.id));
    assert.equal(R.dealOfDay(items, dayA).id, R.dealOfDay(items, dayA).id);
});

test('picks change from one day to the next', () => {
    const a = R.daily(items, 6, 's', dayA).map(p => p.id).join();
    const b = R.daily(items, 6, 's', dayB).map(p => p.id).join();
    assert.notEqual(a, b);
    assert.notEqual(R.dailyOrder(items, dayA).map(p => p.id).join(), R.dailyOrder(items, dayB).map(p => p.id).join());
});

test('different salts give independent selections on the same day', () => {
    const a = R.daily(items, 6, 'one', dayA).map(p => p.id).join();
    const b = R.daily(items, 6, 'two', dayA).map(p => p.id).join();
    assert.notEqual(a, b);
});

test('weekly picks are stable within the week', () => {
    const mon = new Date('2026-09-14T10:00:00Z');
    const fri = new Date('2026-09-18T10:00:00Z');
    assert.equal(R.weekIndex(mon), R.weekIndex(fri));
    assert.deepEqual(R.trending(items, 8, mon).map(p => p.id), R.trending(items, 8, fri).map(p => p.id));
});

test('no duplicates and respects count', () => {
    const picked = R.daily(items, 12, 's', dayA);
    assert.equal(picked.length, 12);
    assert.equal(new Set(picked.map(p => p.id)).size, 12);
    assert.equal(R.daily(items, 500, 's', dayA).length, items.length);
    assert.deepEqual(R.daily([], 5, 's', dayA), []);
    assert.equal(R.dealOfDay([], dayA), null);
});

test('weighted sampling favours hotter items over many days', () => {
    const hot = new Set(items.filter(p => p.heat >= 70).map(p => p.id));
    let hotHits = 0, total = 0;
    for (let d = 0; d < 200; d++) {
        const date = new Date(dayA.getTime() + d * 86400000);
        R.daily(items, 6, 's', date).forEach(p => { total++; if (hot.has(p.id)) hotHits++; });
    }
    const hotShare = hot.size / items.length;
    assert.ok(hotHits / total > hotShare * 1.3, `hot share ${hotHits / total} should beat base ${hotShare}`);
});

test('spotlight only returns the requested category and honours exclusions', () => {
    const ex = ['p0', 'p3'];
    const s = R.spotlight(items, 'Gaming', 5, dayA, ex);
    assert.equal(s.length, 5);
    assert.ok(s.every(p => p.category === 'Gaming'));
    assert.ok(s.every(p => !ex.includes(p.id)));
});

test('trending excludes given ids', () => {
    const deal = R.dealOfDay(items, dayA);
    const t = R.trending(items, 10, dayA, [deal.id]);
    assert.ok(!t.some(p => p.id === deal.id));
});

test('fresh returns newest first, then hottest', () => {
    const f = R.fresh(items, 5);
    assert.ok(f.every(p => p.added === '2026-09'));
    for (let i = 1; i < f.length; i++) assert.ok(f[i - 1].heat >= f[i].heat);
});

test('related prefers same category and sub, never returns itself', () => {
    const me = items[4];
    const rel = R.related(items, me, 4);
    assert.equal(rel.length, 4);
    assert.ok(!rel.some(p => p.id === me.id));
    assert.ok(rel.every(p => p.category === me.category));
});

test('dayLabel formats in UAE time', () => {
    assert.equal(R.dayLabel(new Date('2026-09-16T21:00:00Z')), 'Thu 17 Sept'.replace('Sept', 'Sept')); // 01:00 UAE next day
});
