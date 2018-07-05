const version = '2009-01-01';

exports.Reports = Reports;

function Reports(_super) {
  this._super = _super;
}

Reports.prototype.requestReport = function (params, callback) {
  this._super.callMwsMethod('RequestReport', version, params, callback);
};

Reports.prototype.getReportRequestList = function (params, callback) {
  this._super.callMwsMethod('GetReportRequestList', version, params, callback);
};

Reports.prototype.getReportRequestListByNextToken = function (params, callback) {
  this._super.callMwsMethod('GetReportRequestListByNextToken', version, params, callback);
};

Reports.prototype.getReportRequestCount = function (params, callback) {
  this._super.callMwsMethod('GetReportRequestCount', version, params, callback);
};

Reports.prototype.cancelReportRequests = function (params, callback) {
  this._super.callMwsMethod('CancelReportRequests', version, params, callback);
};

Reports.prototype.getReportList = function (params, callback) {
  this._super.callMwsMethod('GetReportList', version, params, callback);
};

Reports.prototype.getReportListByNextToken = function (params, callback) {
  this._super.callMwsMethod('GetReportListByNextToken', version, params, callback);
};

Reports.prototype.getReportCount = function (params, callback) {
  this._super.callMwsMethod('GetReportCount', version, params, callback);
};

Reports.prototype.getReport = function (params, callback) {
  this._super.callMwsMethod('GetReport', version, params, callback);
};

Reports.prototype.manageReportSchedule = function (params, callback) {
  this._super.callMwsMethod('ManageReportSchedule', version, params, callback);
};

Reports.prototype.getReportScheduleList = function (params, callback) {
  this._super.callMwsMethod('GetReportScheduleList', version, params, callback);
};

Reports.prototype.getReportScheduleListByNextToken = function (params, callback) {
  this._super.callMwsMethod('GetReportScheduleListByNextToken', version, params, callback);
};

Reports.prototype.getReportScheduleCount = function (params, callback) {
  this._super.callMwsMethod('GetReportScheduleCount', version, params, callback);
};

Reports.prototype.updateReportAcknowledgements = function (params, callback) {
  this._super.callMwsMethod('UpdateReportAcknowledgements', version, params, callback);
};
