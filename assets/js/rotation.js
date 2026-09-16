/**
 * Rotation — deterministic, date-seeded product rotation.
 *
 * The site has no backend, so "what's featured today" is computed on the
 * client from the current date (Dubai time). Every visitor sees the same
 * selection on a given day and it changes automatically at midnight UAE.
 *
 * Works in the browser (window.Rotation) and in Node (module.exports).
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) module.exports = factory();
    else root.Rotation = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const UAE_OFFSET_MS = 4 * 3600 * 1000;
    const DAY_MS = 86400 * 1000;

    /** Whole days since epoch, in UAE local time. */
    function dayIndex(date) {
        const d = date instanceof Date ? date : new Date();
        return Math.floor((d.getTime() + UAE_OFFSET_MS) / DAY_MS);
    }

    /** Whole weeks since epoch, weeks starting on Monday (epoch day 0 was a Thursday). */
    function weekIndex(date) { return Math.floor((dayIndex(date) - 4) / 7); }

    /** FNV-1a 32-bit string hash. */
    function hash(str) {
        let h = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 0x01000193) >>> 0;
        }
        return h >>> 0;
    }

    /** mulberry32 PRNG — small, fast, good enough for shuffling. */
    function rng(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function seedFor(parts) { return hash(parts.map(String).join('|')); }

    /** Fisher–Yates shuffle with a seeded PRNG. Returns a new array. */
    function shuffle(items, seed) {
        const arr = items.slice();
        const next = rng(seed);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(next() * (i + 1));
            const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        return arr;
    }

    /**
     * Weighted sampling without replacement (Efraimidis–Spirakis A-Res).
     * Items with higher weight are more likely to appear, but everything gets a turn.
     */
    function weightedSample(items, count, seed, weightFn) {
        const next = rng(seed);
        const w = weightFn || (p => Math.max(1, p.heat || 1));
        return items
            .map(p => ({ p, key: Math.pow(next(), 1 / Math.max(0.0001, w(p))) }))
            .sort((a, b) => b.key - a.key)
            .slice(0, count)
            .map(x => x.p);
    }

    /** Generic daily pick. `salt` separates independent slots on the same day. */
    function daily(items, count, salt, date) {
        return weightedSample(items, count, seedFor(['day', dayIndex(date), salt || '']));
    }

    /** Generic weekly pick. */
    function weekly(items, count, salt, date) {
        return weightedSample(items, count, seedFor(['week', weekIndex(date), salt || '']));
    }

    /** One hero product per day, drawn from the hottest third of the catalog. */
    function dealOfDay(items, date) {
        if (!items.length) return null;
        const sorted = items.slice().sort((a, b) => (b.heat || 0) - (a.heat || 0));
        const pool = sorted.slice(0, Math.max(6, Math.ceil(sorted.length / 3)));
        return daily(pool, 1, 'deal', date)[0] || null;
    }

    /** Weekly trending set, biased to popularity, excluding the given ids. */
    function trending(items, count, date, excludeIds) {
        const ex = new Set(excludeIds || []);
        return weekly(items.filter(p => !ex.has(p.id)), count, 'trending', date);
    }

    /** Daily category spotlight. */
    function spotlight(items, categoryKey, count, date, excludeIds) {
        const ex = new Set(excludeIds || []);
        const pool = items.filter(p => p.category === categoryKey && !ex.has(p.id));
        return daily(pool, count, 'cat:' + categoryKey, date);
    }

    /** Newest additions (by `added` YYYY-MM), ties broken by heat. */
    function fresh(items, count) {
        return items.slice()
            .sort((a, b) => (b.added || '').localeCompare(a.added || '') || (b.heat || 0) - (a.heat || 0))
            .slice(0, count);
    }

    /** Related items: same category first, then tag overlap, then heat. */
    function related(items, product, count) {
        const tags = new Set(product.tags || []);
        return items
            .filter(p => p.id !== product.id)
            .map(p => {
                const overlap = (p.tags || []).filter(t => tags.has(t)).length;
                const sameCat = p.category === product.category ? 1 : 0;
                const sameSub = p.sub === product.sub ? 1 : 0;
                return { p, score: sameCat * 10 + sameSub * 5 + overlap * 2 + (p.heat || 0) / 100 };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, count)
            .map(x => x.p);
    }

    /** Daily ordering of a full list (used for category and "all products" pages). */
    function dailyOrder(items, date, salt) {
        return shuffle(items, seedFor(['order', dayIndex(date), salt || '']));
    }

    /** Human label for the current rotation day, e.g. "Tue 16 Sep". */
    function dayLabel(date) {
        const d = new Date((date || new Date()).getTime() + UAE_OFFSET_MS);
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    }

    return { dayIndex, weekIndex, hash, rng, seedFor, shuffle, weightedSample, daily, weekly, dealOfDay, trending, spotlight, fresh, related, dailyOrder, dayLabel };
});
