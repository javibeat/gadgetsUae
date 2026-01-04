require('dotenv').config();
const amazonPaapi = require('amazon-paapi');

const commonParameters = {
    AccessKey: process.env.AMAZON_ACCESS_KEY,
    SecretKey: process.env.AMAZON_SECRET_KEY,
    PartnerTag: process.env.AMAZON_ASSOCIATE_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.ae',
    Host: 'webservices.amazon.ae',
    Region: 'eu-west-1'
};

const requestParameters = {
    ItemIds: ['B0DHX997C8'],
    ItemIdType: 'ASIN',
    Resources: ['ItemInfo.Title', 'Offers.Listings.Price']
};

async function test() {
    console.log('Testing with single ASIN: B0DHX997C8');
    try {
        const response = await amazonPaapi.GetItems(commonParameters, requestParameters);
        console.log('Response:', JSON.stringify(response, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
