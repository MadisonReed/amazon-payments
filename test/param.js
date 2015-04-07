var assert = require('assert');

var amazon = require('../lib/amazon.js');

describe('param composition', function() {
  describe('composeParams', function() {
    it('should not change a one-dimension object', function() {
      var params = {
        test1: 'test1Val',
        test2: 'test2Val'
      };
      var newParams = amazon.composeParams(params);
      assert.equal(newParams.test1, params.test1);
      assert.equal(newParams.test2, params.test2);
      assert.equal(Object.keys(newParams).length, 2);
    });

    it('should convert multi-dimensional objects to dot notation', function() {
      var params = {
        test1: 'test1Val',
        test2: {
          test3: 'test3Val',
          test4: 'test4Val'
        },
        test5: 'test5Val'
      };

      var newParams = amazon.composeParams(params);
      assert.equal(newParams.test1, params.test1);
      assert.equal(newParams['test2.test3'], params.test2.test3);
      assert.equal(newParams['test2.test4'], params.test2.test4);
      assert.equal(Object.keys(newParams).length, 4);
    });
  });

  describe('attachSignature', function() {
    it('should compose and attach a signature based on a given secret key', function() {
      var url = 'https://mws.amazonservices.com/OffAmazonPayments_Sandbox';
      var secret = 'thisIsMySuperSecretKey';
      var params = {
        test1: 'test1Val',
        test2: 'test2Val'
      };
      var sigParams = amazon.attachSignature(url, secret, params);
      assert.equal(sigParams.test1, params.test1);
      assert.equal(sigParams.test2, params.test2);
      assert.equal(sigParams.SignatureMethod, 'HmacSHA256');
      assert.equal(sigParams.SignatureVersion, 2);
      assert.equal(sigParams.Signature, 'r/Iae1ZvKIT+v3RqxAH0Fv5bK4KxOCf1jp0tJIBx5Mk=');
      assert.equal(Object.keys(sigParams).length, 5);
    });
  });
});