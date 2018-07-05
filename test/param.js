const assert = require('assert');

const amazon = require('../lib/amazon.js');

describe('param composition', () => {
  describe('composeParams', () => {
    it('should not change a one-dimension object', () => {
      const params = {
        test1: 'test1Val',
        test2: 'test2Val',
      };
      const newParams = amazon.composeParams(params);
      assert.equal(newParams.test1, params.test1);
      assert.equal(newParams.test2, params.test2);
      assert.equal(Object.keys(newParams).length, 2);
    });

    it('should convert multi-dimensional objects to dot notation', () => {
      const params = {
        test1: 'test1Val',
        test2: {
          test3: 'test3Val',
          test4: 'test4Val',
        },
        test5: 'test5Val',
      };

      const newParams = amazon.composeParams(params);
      assert.equal(newParams.test1, params.test1);
      assert.equal(newParams['test2.test3'], params.test2.test3);
      assert.equal(newParams['test2.test4'], params.test2.test4);
      assert.equal(Object.keys(newParams).length, 4);
    });
  });

  describe('attachSignature', () => {
    it('should compose and attach a signature based on a given secret key', () => {
      const url = 'https://mws.amazonservices.com/OffAmazonPayments_Sandbox';
      const secret = 'thisIsMySuperSecretKey';
      const params = {
        test1: 'test1Val',
        test2: 'test2Val',
      };
      const sigParams = amazon.attachSignature(url, secret, params);
      assert.equal(sigParams.test1, params.test1);
      assert.equal(sigParams.test2, params.test2);
      assert.equal(sigParams.SignatureMethod, 'HmacSHA256');
      assert.equal(sigParams.SignatureVersion, 2);
      assert.equal(sigParams.Signature, 'r/Iae1ZvKIT+v3RqxAH0Fv5bK4KxOCf1jp0tJIBx5Mk=');
      assert.equal(Object.keys(sigParams).length, 5);
    });

    it('should correctly escape special characters', () => {
      const url = 'https://mws.amazonservices.com/OffAmazonPayments_Sandbox';
      const secret = 'thisIsMySuperSecretKey';
      const params = {
        test1: 'value * with non-alpha numeric special characters (like parenthesis, {braces}, [brackets], or others: ~`!@#$%^&*_+<>?:)',
        test2: 'ßπéçîå£ ü†ƒ çhå®åç†é®ß',
        test3: 'These are fine: -_.~',
      };
      const sigParams = amazon.attachSignature(url, secret, params);
      assert.equal(sigParams.test1, params.test1);
      assert.equal(sigParams.test2, params.test2);
      assert.equal(sigParams.test3, params.test3);
      assert.equal(sigParams.SignatureMethod, 'HmacSHA256');
      assert.equal(sigParams.SignatureVersion, 2);
      assert.equal(sigParams.Signature, '+LC2vMBuR51S94bAVK9DctDJC0XQCZ4vmQ6CKBYyTf4=');
      assert.equal(Object.keys(sigParams).length, 6);
    });
  });
});
