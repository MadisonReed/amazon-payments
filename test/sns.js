const assert = require('assert');

const amazon = require('../lib/amazon.js');

describe('snsResponse', () => {
  describe('parseSNSResponse', () => {
    it('should callback with an error if the certificate is hosted on an invalid host', (done) => {
      const response = {
        Type: 'Notification',
        MessageId: '1',
        TopicArn: 'arn',
        Message: 'A message for you!',
        Timestamp: (new Date()).toISOString(),
        SignatureVersion: '1',
        SigningCertURL: 'https://sns.us-east-1.notamazonaws.com/cert.pem',
        Signature: 'gibberish',
      };
      amazon.parseSNSResponse(response, (err) => {
        assert.ok(err);
        assert.equal(err.name, 'invalid_certificate_domain');
        done();
      });
    });
  });
});
