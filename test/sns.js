var assert = require('assert');

var amazon = require('../lib/amazon.js');

describe('snsResponse', function() {
  describe('parseSNSResponse', function() {
    it('should callback with an error if the certificate is hosted on an invalid host', function(done) {
      var response = {
        Type: 'Notification',
        MessageId: '1',
        TopicArn: 'arn',
        Message: 'A message for you!',
        Timestamp: (new Date()).toISOString(),
        SignatureVersion: '1',
        SigningCertURL: 'https://sns.us-east-1.notamazonaws.com/cert.pem',
        Signature: 'gibberish'
      };
      amazon.parseSNSResponse(response, function(err, parsed) {
        assert.ok(err);
        assert.equal(err.name, 'invalid_certificate_domain');
        done();
      });
    });
  });
});