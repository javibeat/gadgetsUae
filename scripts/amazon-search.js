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

/**
 * Add a product to products.js
 */
function addProductToJs(product) {
    let content = fs.readFileSync(productsFilePath, 'utf8');

    // Find the products array
    const match = content.match(/const products = (\[[\s\S]*?)(\s*\];)/);
    if (!match) {
        console.error('Could not find products array in products.js');
        return;
    }

    const newProductString = `,\n  {\n    id: '${product.id}',\n    title: '${product.title.replace(/'/g, "\\'")}',\n    category: '${product.category}',\n    image: '${product.image}',\n    price: 'AED ${product.price}',\n    url: '${product.url}',\n    asin: '${product.asin}',\n    gallery: [\n      '${product.image}'\n    ]\n  }`;

    const updatedContent = content.replace(/(\s*\];)/, `${newProductString}$1`);
    fs.writeFileSync(productsFilePath, updatedContent);
    console.log(`✅ Added ${product.title} to products.js`);
}

/**
 * Search products on Amazon
 */
async function searchAmazon(keyword) {
    console.log(`🔎 Searching Amazon for: "${keyword}"...`);

    const requestParameters = {
        Keywords: keyword,
        SearchIndex: 'All',
        ItemCount: 1,
        Resources: [
            'ItemInfo.Title',
            'Offers.Listings.Price',
            'Images.Primary.Large'
        ]
    };

    try {
        const response = await amazonPaapi.SearchItems(commonParameters, requestParameters);

        if (response.SearchResult && response.SearchResult.Items && response.SearchResult.Items.length > 0) {
            const item = response.SearchResult.Items[0];
            const asin = item.ASIN;
            const title = item.ItemInfo.Title.DisplayValue;
            const listing = item.Offers?.Listings?.[0];
            const price = listing ? listing.Price.Amount.toFixed(2) : '0.00';
            const image = item.Images.Primary.Large.URL;
            const url = item.DetailPageURL;

            const product = {
                id: title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30),
                title: title,
                category: 'New Imports',
                image: image,
                price: price,
                url: url,
                asin: asin
            };

            addProductToJs(product);
        } else {
            console.log('❌ No products found.');
        }
    } catch (e) {
        console.error('Error searching Amazon:', e);
    }
}

const args = process.argv.slice(2);
if (args.length > 0) {
    searchAmazon(args.join(' '));
} else {
    console.log('Usage: node scripts/amazon-search.js "product name"');
}
