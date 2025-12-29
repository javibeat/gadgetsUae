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

// Categories to monitor (Professional selection)
const CATEGORIES = [
    { name: 'Consolas y Videojuegos', keyword: 'gaming console Nintendo PlayStation Xbox' },
    { name: 'Móviles y Smartphones', keyword: 'iPhone Samsung phone' },
    { name: 'Audio y Sonido', keyword: 'headphones Echo speaker' },
    { name: 'Informática y Laptops', keyword: 'laptop MacBook Monitor' },
    { name: 'Hogar Inteligente', keyword: 'smart home gadget vacuum' },
    { name: 'Kindle & E-Readers', keyword: 'Kindle E-reader' }
];

function loadProducts() {
    if (!fs.existsSync(productsFilePath)) return [];
    try {
        const content = fs.readFileSync(productsFilePath, 'utf8');
        const match = content.match(/const products = (\[[\s\S]*?\]);/);
        // We use a safe eval-like approach or just parse the JS object
        // In this case, since it's a known format, we'll use a slightly safer regex/JSON path if possible
        // but for a JS file, eval() is often used in these scripts (or we can use JSON.parse with cleanup)
        if (!match) return [];

        // Cleanup JS to make it JSON-like enough for a basic parse if eval is risky
        const jsObj = match[1];
        // For simplicity in this environment, we'll use a function constructor to stay safe
        return new Function(`return ${jsObj}`)();
    } catch (e) {
        console.error('Error loading products:', e.message);
        return [];
    }
}

function saveProducts(products) {
    // Keep the list manageable but professional (e.g. 12 per category = ~72 products)
    const productsString = JSON.stringify(products, null, 4)
        .replace(/"(\w+)":/g, '$1:')
        .replace(/"/g, "'");

    const content = `const products = ${productsString};\n\nwindow.products = products;`;
    fs.writeFileSync(productsFilePath, content);
}

async function discoverForCategory(category) {
    console.log(`🔎 Discovering items for: ${category.name}...`);

    const requestParameters = {
        Keywords: category.keyword,
        SearchIndex: 'All',
        ItemCount: 10, // Max per request
        Resources: [
            'ItemInfo.Title',
            'Offers.Listings.Price',
            'Offers.Listings.SavingBasis',
            'Images.Primary.Large',
            'Images.Variants.Large'
        ]
    };

    try {
        const response = await amazonPaapi.SearchItems(commonParameters, requestParameters);
        if (response.SearchResult && response.SearchResult.Items) {
            return response.SearchResult.Items.map(item => {
                const listing = item.Offers?.Listings?.[0];
                const price = listing?.Price?.Amount || 0;
                const original = listing?.SavingBasis?.Amount || price;
                const discount = original > price ? `-${Math.round((1 - price / original) * 100)}%` : null;

                return {
                    id: item.ASIN.toLowerCase(),
                    title: item.ItemInfo.Title.DisplayValue,
                    category: category.name,
                    image: item.Images.Primary.Large.URL,
                    price: price ? `AED ${price.toFixed(2)}` : 'Check Price',
                    original: original > price ? `AED ${original.toFixed(2)}` : null,
                    discount: discount,
                    asin: item.ASIN,
                    url: item.DetailPageURL,
                    gallery: [
                        item.Images.Primary.Large.URL,
                        ...(item.Images.Variants?.slice(0, 4).map(v => v.Large?.URL) || [])
                    ].filter(Boolean)
                };
            });
        }
    } catch (e) {
        console.error(`Error in ${category.name}:`, e.message);
    }
    return [];
}

async function startDiscovery() {
    console.log('🚀 Starting Professional Product Discovery & Rotation...');

    let allNewProducts = [];
    for (const cat of CATEGORIES) {
        const found = await discoverForCategory(cat);
        allNewProducts = [...allNewProducts, ...found];
    }

    if (allNewProducts.length === 0) {
        console.log('⚠️ No new products found to rotate.');
        return;
    }

    // Keep unique by ASIN
    const existingProducts = loadProducts();
    const existingAsins = new Set(existingProducts.map(p => p.asin));

    const uniqueNewProducts = allNewProducts.filter(p => !existingAsins.has(p.asin));

    // Rotation: Keep top 12 per category from the pool
    const combined = [...uniqueNewProducts, ...existingProducts];
    const rotated = [];
    const seenAsins = new Set();

    for (const cat of CATEGORIES) {
        const catProducts = combined
            .filter(p => p.category === cat.name)
            .slice(0, 12); // Get up to 12 best items

        catProducts.forEach(p => {
            if (!seenAsins.has(p.asin)) {
                rotated.push(p);
                seenAsins.add(p.asin);
            }
        });
    }

    saveProducts(rotated);
    console.log(`✅ Discovery complete. Total products: ${rotated.length}`);
}

startDiscovery();
