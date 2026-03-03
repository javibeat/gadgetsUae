require('dotenv').config();
const axios = require('axios');

const config = {
    clientId: process.env.AMAZON_CREATORS_ID,
    clientSecret: process.env.AMAZON_CREATORS_SECRET,
    partnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    marketplace: 'www.amazon.ae'
};

const tokenEndpoints = [
    { name: 'EU-West-1 (Ireland/UAE standard)', url: 'https://creatorsapi.auth.eu-west-1.amazoncognito.com/oauth2/token' },
    { name: 'EU-Central-1 (Frankfurt)', url: 'https://creatorsapi.auth.eu-central-1.amazoncognito.com/oauth2/token' },
    { name: 'EU-South-2 (Spain)', url: 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token' }
];

async function runDiagnostic() {
    console.log('🧪 UAE-Specific Creators API Diagnostic...');

    for (const endpoint of tokenEndpoints) {
        console.log(`\n--- Testing ${endpoint.name} ---`);
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

            console.log(`✅ Token from ${endpoint.name} OK!`);
            const token = response.data.access_token;

            console.log(`📡 Call GetItems with ${endpoint.name} token...`);
            const apiResponse = await axios.post('https://creatorsapi.amazon/catalog/v1/getItems', {
                itemIds: ['B0DHMCPG89'],
                itemIdType: 'ASIN',
                partnerTag: config.partnerTag,
                partnerType: 'Associates',
                marketplace: config.marketplace,
                resources: ['itemInfo.title', 'offersV2.listings.price']
            }, {
                headers: {
                    'Authorization': `Bearer ${token}, Version 2.2`,
                    'Content-Type': 'application/json',
                    'x-marketplace': config.marketplace
                }
            });

            console.log('🎉 SUCCESS!');
            return;
        } catch (e) {
            console.log(`❌ FAILED at ${endpoint.name}:`, e.response?.data?.reason || e.message);
        }
    }
}

runDiagnostic();
