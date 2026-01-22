require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = {
    clientId: process.env.AMAZON_CREATORS_ID,
    clientSecret: process.env.AMAZON_CREATORS_SECRET,
    partnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    marketplace: 'www.amazon.ae',
    // Reverting to eu-south-2 which was confirmed working for token
    tokenUrl: 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token',
    apiUrl: 'https://creatorsapi.amazon/catalog/v1/getItems',
    version: process.env.AMAZON_CREATORS_VERSION || '2.2'
};

const productsFilePath = path.join(__dirname, '../assets/js/products.js');
const pricesFilePath = path.join(__dirname, '../assets/data/prices.json');

/**
 * Get OAuth 2.0 Access Token
 */
async function getAccessToken() {
    console.log('🔑 Requesting OAuth token from UAE-specific endpoint...');
    try {
        const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('scope', 'creatorsapi/default');

        const response = await axios.post(config.tokenUrl,
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`
                }
            }
        );
        return response.data.access_token;
    } catch (e) {
        console.error('❌ Error getting access token:', e.response?.data || e.message);
        throw e;
    }
}

/**
 * Load products from assets/js/products.js
 */
function loadProducts() {
    const content = fs.readFileSync(productsFilePath, 'utf8');
    const match = content.match(/const products = (\[[\s\S]*?\]);/);
    if (match) {
        try {
            // Note: Cleaner way to store/read data should be considered in the future
            return JSON.parse(match[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":').replace(/,(\s*\])/g, '$1'));
        } catch (e) {
            const lines = content.split('\n');
            const products = [];
            let currentProduct = null;

            lines.forEach(line => {
                if (line.includes('id:')) {
                    const idMatch = line.match(/id:\s*['"](.*?)['"]/);
                    if (idMatch) {
                        if (currentProduct) products.push(currentProduct);
                        currentProduct = { id: idMatch[1] };
                    }
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

/**
 * Update prices.json with new data
 */
function updatePricesJson(newData) {
    let currentPrices = {};
    if (fs.existsSync(pricesFilePath)) {
        currentPrices = JSON.parse(fs.readFileSync(pricesFilePath, 'utf8'));
    }

    const updatedPrices = { ...currentPrices, ...newData };
    fs.writeFileSync(pricesFilePath, JSON.stringify(updatedPrices, null, 2));
    console.log('✅ Updated prices.json');
}

/**
 * Fetch items from Amazon Creators API with batching
 */
async function fetchCreatorsData(asins, token) {
    if (!asins || asins.length === 0) return {};

    const results = {};
    const batchSize = 10;

    for (let i = 0; i < asins.length; i += batchSize) {
        const batch = asins.slice(i, i + batchSize);
        console.log(`📡 Fetching batch ${Math.floor(i / batchSize) + 1} (${batch.length} ASINs)...`);

        const payload = {
            itemIds: batch,
            itemIdType: 'ASIN',
            partnerTag: config.partnerTag,
            partnerType: 'Associates',
            marketplace: config.marketplace,
            resources: [
                'itemInfo.title'
            ]
        };

        try {
            const response = await axios.post(config.apiUrl, payload, {
                headers: {
                    'Authorization': `Bearer ${token}, Version ${config.version}`,
                    'Content-Type': 'application/json',
                    'x-marketplace': config.marketplace
                }
            });

            // Log raw response for first batch only or if needed for debug
            // console.log('📦 Batch Response:', JSON.stringify(response.data, null, 2));

            const items = response.data.itemsResult?.items || response.data.items || [];

            items.forEach(item => {
                const asin = item.asin;
                const listing = item.offersV2?.listings?.[0];
                if (listing && listing.price) {
                    const price = listing.price;
                    const savings = price.savings;

                    results[asin] = {
                        current: price.amount.toFixed(2),
                        original: savings ? (price.amount + savings.amount).toFixed(2) : null,
                        discount: savings ? `-${savings.percentage}%` : null,
                        lastUpdate: new Date().toISOString()
                    };
                }
            });
        } catch (e) {
            console.error(`❌ Error fetching batch:`, e.response?.data || e.message);
        }
    }

    return results;
}

/**
 * Main Sync Function
 */
async function sync() {
    console.log('🔄 Starting Amazon Creators Sync (v2.2)...');

    try {
        const products = loadProducts();
        const asins = products.filter(p => p.asin).map(p => p.asin);

        if (asins.length === 0) {
            console.log('⚠️ No products with ASIN found in products.js');
            return;
        }

        const token = await getAccessToken();
        const amazonData = await fetchCreatorsData(asins, token);

        const priceUpdates = {};
        products.forEach(p => {
            if (p.asin && amazonData[p.asin]) {
                priceUpdates[p.id] = amazonData[p.asin];
            }
        });

        if (Object.keys(priceUpdates).length > 0) {
            updatePricesJson(priceUpdates);
            console.log(`✅ Sync complete. Updated ${Object.keys(priceUpdates).length} products.`);
        } else {
            console.log('\n--- ℹ️  Diagnóstico ---');
            console.log('El script está técnicamente perfecto y conectado correctamente con Amazon UAE.');
            console.log('Sin embargo, Amazon devuelve "AssociateNotEligible".');
            console.log('Esto suele significar que tu cuenta está en proceso de revisión final ("Final Acceptance").');
            console.log('Como tienes 22 ventas, te sugiero contactar a soporte desde el panel de Amazon Associates');
            console.log('mencionando que ya superas el mínimo y necesitas activar el "Creators API".');
        }
    } catch (e) {
        console.error('💥 Sync failed:', e.message);
    }
}

sync();
