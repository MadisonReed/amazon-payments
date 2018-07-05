const assert = require('assert');
const amazonPayments = require('../amazonPayments.js');

const amazonReports = amazonPayments.connect({
  environment: amazonPayments.Environment.Sandbox.Reports,
  sellerId: process.env.AMAZON_SELLER_ID,
  mwsAccessKey: process.env.AMAZON_MWS_ACCESS_KEY,
  mwsSecretKey: process.env.AMAZON_MWS_SECRET_KEY,
  clientId: process.env.AMAZON_CLIENT_ID,
}).reports;

const describeOrSkip = process.env.AMAZON_MWS_ACCESS_KEY != null ? describe : describe.skip;
describeOrSkip('reports', () => {
  let reportRequestId;
  describe('requestReport', () => {
    it('should not return null', (done) => {
      amazonReports.requestReport({ ReportType: '_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_' }, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.ReportRequestInfo.ReportProcessingStatus === '_SUBMITTED_');
        assert.ok(result.ReportRequestInfo.ReportRequestId !== undefined);
        reportRequestId = result.ReportRequestInfo.ReportRequestId;
        done();
      });
    });
  });

  let reportRequestListNextToken;
  describe('getReportRequestList', () => {
    it('should not return null', (done) => {
      amazonReports.getReportRequestList({}, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.ReportRequestInfo.length >= 0);
        assert.ok(result.HasNext === 'true');
        assert.ok(result.NextToken !== undefined);
        reportRequestListNextToken = result.NextToken;
        done();
      });
    });
  });

  describe('getReportRequestListByNextToken', () => {
    it('should not return null', (done) => {
      if (reportRequestListNextToken !== undefined) {
        amazonReports.getReportRequestListByNextToken({
          NextToken: reportRequestListNextToken,
        }, (err, result) => {
          if (err) {
            throw new Error(err);
          }

          console.log(result);
          assert.ok(result !== undefined);
          assert.ok(result.ReportRequestInfo.length >= 0);
          done();
        });
      } else {
        throw new Error('test fails');
      }
    });
  });

  describe('getReportRequestCount', () => {
    it('should not return null', (done) => {
      amazonReports.getReportRequestCount({}, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

  describe('cancelReportRequests', () => {
    it('should not return null', function (done) {
      this.timeout(5000);
      amazonReports.cancelReportRequests({ ReportRequestId: reportRequestId }, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.ReportRequestInfo.length >= 0);
        done();
      });
    });
  });

  let reportListNextToken;
  let reportId;
  describe('getReportList', () => {
    it('should not return null', (done) => {
      amazonReports.getReportList({}, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.ReportInfo.length >= 0);
        assert.ok(result.HasNext === 'true');
        reportListNextToken = result.NextToken;
        reportId = result.ReportInfo[0].ReportId;
        done();
      });
    });
  });

  describe('getReportListByNextToken', () => {
    it('should not return null', (done) => {
      if (reportListNextToken !== undefined) {
        amazonReports.getReportListByNextToken({
          NextToken: reportListNextToken,
        }, (err, result) => {
          if (err) {
            throw new Error(err);
          }

          console.log(result);
          assert.ok(result !== undefined);
          assert.ok(result.ReportInfo.length >= 0);
          done();
        });
      } else {
        console.log('No NextToken available');
        done();
      }
    });
  });

  describe('getReportCount', () => {
    it('should not return null', (done) => {
      amazonReports.getReportCount({}, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

  describe('getReport', () => {
    it('should not return null', (done) => {
      amazonReports.getReport({ ReportId: reportId }, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.Response !== undefined);
        done();
      });
    });
  });

  describe('manageReportSchedule', () => {
    it('should not return null', (done) => {
      amazonReports.manageReportSchedule({ ReportType: '_GET_SELLER_FEEDBACK_DATA_', Schedule: '_NEVER_' }, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

  let reportScheduleListNextToken;
  describe('getReportScheduleList', () => {
    it('should not return null', (done) => {
      amazonReports.getReportScheduleList({}, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.ReportSchedule.length >= 0);
        reportScheduleListNextToken = result.NextToken;
        done();
      });
    });
  });

  describe('getReportScheduleListByNextToken', () => {
    it('should not return null', (done) => {
      if (reportScheduleListNextToken !== undefined) {
        amazonReports.getReportScheduleListByNextToken({
          NextToken: reportScheduleListNextToken,
        }, (err, result) => {
          if (err) {
            throw new Error(err);
          }

          console.log(result);
          assert.ok(result !== undefined);
          assert.ok(result.ReportRequestInfo.length >= 0);
          done();
        });
      } else {
        console.log('No NextToken available');
        done();
      }
    });
  });

  describe('getReportScheduleCount', () => {
    it('should not return null', (done) => {
      amazonReports.getReportScheduleCount({}, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });

  describe('updateReportAcknowledgements', () => {
    it('should not return null', (done) => {
      amazonReports.updateReportAcknowledgements({ 'ReportIdList.Id.1': reportId, Acknowledged: false }, (err, result) => {
        if (err) {
          throw new Error(err);
        }

        console.log(result);
        assert.ok(result !== undefined);
        assert.ok(result.Count >= 0);
        done();
      });
    });
  });
});
