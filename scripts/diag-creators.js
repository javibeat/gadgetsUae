require('dotenv').config();
const axios = require('axios');

const config = {
    clientId: process.env.AMAZON_CREATORS_ID,
    clientSecret: process.env.AMAZON_CREATORS_SECRET,
    partnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    marketplace: 'www.amazon.ae'
};

const tokenEndpoints = [
    { name: 'EU (London)', url: 'https://creatorsapi.auth.eu-west-2.amazoncognito.com/oauth2/token' },
    { name: 'EU (Spain)', url: 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token' },
    { name: 'NA (US)', url: 'https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token' }
];

async function runDiagnostic() {
    console.log('🧪 Creators API Deep Diagnostic (UAE)...');
    console.log(`Partner Tag: ${config.partnerTag}`);
    console.log(`Client ID: ${config.clientId.substring(0, 10)}...`);

    for (const endpoint of tokenEndpoints) {
        console.log(`\n--- Testing OAuth Region: ${endpoint.name} ---`);
        try {
            const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('scope', 'creatorsapi/default');

            const response = await axios.post(endpoint.url, params.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${authHeader}`
                }
            });

            console.log(`✅ Token obtained from ${endpoint.name}!`);
            const token = response.data.access_token;

            // Now test a simple GetItems call
            console.log(`📡 Testing GetItems call for UAE with token from ${endpoint.name}...`);
            const payload = {
                itemIds: ['B0DHMCPG89'], // Example ASIN from products.js (Kindle Colorsoft)
                itemIdType: 'ASIN',
                partnerTag: config.partnerTag,
                partnerType: 'Associates',
                marketplace: config.marketplace,
                resources: ['itemInfo.title', 'offersV2.listings.price']
            };

            const apiResponse = await axios.post('https://creatorsapi.amazon/catalog/v1/getItems', payload, {
                headers: {
                    'Authorization': `Bearer ${token}, Version 2.2`,
                    'Content-Type': 'application/json',
                    'x-marketplace': config.marketplace
                }
            });

            console.log('🎉 API CALL SUCCESS!');
            console.log('Data:', JSON.stringify(apiResponse.data, null, 2));
            return;

        } catch (e) {
            const errData = e.response?.data;
            console.log(`❌ FAILED at ${endpoint.name}:`, errData || e.message);
            if (errData && errData.type === 'AccessDeniedException') {
                console.log('   Reason:', errData.reason);
            }
        }
    }
}

runDiagnostic();
