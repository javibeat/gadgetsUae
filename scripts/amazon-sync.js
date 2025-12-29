require('dotenv').config();
const fs = require('fs');
const path = require('path');
const amazonPaapi = require('amazon-paapi');

// Configuration
const commonParameters = {
    AccessKey: process.env.AMAZON_ACCESS_KEY,
    SecretKey: process.env.AMAZON_SECRET_KEY,
    PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.ae'
};

const productsFilePath = path.join(__dirname, '../assets/js/products.js');
const pricesFilePath = path.join(__dirname, '../assets/data/prices.json');

/**
 * Load products from assets/js/products.js
 */
function loadProducts() {
    const content = fs.readFileSync(productsFilePath, 'utf8');
    const match = content.match(/const products = (\[[\s\S]*?\]);/);
    if (match) {
        try {
            // Note: In production, consider a cleaner way to store/read data
            // We use a safe eval-like approach here for the array string
            return JSON.parse(match[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":').replace(/,(\s*\])/g, '$1'));
        } catch (e) {
            // If JSON.parse fails due to complex JS objects, use a more basic regex search for IDs/ASINs
            const lines = content.split('\n');
            const products = [];
            let currentProduct = null;

            lines.forEach(line => {
                if (line.includes('id:')) {
                    if (currentProduct) products.push(currentProduct);
                    currentProduct = { id: line.match(/id:\s*['"](.*?)['"]/)[1] };
                }
                if (currentProduct && line.includes('asin:')) {
                    currentProduct.asin = line.match(/asin:\s*['"](.*?)['"]/)[1];
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
 * Fetch items from Amazon
 */
async function fetchAmazonData(asins) {
    if (!asins || asins.length === 0) return {};

    const requestParameters = {
        ItemIds: asins,
        ItemIdType: 'ASIN',
        Resources: [
            'ItemInfo.Title',
            'Offers.Listings.Price'
        ]
    };

    try {
        const response = await amazonPaapi.GetItems(commonParameters, requestParameters);
        const results = {};

        if (response.ItemsResult && response.ItemsResult.Items) {
            response.ItemsResult.Items.forEach(item => {
                const asin = item.ASIN;
                const listing = item.Offers?.Listings?.[0];
                if (listing) {
                    const price = listing.Price;
                    const savings = listing.Price.Savings;

                    results[asin] = {
                        current: price.Amount.toFixed(2),
                        original: savings ? (price.Amount + savings.Amount).toFixed(2) : null,
                        discount: savings ? `-${savings.Percentage}%` : null,
                        lastUpdate: new Date().toISOString()
                    };
                }
            });
        }
        return results;
    } catch (e) {
        console.error('Error fetching from Amazon PA-API:', e);
        return {};
    }
}

/**
 * Main Sync Function
 */
async function sync() {
    console.log('🔄 Starting Amazon Sync...');

    const products = loadProducts();
    const asins = products.filter(p => p.asin).map(p => p.asin);

    if (asins.length === 0) {
        console.log('⚠️ No products with ASIN found in products.js');
        return;
    }

    console.log(`🔎 Syncing ${asins.length} products: ${asins.join(', ')}`);
    const amazonData = await fetchAmazonData(asins);

    // Map ASIN back to product ID
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
        console.log('⚠️ No price updates found. Check ASINs and API credentials.');
    }
}

sync();
