# GadgetsUAE (gadgetsdxb.com)

Static Amazon.ae affiliate site for UAE tech shoppers, hosted on GitHub Pages. Version 7 (September 2026).

## What v7 is

- **Curated catalog, no prices.** ~150 hand-picked products in `assets/data/catalog-items.js` (plus legacy photo products in `assets/js/products.js`). The site never shows a price; every card links to the live Amazon.ae listing with `tag=gadgetsdxb-21`.
- **Daily rotation.** `assets/js/rotation.js` seeds by date to pick the product of the day, weekly trending and per-category spotlights, so the home page, `deals.html` (Today's picks) and the 8 category pages change every day without a deploy.
- **Buying guides.** 8 guides under `guides/` (earbuds, headphones, consoles, laptops, robot vacuums, smartwatches, chargers, 3D printers), generated from `scripts/site-content.js`.
- **Blog.** `blog.html` + one page per post in `posts/` (editorial only, no prices).
- **App feed.** `assets/data/catalog.json` is a public JSON export of the catalog, rebuilt nightly by the `daily-build` workflow.
- Vanilla HTML/CSS/JS, no framework. Shared `menu.html` / `footer.html` are injected by `assets/js/script.js`.

## Commands

```bash
npm test          # node --test: catalog, rotation and build scripts
npm run build     # build data + pages + sitemap
npm run sync      # Amazon sync (manual until Creators API access is granted; needs .env)
```

## Layout

- `index.html`, `deals.html`, `products.html`, `guides.html`, category pages (`gaming.html`, `mobiles.html`, ...)
- `assets/css/style.css` (site), `assets/css/blog.css` (blog/posts)
- `assets/js/catalog.js`, `rotation.js`, `product-renderer.js`, `page.js`, `jsonld-injector.js`, `analytics.js` (local-only)
- `scripts/` build, sitemap and Amazon tooling; `.github/workflows/` nightly build

See `CLAUDE.md` for conventions.
