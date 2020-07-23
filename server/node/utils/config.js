const { CHECKOUT_APIKEY, MERCHANT_ACCOUNT, BASICAUTH_USER, BASICAUTH_PASS } = process.env;

const API_VERSION = 'v52';
const CHECKOUT_URL = `https://checkout-test.adyen.com/${API_VERSION}`;

module.exports = {
    CHECKOUT_APIKEY,
    CHECKOUT_URL,
    MERCHANT_ACCOUNT,
    BASICAUTH_USER,
    BASICAUTH_PASS
};
