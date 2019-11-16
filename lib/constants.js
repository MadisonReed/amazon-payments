
'use strict';

module.exports = {
    VERSION: '2.0.0-alpha',
    AGENT: 'madisonreed-amazon-payments',
    RETRIES: 3,
    REGION_MAP: {
        na: 'pay-api.amazon.com',
        eu: 'pay-api.amazon.eu',
        jp: 'pay-api.amazon.jp'
    },
    AMAZON_SIGNATURE_ALGORITHM: 'AMZN-PAY-RSASSA-PSS'
};