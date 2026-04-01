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
const pricesFilePath = path.join(__dirname, '../assets/data/prices.json');

let cachedToken = null;
let tokenExpiry = 0;

// ===== Helpers =====

function validateCredentials() {
    if (!CREDENTIAL_ID || !CREDENTIAL_SECRET || !ASSOCIATE_TAG) {
        console.error('❌ Missing credentials. Required env vars:');
        console.error('   CREATORS_CREDENTIAL_ID (or AMAZON_ACCESS_KEY as fallback)');
        console.error('   CREATORS_CREDENTIAL_SECRET (or AMAZON_SECRET_KEY as fallback)');
        console.error('   AMAZON_ASSOCIATE_TAG');
        process.exit(1);
    }
    console.log(`🔑 Using Credential ID: ${CREDENTIAL_ID.slice(0, 8)}...`);
    console.log(`🏷️  Associate Tag: ${ASSOCIATE_TAG}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function chunkArray(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

// ===== OAuth 2.0 Token =====

async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    console.log('🔐 Requesting OAuth token from Creators API...');

    try {
        const response = await axios.post(TOKEN_URL,
            `grant_type=client_credentials&client_id=${encodeURIComponent(CREDENTIAL_ID)}&client_secret=${encodeURIComponent(CREDENTIAL_SECRET)}&scope=creatorsapi/default`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        cachedToken = response.data.access_token;
        // Cache for 55 minutes (token lasts 60 min)
        tokenExpiry = Date.now() + (55 * 60 * 1000);
        console.log('✅ OAuth token obtained');
        return cachedToken;
    } catch (e) {
        const status = e.response?.status;
        const data = e.response?.data;
        console.error(`❌ Failed to get OAuth token (HTTP ${status}):`, data || e.message);
        if (status === 401) {
            console.error('   → Check your CREATORS_CREDENTIAL_ID and CREATORS_CREDENTIAL_SECRET');
        }
        process.exit(1);
    }
}

// ===== Products File I/O =====

function loadProducts() {
    const content = fs.readFileSync(productsFilePath, 'utf8');
    const match = content.match(/const products = (\[[\s\S]*?\]);/);
    if (match) {
        try {
            return new Function(`return ${match[1]}`)();
        } catch (e) {
            const lines = content.split('\n');
            const products = [];
            let currentProduct = null;
            lines.forEach(line => {
                if (line.includes('id:')) {
                    if (currentProduct) products.push(currentProduct);
                    const idMatch = line.match(/id:\s*['"](.*?)['"]/);
                    currentProduct = idMatch ? { id: idMatch[1] } : null;
                }
                if (currentProduct && line.includes('asin:')) {
                    const asinMatch = line.match(/asin:\s*['"](.*?)['"]/);
                    if (asinMatch) currentProduct.asin = asinMatch[1];
                }
            });
            if (currentProduct) products.push(currentProduct);
            return products;
        }
    }
    return [];
}

function updatePricesJson(newData) {
    let currentPrices = {};
    if (fs.existsSync(pricesFilePath)) {
        currentPrices = JSON.parse(fs.readFileSync(pricesFilePath, 'utf8'));
    }
    const updatedPrices = { ...currentPrices, ...newData };
    fs.writeFileSync(pricesFilePath, JSON.stringify(updatedPrices, null, 2));
    console.log('✅ Updated prices.json');
}

// ===== Creators API Calls =====

async function fetchAmazonData(asins, retries = 3) {
    if (!asins || asins.length === 0) return {};

    const token = await getAccessToken();

    const requestBody = {
        itemIds: asins,
        itemIdType: 'ASIN',
        marketplace: MARKETPLACE,
        partnerTag: ASSOCIATE_TAG,
        partnerType: 'Associates',
        resources: [
            'itemInfo.title',
            'offersV2.listings.price',
            'offersV2.listings.isBuyBoxWinner'
        ]
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.post(`${API_BASE}/getItems`, requestBody, {
                headers: {
                    'Authorization': `Bearer ${token}, Version 2.2`,
                    'Content-Type': 'application/json',
                    'x-marketplace': MARKETPLACE
                }
            });

            const results = {};
            const data = response.data;

            if (data.itemResults && data.itemResults.items) {
                data.itemResults.items.forEach(item => {
                    const asin = item.asin;
                    const listing = item.offersV2?.listings?.find(l => l.isBuyBoxWinner) || item.offersV2?.listings?.[0];

                    if (listing && listing.price) {
                        const currentPrice = listing.price.amount;

                        results[asin] = {
                            current: currentPrice.toFixed(2),
                            original: null,
                            discount: null,
                            lastUpdate: new Date().toISOString()
                        };
                    }
                });
            }

            if (data.errors && data.errors.length > 0) {
                data.errors.forEach(err => {
                    console.warn(`⚠️ Item error: ${err.code || err.Code} - ${err.message || err.Message}`);
                });
            }

            return results;
        } catch (e) {
            const status = e.response?.status;
            const errData = e.response?.data;

            if (status === 429 && attempt < retries) {
                const backoff = Math.pow(2, attempt) * 1000;
                console.warn(`⚠️ Rate limited (attempt ${attempt}/${retries}). Waiting ${backoff / 1000}s...`);
                await sleep(backoff);
                continue;
            }

            if (status === 403) {
                const errMsg = errData?.message || '';
                if (errMsg.includes('eligibility')) {
                    console.error('❌ Account not eligible: You need 10+ qualifying sales in the last 30 days.');
                    console.error('   Check: https://affiliate-program.amazon.ae/');
                    return {};
                }
                console.error('❌ Forbidden:', errMsg);
                return {};
            }

            if (status === 401) {
                console.error('❌ Authentication failed. Token may have expired or credentials are invalid.');
                cachedToken = null;
                tokenExpiry = 0;
                if (attempt < retries) {
                    await sleep(1000);
                    continue;
                }
            }

            console.error(`❌ Error fetching ASINs [${asins.join(', ')}] (attempt ${attempt}/${retries}):`,
                errData || e.message);

            if (attempt === retries) return {};
        }
    }
    return {};
}

// ===== Main Sync =====

async function sync() {
    console.log('🔄 Starting Amazon Creators API Sync...');
    console.log(`📅 ${new Date().toISOString()}`);

    validateCredentials();

    const products = loadProducts();
    const asins = products.filter(p => p.asin).map(p => p.asin);

    if (asins.length === 0) {
        console.log('⚠️ No products with ASIN found in products.js');
        return;
    }

    console.log(`🔎 Syncing ${asins.length} products...`);

    // Batch ASINs in groups of 10 (API limit)
    const batches = chunkArray(asins, 10);
    let allAmazonData = {};

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Batch ${i + 1}/${batches.length}: ${batch.join(', ')}`);

        const batchData = await fetchAmazonData(batch);
        allAmazonData = { ...allAmazonData, ...batchData };

        // Respect rate limits
        if (i < batches.length - 1) {
            await sleep(1100);
        }
    }

    // Map ASIN → product ID
    const priceUpdates = {};
    products.forEach(p => {
        if (p.asin && allAmazonData[p.asin]) {
            priceUpdates[p.id] = allAmazonData[p.asin];
        }
    });

    if (Object.keys(priceUpdates).length > 0) {
        updatePricesJson(priceUpdates);
        console.log(`✅ Sync complete. Updated ${Object.keys(priceUpdates).length}/${asins.length} products.`);
    } else {
        console.log('⚠️ No price updates found. Possible causes:');
        console.log('   - Invalid Creators API credentials');
        console.log('   - Account needs 10+ qualifying sales in last 30 days');
        console.log('   - ASINs no longer available on Amazon.ae');
    }
}

sync();
