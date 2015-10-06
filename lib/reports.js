var version = '2009-01-01';

exports.reports = reports;

function reports(_super) {
  this._super = _super;
}

reports.prototype.requestReport = function(params, callback) {
  this._super.callMwsMethod('RequestReport', version, params, callback);
};

reports.prototype.getReportRequestList = function(params, callback) {
  this._super.callMwsMethod('GetReportRequestList', version, params, callback);
};

reports.prototype.getReportRequestListByNextToken = function(params, callback) {
  this._super.callMwsMethod('GetReportRequestListByNextToken', version, params, callback);
};

reports.prototype.getReportRequestCount = function(params, callback) {
  this._super.callMwsMethod('GetReportRequestCount', version, params, callback);
};

reports.prototype.cancelReportRequests = function(params, callback) {
  this._super.callMwsMethod('CancelReportRequests', version, params, callback);
};

reports.prototype.getReportList = function(params, callback) {
  this._super.callMwsMethod('GetReportList', version, params, callback);
};

reports.prototype.getReportListByNextToken = function(params, callback) {
  this._super.callMwsMethod('GetReportListByNextToken', version, params, callback);
};

reports.prototype.getReportCount = function(params, callback) {
  this._super.callMwsMethod('GetReportCount', version, params, callback);
};

reports.prototype.getReport = function(params, callback) {
  this._super.callMwsMethod('GetReport', version, params, callback);
};

reports.prototype.manageReportSchedule = function(params, callback) {
  this._super.callMwsMethod('ManageReportSchedule', version, params, callback);
};

reports.prototype.getReportScheduleList = function(params, callback) {
  this._super.callMwsMethod('GetReportScheduleList', version, params, callback);
};

reports.prototype.getReportScheduleListByNextToken = function(params, callback) {
  this._super.callMwsMethod('GetReportScheduleListByNextToken', version, params, callback);
};

reports.prototype.getReportScheduleCount = function(params, callback) {
  this._super.callMwsMethod('GetReportScheduleCount', version, params, callback);
};

reports.prototype.updateReportAcknowledgements = function(params, callback) {
  this._super.callMwsMethod('UpdateReportAcknowledgements', version, params, callback);
};

