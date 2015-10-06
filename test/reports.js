var assert = require('assert');
var amazonPayments = require('../amazonPayments.js');

var amazonReports = amazonPayments.connect({
  environment: amazonPayments.Environment.Sandbox.Reports,
  sellerId: process.env.AMAZON_SELLER_ID,
  mwsAccessKey: process.env.AMAZON_MWS_ACCESS_KEY,
  mwsSecretKey: process.env.AMAZON_MWS_SECRET_KEY,
  clientId: process.env.AMAZON_CLIENT_ID
}).reports;

var describeOrSkip = process.env.AMAZON_MWS_ACCESS_KEY != null ? describe : describe.skip;
describeOrSkip('reports', function () {

  var reportRequestId = undefined;
  describe('requestReport', function () {
    it('should not return null', function (done) {
      amazonReports.requestReport({"ReportType" : '_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_'}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.ReportRequestInfo.ReportProcessingStatus === '_SUBMITTED_');
        assert.ok(result.ReportRequestInfo.ReportRequestId != undefined);
        reportRequestId = result.ReportRequestInfo.ReportRequestId;
        done();
      });
    });
  });

  var reportRequestListNextToken = undefined;
  describe('getReportRequestList', function () {
    it('should not return null', function (done) {
      amazonReports.getReportRequestList({}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.ReportRequestInfo.length >= 0);
        assert.ok(result.HasNext == 'true');
        assert.ok(result.NextToken != undefined);
        reportRequestListNextToken = result.NextToken;
        done();
      });
    });
  });

  describe('getReportRequestListByNextToken', function () {
    it('should not return null', function (done) {
      if (reportRequestListNextToken != undefined) {
        amazonReports.getReportRequestListByNextToken({"NextToken": reportRequestListNextToken}, function (err, result) {
          if (err) {
            throw new Error(err);
          }

          console.log(result);
          assert.ok(result != undefined);
          assert.ok(result.ReportRequestInfo.length >= 0);
          done();
        });
      } else {

      }
    });
  });

  describe('getReportRequestCount', function () {
    it('should not return null', function (done) {
      amazonReports.getReportRequestCount({}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

  describe('cancelReportRequests', function () {
    it('should not return null', function (done) {
      this.timeout(5000);
      amazonReports.cancelReportRequests({ "ReportRequestId": reportRequestId}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.ReportRequestInfo.length >= 0);
        done();
      });
    });
  });

  var reportListNextToken = undefined;
  var reportId = undefined;
  describe('getReportList', function () {
    it('should not return null', function (done) {
      amazonReports.getReportList({}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.ReportInfo.length >= 0);
        assert.ok(result.HasNext == 'true');
        reportListNextToken = result.NextToken;
        reportId = result.ReportInfo[0].ReportId;
        done();
      });
    });
  });

  describe('getReportListByNextToken', function () {
    it('should not return null', function (done) {
      if (reportListNextToken != undefined) {
        amazonReports.getReportListByNextToken({"NextToken": reportListNextToken}, function (err, result) {
          if (err) {
            throw new Error(err);
          }

          console.log(result);
          assert.ok(result != undefined);
          assert.ok(result.ReportInfo.length >= 0);
          done();
        });
      } else {
        console.log("No NextToken available");
        done();
      }
    });
  });

  describe('getReportCount', function () {
    it('should not return null', function (done) {
      amazonReports.getReportCount({}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

  describe('getReport', function () {
    it('should not return null', function (done) {
      amazonReports.getReport({"ReportId": reportId}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.Response != undefined);
        done();
      });
    });
  });

  describe('manageReportSchedule', function () {
    it('should not return null', function (done) {
      amazonReports.manageReportSchedule({"ReportType":"_GET_SELLER_FEEDBACK_DATA_","Schedule":"_NEVER_" }, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

  var reportScheduleListNextToken = undefined;
  describe('getReportScheduleList', function () {
    it('should not return null', function (done) {
      amazonReports.getReportScheduleList({}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.ReportSchedule.length >= 0);
        reportScheduleListNextToken = result.NextToken;
        done();
      });
    });
  });

  describe('getReportScheduleListByNextToken', function () {
    it('should not return null', function (done) {
      if (reportScheduleListNextToken != undefined) {
        amazonReports.getReportScheduleListByNextToken({"NextToken": reportScheduleListNextToken}, function (err, result) {
          if (err) {
            throw new Error(err);
          }

          console.log(result);
          assert.ok(result != undefined);
          assert.ok(result.ReportRequestInfo.length >= 0);
          done();
        });
      } else {
        console.log("No NextToken available");
        done();
      }
    });
  });

  describe('getReportScheduleCount', function () {
    it('should not return null', function (done) {
      amazonReports.getReportScheduleCount({}, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

  describe('updateReportAcknowledgements', function () {
    it('should not return null', function (done) {
      amazonReports.updateReportAcknowledgements({"ReportIdList.Id.1" : reportId, "Acknowledged":false }, function (err, result) {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result != undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

});