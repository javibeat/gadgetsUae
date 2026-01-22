require('dotenv').config();
const axios = require('axios');

const config = {
    clientId: process.env.AMAZON_CREATORS_ID,
    clientSecret: process.env.AMAZON_CREATORS_SECRET
};

const endpoints = [
    'https://api.amazon.com/auth/o2/token',
    'https://api.amazon.co.uk/auth/o2/token',
    'https://api.amazon.de/auth/o2/token'
];

const scopes = [
    'product-advertising-api',
    'advertising::campaign_management',
    'creators::all',
    'associates::all'
];

async function testAuth() {
    console.log('🧪 Starting Authentication Diagnostics...');
    console.log(`ID: ${config.clientId}`);

    for (const url of endpoints) {
        for (const scope of scopes) {
            console.log(`\nTesting EndPoint: ${url}`);
            console.log(`Scope: ${scope}`);

            try {
                const params = new URLSearchParams();
                params.append('grant_type', 'client_credentials');
                params.append('client_id', config.clientId);
                params.append('client_secret', config.clientSecret);
                params.append('scope', scope);

                const response = await axios.post(url, params.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                console.log('✅ SUCCESS!');
                console.log('Token:', response.data.access_token.substring(0, 10) + '...');
                return; // Stop if we find one that works
            } catch (e) {
                console.log(`❌ FAILED: ${e.response?.data?.error || e.message} - ${e.response?.data?.error_description || ''}`);
            }
        }
    }

    console.log('\n--- Testing Basic Auth variant ---');
    const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('scope', 'product-advertising-api');

        const response = await axios.post('https://api.amazon.com/auth/o2/token', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authHeader}`
            }
        });
        console.log('✅ SUCCESS (Basic Auth)!');
    } catch (e) {
        console.log(`❌ Basic Auth FAILED: ${e.response?.data?.error || e.message}`);
    }
}

testAuth();
