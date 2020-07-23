const { CHECKOUT_APIKEY, CHECKOUT_URL, MERCHANT_ACCOUNT, BASICAUTH_USER, BASICAUTH_PASS } = require('./config');

global.Buffer = global.Buffer || require('buffer').Buffer;

if (typeof btoa === 'undefined') {
  global.btoa = function (str) {
    return new Buffer(str, 'binary').toString('base64');
  };
}

if (typeof atob === 'undefined') {
  global.atob = function (b64Encoded) {
    return new Buffer(b64Encoded, 'base64').toString('binary');
  };
}

module.exports = (endpoint, request) => {
    const body = JSON.stringify({
        merchantAccount: MERCHANT_ACCOUNT,
        ...request
    });

    return {
        body,
        url: `${CHECKOUT_URL}/${endpoint}`,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + global.btoa(BASICAUTH_USER + ":" + BASICAUTH_PASS),
            'Content-Length': Buffer.byteLength(body, 'utf8'),
            'X-Api-Key': CHECKOUT_APIKEY
        }
    };
};
