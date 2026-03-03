require('dotenv').config();
const axios = require('axios');

const config = {
    clientId: process.env.AMAZON_CREATORS_ID,
    clientSecret: process.env.AMAZON_CREATORS_SECRET,
    partnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    marketplace: 'www.amazon.ae'
};

async function testInfluencerType() {
    console.log('🧪 Testing Influencer PartnerType...');
    try {
        const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('scope', 'creatorsapi/default');

        const authResponse = await axios.post('https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authHeader}`
            }
        });

        const token = authResponse.data.access_token;

        console.log(`📡 Trying GetItems with partnerType: 'Influencer'...`);
        const apiResponse = await axios.post('https://creatorsapi.amazon/catalog/v1/getItems', {
            itemIds: ['B0DHMCPG89'],
            itemIdType: 'ASIN',
            partnerTag: config.partnerTag,
            partnerType: 'Influencer', // Testing this variation
            marketplace: config.marketplace,
            resources: ['itemInfo.title']
        }, {
            headers: {
                'Authorization': `Bearer ${token}, Version 2.2`,
                'Content-Type': 'application/json',
                'x-marketplace': config.marketplace
            }
        });

        console.log('🎉 SUCCESS WITH INFLUENCER TYPE!');
    } catch (e) {
        console.log(`❌ FAILED with Influencer type:`, e.response?.data?.reason || e.message);
    }
}

testInfluencerType();
