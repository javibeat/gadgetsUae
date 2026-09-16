# Weekly catalog refresh — procedure for the automated agent

This file is the playbook for the scheduled cloud agent ("GadgetsUAE weekly catalog refresh").
It runs every Monday, adds a handful of trending products to the catalog with official photos,
and publishes them. Follow it literally. Read `CLAUDE.md` first for the architecture.

## Ground rules

- **Never add prices, discounts or "deal" wording.** The site shows no prices (no Amazon API access).
- **Never download images from Amazon** (`amazon.*`, `media-amazon.com`, `amzn.to`). Manufacturer sites,
  their press kits/newsrooms (`news.samsung.com`, `apple.com/newsroom`, `aboutamazon.com`, etc.) or Wikimedia Commons only.
- Only **real, currently sold products** plausibly available on amazon.ae. No rumours, no pre-orders without a listing.
- Do not edit generated pages by hand (`gaming.html`, `guides/*`, `products.html`, …) — `npm run build` regenerates them.
- Do not touch design files (`assets/css/*`, `assets/js/product-renderer.js`, `assets/js/page.js`) or `scripts/site-content.js`.
- If anything fails and cannot be fixed cleanly, **do not push**. Leave the repo as it was (`git checkout -- . && git clean -fd`).

## Steps

1. **Setup and sanity**
   ```bash
   npm ci
   npm test          # must be green before you change anything
   ```

2. **Research this week's picks (4–6 products)**
   - Use web search for what launched or went viral in consumer tech in the last 1–3 weeks
     (phones, laptops, audio, gaming, wearables, smart home, accessories, 3D printing), plus seasonal
     context in the UAE (back to school in late August, Ramadan, White Friday in November, summer travel).
   - Check they are **not already in the catalog**: search `assets/data/catalog-items.js` and `assets/js/products.js`
     by brand/model (`grep -i "<model>"`). Newer generations of existing items are welcome.
   - Spread the picks over at least 3 categories. Favour products a UAE buyer would actually want.

3. **Add each product to `assets/data/catalog-items.js`** (append to the array, before `];`), using exactly this schema:
   ```js
   {
     id: 'brand-model-slug',            // kebab-case, unique
     brand: 'Sony',
     model: 'WH-1000XM6',               // ≤ 18 chars, shown large on the card
     title: 'Sony WH-1000XM6 Wireless Noise Cancelling Headphones', // ≤ 70 chars
     category: 'Audio',                 // one of: Gaming, Mobiles, Audio, Tech, Smart Home, Wearables, Accessories, 3D Printing
     sub: 'Headphones',                 // reuse an existing sub label when one fits (grep "sub:" for the list)
     tier: 'premium',                   // budget | mid | premium
     tags: ['anc', 'wireless'],         // 2–5 lowercase tags
     blurb: 'One useful sentence for a UAE reader, ≤ 120 chars, no prices, no hype words.',
     specs: ['30h battery', 'Adaptive ANC', 'Foldable'], // exactly 3, each ≤ 16 chars
     query: 'Sony WH-1000XM6 headphones', // precise amazon.ae search query (brand + model + type)
     asin: null,                        // leave null unless you are certain of the amazon.ae ASIN
     added: '2026-09',                  // CURRENT year-month — this is what marks it "New"
     heat: 78                           // 60–85 for trending items
   },
   ```
   Keep the file valid JS (single quotes, escape apostrophes as `\'`).

4. **Official photo for each new product**
   ```bash
   node scripts/fetch-image.js <id> <manufacturer-product-page-url>
   # if the page has no usable og:image, pass a direct official image URL instead:
   node scripts/fetch-image.js <id> <image-url> --image
   ```
   Open the saved file with the Read tool and confirm it shows the right product on a clean background
   (no logos, banners with big text, or wrong model). If wrong, delete the file and its `SOURCE.txt` line and retry
   with another official source. Max 3 attempts; a product without a photo still ships (the card shows a silhouette).

5. **Keep the catalog fresh, not bloated**
   - If the catalog has more than 220 curated items, remove the lowest-`heat` items whose `added` is 12+ months old
     (delete the object and its `assets/images/<id>/` folder) until it is back to ~200.
   - Never remove items referenced in `scripts/site-content.js` (guides) or in `assets/js/products.js`.

6. **Verify and publish**
   ```bash
   npm test && npm run build
   git add -A
   git commit -m "weekly: add <N> trending products (<YYYY-MM-DD>)"
   git push origin main
   ```
   The commit message body should list the added ids. The nightly GitHub Action will refresh the JSON feed afterwards.

7. **Report** (final message): the products added (id, category, photo source), anything removed, and any product
   you researched but skipped and why.
