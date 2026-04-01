# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GadgetsUAE (gadgetsdxb.com) is a static Amazon affiliate tech deals site targeting UAE consumers. It is hosted on GitHub Pages with a custom domain. The site is built with vanilla HTML/CSS/JS — no framework or build step.

## Commands

```bash
# Sync product prices from Amazon PA-API (requires .env with API keys)
npm run sync

# Sync creator/influencer products
npm run sync-creators

# Search Amazon catalog
npm run search

# Discover trending products
npm run discovery

# Generate sitemap
node scripts/generate-sitemap.js

# Update prices locally
node update-prices.js
```

There is no build, lint, or test command. The site is served as static files.

## Architecture

### Data Flow
- **Product catalog**: `assets/js/products.js` — JS array of product objects (id, title, category, price, ASIN, affiliate URL, gallery images). This is the single source of truth for the frontend.
- **Price data**: `assets/data/prices.json` — Prices fetched from Amazon PA-API, keyed by ASIN.
- **Sync scripts** (`scripts/`): Node.js scripts that call the Amazon Product Advertising API (`amazon-paapi` package) to update prices and discover products. They read/write `products.js` and `prices.json`.
- **GitHub Actions** (`.github/workflows/amazon-sync.yml`): Runs `npm run sync` and `npm run discovery` nightly at midnight, auto-commits updated price/product data.

### Frontend
- Each HTML page includes shared components via fetch: `menu.html` (nav) and `footer.html`.
- `assets/js/script.js` — Loads menu, handles mobile nav, highlights active link.
- `assets/js/product-renderer.js` — `ProductRenderer` class that dynamically renders product grids with filtering, galleries, and favorites.
- `assets/js/daily-deals.js` / `deals-scraper.js` / `price-updater.js` — Client-side deal display and price rendering.
- `assets/js/analytics.js` — Custom localStorage-based analytics (page views, searches, product clicks, favorites).
- `analytics-dashboard.html` — Password-protected analytics dashboard.
- `posts/` — Individual product detail pages (one HTML file per product).

### Configuration
- `.env` — Amazon PA-API credentials (`AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_ASSOCIATE_TAG`). Not committed.
- `assets/js/config.js` — Firebase and analytics config. Not committed. Copy from `config.example.js`.
- Marketplace is `www.amazon.ae` (UAE).

### SEO
- `sitemap.xml` and `robots.txt` at root.
- `scripts/generate-sitemap.js` regenerates the sitemap.
- Pages include JSON-LD structured data via `assets/js/jsonld-injector.js`.
- CSP headers are set via meta tags in HTML.

## Key Conventions

- Product IDs are slugs (e.g., `kindlecolor`, `bambu-lab-a1`) matching directory names under `assets/images/`.
- Affiliate links use `amzn.to` shortlinks with `rel="sponsored"`.
- The site content is in English; code comments and documentation are often in Spanish.
- Prices are in AED (UAE Dirhams).
