/**
 * Amazon Payments Environments
 * @type {Environment}
 */
exports.Sandbox = new Environment('https://mws.amazonservices.com/OffAmazonPayments_Sandbox/2013-01-01', 'https://api.sandbox.amazon.com');
exports.Production = new Environment('https://mws.amazonservices.com/OffAmazonPayments/2013-01-01', 'https://api.amazon.com');
exports.SandboxEU = new Environment('https://mws-eu.amazonservices.com/OffAmazonPayments_Sandbox/2013-01-01/', 'https://api.sandbox.amazon.com');
exports.ProductionEU = new Environment('https://mws-eu.amazonservices.com/OffAmazonPayments/2013-01-01', 'https://api.amazon.com');

/**
 * Amazon Reports Environments
 * @type {Environment}
 */
exports.Sandbox.Reports = new Environment('https://mws.amazonservices.com/', 'https://api.sandbox.amazon.com');
exports.Production.Reports = new Environment('https://mws.amazonservices.com/', 'https://api.amazon.com');
exports.SandboxEU.Reports = new Environment('https://mws-eu.amazonservices.com/', 'https://api.sandbox.amazon.com');
exports.ProductionEU.Reports = new Environment('https://mws-eu.amazonservices.com/', 'https://api.amazon.com');

/**
 * Amazon Notifications Environments
 * @type {Environment}
 */
exports.Sandbox.Notifications = new Environment('', 'https://pay-api.amazon.com/live/v1/deliveryTrackers');
exports.Production.Notifications = new Environment('', 'https://pay-api.amazon.com/live/v1/deliveryTrackers');
exports.SandboxEU.Notifications = new Environment('', 'https://pay-api.amazon.eu/live/v1/deliveryTrackers');
exports.ProductionEU.Notifications = new Environment('', 'https://pay-api.amazon.eu/live/v1/deliveryTrackers');

function Environment(mwsEndpoint, apiEndpoint) {
  this.mwsEndpoint = mwsEndpoint;
  this.apiEndpoint = apiEndpoint;
}

