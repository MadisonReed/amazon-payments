exports.Sandbox = new Environment('https://mws.amazonservices.com/OffAmazonPayments_Sandbox/2013-01-01', 'https://api.sandbox.amazon.com');
exports.Production = new Environment('https://mws.amazonservices.com/OffAmazonPayments/2013-01-01', 'https://api.amazon.com');

function Environment(mwsEndpoint, apiEndpoint) {
  this.mwsEndpoint = mwsEndpoint;
  this.apiEndpoint = apiEndpoint;
}
