/**
 * Page controllers — wire the catalog + rotation into each page type.
 * Usage: <body data-page="home"> … Pages.boot() runs after DOMContentLoaded.
 */
(function (root) {
    'use strict';

    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const R = () => root.Rotation;
    const C = () => root.Catalog;
    const all = () => root.CATALOG || [];
    const renderer = () => root.renderer || root.initRenderer(all());

    function param(name) {
        try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; }
    }

    function reveal(scope) {
        if (!('IntersectionObserver' in root)) return;
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.08 });
        (scope || document).querySelectorAll('.product-card, .cat-tile, .guide-card, .faq-item, .trust-card').forEach(el => { el.classList.add('reveal'); obs.observe(el); });
    }

    function startCountdown() {
        const els = document.querySelectorAll('[data-countdown]');
        if (!els.length) return;
        function tick() {
            const now = Date.now();
            const dayEndUtc = (R().dayIndex(new Date()) + 1) * 86400000 - 4 * 3600000; // next midnight UAE
            const d = Math.max(0, dayEndUtc - now);
            const h = Math.floor(d / 36e5), m = Math.floor((d % 36e5) / 6e4);
            els.forEach(el => { el.textContent = h + 'h ' + String(m).padStart(2, '0') + 'm'; });
        }
        tick(); setInterval(tick, 30000);
    }

    function setText(sel, text) { const el = $(sel); if (el) el.textContent = text; }

    function chip(label, value, active, extra) {
        return '<button class="chip' + (active ? ' active' : '') + '" data-value="' + value + '"' + (extra || '') + '>' + label + '</button>';
    }

    /* ---------- HOME ---------- */
    function home() {
        const items = all();
        const r = renderer();
        const now = new Date();
        const deal = R().dealOfDay(items, now);
        const heroWrap = $('#deal-of-day');
        if (heroWrap && deal) { heroWrap.innerHTML = r.createHero(deal, { dayLabel: R().dayLabel(now) }); r.bind(heroWrap); }

        const trending = R().trending(items, 8, now, deal ? [deal.id] : []);
        r.render('container-trending', { items: trending });

        // Category bento tiles with live counts
        const tiles = $('#category-tiles');
        if (tiles) {
            tiles.innerHTML = C().CATEGORIES.map(c => {
                const n = items.filter(p => p.category === c.key).length;
                return '<a class="cat-tile" href="' + c.page + '" style="--hue:' + c.hue + '">' +
                    root.ProductRenderer.icon(c.icon, 'cat-tile-icon') +
                    '<span class="cat-tile-count">' + n + ' picks</span>' +
                    '<strong>' + c.label + '</strong><small>' + c.tagline + '</small></a>';
            }).join('');
        }

        r.render('container-fresh', { items: R().fresh(items, 4) });

        const used = new Set([deal && deal.id].concat(trending.map(p => p.id)));
        ['Gaming', 'Mobiles', 'Audio', 'Tech', 'Smart Home'].forEach(key => {
            const id = 'container-' + C().category(key).slug;
            if (!$('#' + id)) return;
            const picks = R().spotlight(items, key, 4, now, Array.from(used));
            picks.forEach(p => used.add(p.id));
            r.render(id, { items: picks });
        });

        setText('[data-catalog-count]', String(items.length));
        setText('[data-brand-count]', String(C().brands(items).length));
        setText('[data-day-label]', R().dayLabel(now));
    }

    /* ---------- CATEGORY ---------- */
    function category(body) {
        const key = body.dataset.category;
        const cat = C().category(key);
        const items = all().filter(p => p.category === key);
        const r = renderer();
        const now = new Date();
        if (!cat) return;

        setText('[data-catalog-count]', String(items.length));
        const spot = R().spotlight(items, key, 3, now);
        r.render('category-spotlight', { items: spot });

        const subs = Array.from(new Set(items.map(p => p.sub))).sort();
        const state = { sub: 'all', tier: 'all' };
        const bar = $('#filter-bar');
        const grid = $('#category-products-grid');

        function apply() {
            let list = R().dailyOrder(items, now, key);
            if (state.sub !== 'all') list = list.filter(p => p.sub === state.sub);
            if (state.tier !== 'all') list = list.filter(p => p.tier === state.tier);
            r.render(grid, { items: list, emptyText: 'No products match these filters yet.' });
            setText('[data-result-count]', list.length + ' of ' + items.length);
            reveal(grid);
        }
        if (bar) {
            bar.innerHTML =
                '<div class="chip-row" data-group="sub">' + chip('All', 'all', true) + subs.map(s => chip(s, s)).join('') + '</div>' +
                '<div class="chip-row chip-row-tier" data-group="tier">' + chip('Any budget', 'all', true) + chip('Value', 'budget') + chip('Sweet spot', 'mid') + chip('Premium', 'premium') + '</div>';
            bar.addEventListener('click', e => {
                const btn = e.target.closest('.chip'); if (!btn) return;
                const group = btn.closest('.chip-row').dataset.group;
                state[group] = btn.dataset.value;
                btn.parentElement.querySelectorAll('.chip').forEach(b => b.classList.toggle('active', b === btn));
                apply();
            });
        }
        apply();
    }

    /* ---------- ALL PRODUCTS ---------- */
    function products() {
        const items = all();
        const r = renderer();
        const now = new Date();
        const state = { cat: param('cat') || 'all', tier: 'all', brand: 'all', q: param('q') || '' };
        const bar = $('#filter-bar');
        const grid = $('#all-products-grid');
        const input = $('#catalog-search');
        if (input) input.value = state.q;

        const PAGE = 24;
        let shown = PAGE;
        let more = $('#load-more');
        if (!more && grid) {
            const wrap = document.createElement('div');
            wrap.className = 'load-more-wrap';
            wrap.innerHTML = '<button class="btn-outline" id="load-more" type="button">Show more</button>';
            grid.insertAdjacentElement('afterend', wrap);
            more = wrap.firstChild;
            more.addEventListener('click', () => { shown += PAGE; apply(true); });
        }

        function apply(keep) {
            if (!keep) shown = PAGE;
            let list = state.q.length >= 2 ? C().search(items, state.q) : R().dailyOrder(items, now, 'all');
            if (state.cat !== 'all') list = list.filter(p => p.category === state.cat);
            if (state.tier !== 'all') list = list.filter(p => p.tier === state.tier);
            if (state.brand !== 'all') list = list.filter(p => p.brand === state.brand);
            r.render(grid, { items: list.slice(0, shown), emptyText: 'No products match. Try another brand or clear the search.' });
            setText('[data-result-count]', list.length + ' of ' + items.length);
            if (more) {
                const left = list.length - shown;
                more.parentElement.hidden = left <= 0;
                more.textContent = 'Show ' + Math.min(PAGE, Math.max(left, 0)) + ' more';
            }
            reveal(grid);
        }
        if (bar) {
            const brands = C().brands(items).filter(b => b.count >= 2);
            bar.innerHTML =
                '<div class="chip-row" data-group="cat">' + chip('All', 'all', state.cat === 'all') + C().CATEGORIES.map(c => chip(c.label, c.key, state.cat === c.key)).join('') + '</div>' +
                '<div class="chip-row chip-row-tier" data-group="tier">' + chip('Any budget', 'all', true) + chip('Value', 'budget') + chip('Sweet spot', 'mid') + chip('Premium', 'premium') +
                '<select class="chip chip-select" aria-label="Brand"><option value="all">All brands</option>' + brands.map(b => '<option value="' + b.name + '">' + b.name + ' (' + b.count + ')</option>').join('') + '</select></div>';
            bar.addEventListener('click', e => {
                const btn = e.target.closest('button.chip'); if (!btn) return;
                const group = btn.closest('.chip-row').dataset.group;
                state[group] = btn.dataset.value;
                btn.parentElement.querySelectorAll('button.chip').forEach(b => b.classList.toggle('active', b === btn));
                apply();
            });
            bar.querySelector('select').addEventListener('change', e => { state.brand = e.target.value; apply(); });
        }
        if (input) {
            let t; input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = input.value.trim(); apply(); }, 120); });
        }
        apply();
    }

    /* ---------- TODAY'S PICKS (deals.html) ---------- */
    function deals() {
        const items = all();
        const r = renderer();
        const now = new Date();
        const deal = R().dealOfDay(items, now);
        const heroWrap = $('#deal-of-day');
        if (heroWrap && deal) { heroWrap.innerHTML = r.createHero(deal, { dayLabel: R().dayLabel(now) }); r.bind(heroWrap); }
        const daily = R().daily(items.filter(p => !deal || p.id !== deal.id), 12, 'today');
        r.render('container-today', { items: daily });
        r.render('container-trending', { items: R().trending(items, 8, now, daily.map(p => p.id).concat(deal ? [deal.id] : [])) });
        setText('[data-day-label]', R().dayLabel(now));
    }

    /* ---------- FAVORITES ---------- */
    function favorites() {
        const favs = root.getFavorites ? root.getFavorites() : [];
        const items = all().filter(p => favs.includes(p.id));
        renderer().render('favoritesGrid', { items, emptyText: 'No favourites yet. Tap the heart on any product to keep it here.' });
    }

    /* ---------- GUIDE ---------- */
    function guide(body) {
        const items = all();
        const r = renderer();
        const picked = [];
        document.querySelectorAll('[data-pick]').forEach(slot => {
            const p = items.find(x => x.id === slot.dataset.pick);
            if (!p) { slot.remove(); return; }
            picked.push(p.id);
            slot.innerHTML = r.createCard(p);
            r.bind(slot);
        });
        const rel = $('#guide-related');
        if (rel) {
            const key = rel.dataset.category || body.dataset.category;
            const ex = (rel.dataset.exclude || '').split(',').filter(Boolean).concat(picked);
            r.render(rel, { items: R().spotlight(items, key, 4, new Date(), ex) });
        }
    }

    function notfound() {
        renderer().render('container-trending', { items: R().trending(all(), 8, new Date()) });
    }

    const controllers = { home, category, products, deals, favorites, guide, notfound };

    function boot() {
        const body = document.body;
        const type = body.dataset.page;
        if (!root.CATALOG || !root.Rotation) return;
        if (!root.renderer) root.initRenderer(root.CATALOG);
        if (controllers[type]) controllers[type](body);
        startCountdown();
        reveal();
        if (root.updateFavoriteButtons) root.updateFavoriteButtons();
    }

    root.Pages = { boot, reveal };
    document.addEventListener('DOMContentLoaded', boot);
})(window);
