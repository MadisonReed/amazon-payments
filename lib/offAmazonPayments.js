const version = '2013-01-01';

exports.OffAmazonPayments = OffAmazonPayments;

function OffAmazonPayments(_super) {
  this._super = _super;
}

OffAmazonPayments.prototype.closeAuthorization = function (params, callback) {
  this._super.callMwsMethod('CloseAuthorization', version, params, callback);
};

OffAmazonPayments.prototype.getCaptureDetails = function (params, callback) {
  this._super.callMwsMethod('GetCaptureDetails', version, params, callback);
};

OffAmazonPayments.prototype.capture = function (params, callback) {
  this._super.callMwsMethod('Capture', version, params, callback);
};

OffAmazonPayments.prototype.getAuthorizationDetails = function (params, callback) {
  this._super.callMwsMethod('GetAuthorizationDetails', version, params, callback);
};

OffAmazonPayments.prototype.authorize = function (params, callback) {
  this._super.callMwsMethod('Authorize', version, params, callback);
};

OffAmazonPayments.prototype.closeOrderReference = function (params, callback) {
  this._super.callMwsMethod('CloseOrderReference', version, params, callback);
};

OffAmazonPayments.prototype.cancelOrderReference = function (params, callback) {
  this._super.callMwsMethod('CancelOrderReference', version, params, callback);
};

OffAmazonPayments.prototype.confirmOrderReference = function (params, callback) {
  this._super.callMwsMethod('ConfirmOrderReference', version, params, callback);
};

OffAmazonPayments.prototype.getOrderReferenceDetails = function (params, callback) {
  this._super.callMwsMethod('GetOrderReferenceDetails', version, params, callback);
};

OffAmazonPayments.prototype.setOrderReferenceDetails = function (params, callback) {
  this._super.callMwsMethod('SetOrderReferenceDetails', version, params, callback);
};

OffAmazonPayments.prototype.setOrderAttributes = function (params, callback) {
  this._super.callMwsMethod('SetOrderAttributes', version, params, callback);
};

OffAmazonPayments.prototype.createOrderReferenceForId = function (params, callback) {
  this._super.callMwsMethod('CreateOrderReferenceForId', version, params, callback);
};

OffAmazonPayments.prototype.getBillingAgreementDetails = function (params, callback) {
  this._super.callMwsMethod('GetBillingAgreementDetails', version, params, callback);
};

OffAmazonPayments.prototype.setBillingAgreementDetails = function (params, callback) {
  this._super.callMwsMethod('SetBillingAgreementDetails', version, params, callback);
};

OffAmazonPayments.prototype.validateBillingAgreement = function (params, callback) {
  this._super.callMwsMethod('ValidateBillingAgreement', version, params, callback);
};

OffAmazonPayments.prototype.confirmBillingAgreement = function (params, callback) {
  this._super.callMwsMethod('ConfirmBillingAgreement', version, params, callback);
};

OffAmazonPayments.prototype.authorizeOnBillingAgreement = function (params, callback) {
  this._super.callMwsMethod('AuthorizeOnBillingAgreement', version, params, callback);
};

OffAmazonPayments.prototype.closeBillingAgreement = function (params, callback) {
  this._super.callMwsMethod('CloseBillingAgreement', version, params, callback);
};

OffAmazonPayments.prototype.refund = function (params, callback) {
  this._super.callMwsMethod('Refund', version, params, callback);
};

OffAmazonPayments.prototype.getRefundDetails = function (params, callback) {
  this._super.callMwsMethod('GetRefundDetails', version, params, callback);
};
