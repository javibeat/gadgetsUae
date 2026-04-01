require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ===== Creators API Configuration =====
const CREDENTIAL_ID = process.env.CREATORS_CREDENTIAL_ID || process.env.AMAZON_CREATORS_ID || process.env.AMAZON_ACCESS_KEY;
const CREDENTIAL_SECRET = process.env.CREATORS_CREDENTIAL_SECRET || process.env.AMAZON_CREATORS_SECRET || process.env.AMAZON_SECRET_KEY;
const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;
const MARKETPLACE = 'www.amazon.ae';

// Creators API v2.2 (Europe region — includes UAE)
const TOKEN_URL = 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token';
const API_BASE = 'https://creatorsapi.amazon/catalog/v1';

const productsFilePath = path.join(__dirname, '../assets/js/products.js');

let cachedToken = null;
let tokenExpiry = 0;

// Category mapping: search keywords → frontend category name
const CATEGORIES = [
    { frontend: 'Gaming', keyword: 'gaming console Nintendo PlayStation Xbox controller' },
    { frontend: 'Mobiles', keyword: 'iPhone Samsung Galaxy smartphone phone' },
    { frontend: 'Audio', keyword: 'headphones earbuds speaker Echo audio' },
    { frontend: 'Tech', keyword: 'laptop MacBook monitor keyboard computing' },
    { frontend: 'Smart Home', keyword: 'smart home gadget vacuum robot cleaner' },
    { frontend: 'Kindle & E-Readers', keyword: 'Kindle E-reader Paperwhite Scribe' }
];

// Products with local images that should never be removed by rotation
const CURATED_MARKER = 'assets/images/';

// ===== Helpers =====

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const response = await axios.post(TOKEN_URL,
            `grant_type=client_credentials&client_id=${encodeURIComponent(CREDENTIAL_ID)}&client_secret=${encodeURIComponent(CREDENTIAL_SECRET)}&scope=creatorsapi/default`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        cachedToken = response.data.access_token;
        tokenExpiry = Date.now() + (55 * 60 * 1000);
        return cachedToken;
    } catch (e) {
        console.error('❌ Failed to get OAuth token:', e.response?.data || e.message);
        process.exit(1);
    }
}

function loadProducts() {
    if (!fs.existsSync(productsFilePath)) return [];
    try {
        const content = fs.readFileSync(productsFilePath, 'utf8');
        const match = content.match(/const products = (\[[\s\S]*?\]);/);
        if (!match) return [];
        return new Function(`return ${match[1]}`)();
    } catch (e) {
        console.error('Error loading products:', e.message);
        return [];
    }
}

function saveProducts(products) {
    const productsString = JSON.stringify(products, null, 4)
        .replace(/"(\w+)":/g, '$1:')
        .replace(/"/g, "'");

    const content = `const products = ${productsString};\n\nwindow.products = products;`;
    fs.writeFileSync(productsFilePath, content);
}

function isCurated(product) {
    return product.image && product.image.startsWith(CURATED_MARKER);
}

// ===== Creators API Calls =====

async function discoverForCategory(category) {
    console.log(`🔎 Discovering items for: ${category.frontend}...`);

    const token = await getAccessToken();

    const requestBody = {
        keywords: category.keyword,
        marketplace: MARKETPLACE,
        partnerTag: ASSOCIATE_TAG,
        partnerType: 'Associates',
        searchIndex: 'All',
        itemCount: 10,
        resources: [
            'itemInfo.title',
            'offersV2.listings.price',
            'images.primary.large',
            'images.variants.large'
        ]
    };

    try {
        const response = await axios.post(`${API_BASE}/searchItems`, requestBody, {
            headers: {
                'Authorization': `Bearer ${token}, Version 2.2`,
                'Content-Type': 'application/json',
                'x-marketplace': MARKETPLACE
            }
        });

        const data = response.data;
        if (data.searchResult && data.searchResult.items) {
            return data.searchResult.items.map(item => {
                const listing = item.offersV2?.listings?.find(l => l.isBuyBoxWinner) || item.offersV2?.listings?.[0];
                const price = listing?.price?.amount || 0;

                return {
                    id: item.asin.toLowerCase(),
                    title: item.itemInfo?.title?.displayValue || 'Unknown Product',
                    category: category.frontend,
                    image: item.images?.primary?.large?.url || '',
                    price: price ? `AED ${price.toFixed(2)}` : 'Check Price',
                    original: null,
                    discount: null,
                    asin: item.asin,
                    url: item.detailPageURL || `https://www.amazon.ae/dp/${item.asin}?tag=${ASSOCIATE_TAG}`,
                    gallery: [
                        item.images?.primary?.large?.url,
                        ...(item.images?.variants?.slice(0, 4).map(v => v.large?.url) || [])
                    ].filter(Boolean)
                };
            });
        }
    } catch (e) {
        const status = e.response?.status;
        const errMsg = e.response?.data?.message || '';
        if (status === 429) {
            console.warn(`⚠️ Rate limited for ${category.frontend}. Skipping.`);
        } else if (status === 403 && errMsg.includes('eligibility')) {
            console.error('❌ Account not eligible: Need 10+ qualifying sales in last 30 days.');
            process.exit(1);
        } else {
            console.error(`❌ Error in ${category.frontend}:`, e.response?.data || e.message);
        }
    }
    return [];
}

// ===== Main Discovery =====

async function startDiscovery() {
    console.log('🚀 Starting Product Discovery (Creators API)...');
    console.log(`📅 ${new Date().toISOString()}`);

    if (!CREDENTIAL_ID || !CREDENTIAL_SECRET || !ASSOCIATE_TAG) {
        console.error('❌ Missing credentials.');
        process.exit(1);
    }

    const existingProducts = loadProducts();
    const curatedProducts = existingProducts.filter(isCurated);
    const curatedAsins = new Set(curatedProducts.map(p => p.asin));

    console.log(`📌 Preserving ${curatedProducts.length} manually curated products`);

    let allNewProducts = [];
    for (const cat of CATEGORIES) {
        const found = await discoverForCategory(cat);
        allNewProducts = [...allNewProducts, ...found];
        // Respect rate limits
        await sleep(1200);
    }

    if (allNewProducts.length === 0) {
        console.log('⚠️ No new products found. Keeping existing catalog.');
        return;
    }

    // Build final product list: curated first, then discovered (deduped)
    const seenAsins = new Set(curatedAsins);
    const rotated = [...curatedProducts];

    for (const cat of CATEGORIES) {
        const catCurated = curatedProducts.filter(p => p.category === cat.frontend);
        const remaining = 12 - catCurated.length;

        if (remaining > 0) {
            const catDiscovered = allNewProducts
                .filter(p => p.category === cat.frontend && !seenAsins.has(p.asin))
                .slice(0, remaining);

            catDiscovered.forEach(p => {
                rotated.push(p);
                seenAsins.add(p.asin);
            });
        }
    }

    // Keep curated products from categories not in CATEGORIES (e.g., 3D Printing)
    existingProducts.forEach(p => {
        if (isCurated(p) && !seenAsins.has(p.asin)) {
            rotated.push(p);
            seenAsins.add(p.asin);
        }
    });

    saveProducts(rotated);
    console.log(`✅ Discovery complete. Total: ${rotated.length} (${curatedProducts.length} curated + ${rotated.length - curatedProducts.length} discovered)`);
}

startDiscovery();
