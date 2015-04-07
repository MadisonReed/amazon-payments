var version = '2013-01-01';

exports.offAmazonPayments = offAmazonPayments;

function offAmazonPayments(_super) {
  this._super = _super;
}

offAmazonPayments.prototype.closeAuthorization = function(params, callback) {
  this._super.callMwsMethod('CloseAuthorization', version, params, callback);
};

offAmazonPayments.prototype.getCaptureDetails = function(params, callback) {
  this._super.callMwsMethod('GetCaptureDetails', version, params, callback);
};

offAmazonPayments.prototype.capture = function(params, callback) {
  this._super.callMwsMethod('Capture', version, params, callback);
};

offAmazonPayments.prototype.getAuthorizationDetails = function(params, callback) {
  this._super.callMwsMethod('GetAuthorizationDetails', version, params, callback);
};

offAmazonPayments.prototype.authorize = function(params, callback) {
  this._super.callMwsMethod('Authorize', version, params, callback);
};

offAmazonPayments.prototype.closeOrderReference = function(params, callback) {
  this._super.callMwsMethod('CloseOrderReference', version, params, callback);
};

offAmazonPayments.prototype.cancelOrderReference = function(params, callback) {
  this._super.callMwsMethod('CancelOrderReference', version, params, callback);
};

offAmazonPayments.prototype.confirmOrderReference = function(params, callback) {
  this._super.callMwsMethod('ConfirmOrderReference', version, params, callback);
};

offAmazonPayments.prototype.getOrderReferenceDetails = function(params, callback) {
  this._super.callMwsMethod('GetOrderReferenceDetails', version, params, callback);
};

offAmazonPayments.prototype.setOrderReferenceDetails = function(params, callback) {
  this._super.callMwsMethod('SetOrderReferenceDetails', version, params, callback);
};

offAmazonPayments.prototype.createOrderReferenceForId = function(params, callback) {
  this._super.callMwsMethod('CreateOrderReferenceForId', version, params, callback);
};

offAmazonPayments.prototype.getBillingAgreementDetails = function(params, callback) {
  this._super.callMwsMethod('GetBillingAgreementDetails', version, params, callback);
};

offAmazonPayments.prototype.setBillingAgreementDetails = function(params, callback) {
  this._super.callMwsMethod('SetBillingAgreementDetails', version, params, callback);
};

offAmazonPayments.prototype.validateBillingAgreement = function(params, callback) {
  this._super.callMwsMethod('ValidateBillingAgreement', version, params, callback);
};

offAmazonPayments.prototype.confirmBillingAgreement = function(params, callback) {
  this._super.callMwsMethod('ConfirmBillingAgreement', version, params, callback);
};

offAmazonPayments.prototype.authorizeOnBillingAgreement = function(params, callback) {
  this._super.callMwsMethod('AuthorizeOnBillingAgreement', version, params, callback);
};

offAmazonPayments.prototype.closeBillingAgreement = function(params, callback) {
  this._super.callMwsMethod('CloseBillingAgreement', version, params, callback);
};

offAmazonPayments.prototype.refund = function(params, callback) {
  this._super.callMwsMethod('Refund', version, params, callback);
};

offAmazonPayments.prototype.getRefundDetails = function(params, callback) {
  this._super.callMwsMethod('GetRefundDetails', version, params, callback);
};