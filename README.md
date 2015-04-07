## Installation:

``` sh
npm install amazon-payments
```

## Usage:

Initialize the amazonPayment object with the environment variable, and all required config parameters.

The `amazonPayments.Environment` object contains two properties: `Production` and `Sandbox`, pass one of these in the configuration object.

__Example:__

``` js
var amazonPayments = require('amazon-payments');
var payment = amazonPayments.connect({
  environment: amazonPayments.Environment.Production,
  sellerId: 'Amazon Seller ID',
  mwsAccessKey: 'MWS Access Key',
  mwsSecretKey: 'MWS Secret Key',
  clientId: 'Client ID'
});
```

## Note about request parameters

This module will automatically sign all requests and convert nested objects to dot notation.

__Example:__
``` js
payment.offAmazonPayments.refund({
  AmazonCaptureId: 'Amazon capture ID',
  RefundReferenceId: 'Refund Reference ID',
  RefundAmount: {
    Amount: 123.45,
    CurrencyCode: 'USD'
  }
}, function(err) {
  console.log(err);
})
```
Will make a call with the following parameters:
``` json
{
  "AmazonCaptureId": "Amazon capture ID",
  "RefundReferenceId": "Refund Reference ID",
  "RefundAmount.Amount": 123.45,
  "RefundAmount.CurrencyCode": "USD"
}
```

## api.getTokenInfo(accessToken, callback)

getTokenInfo taks two parameters: accesToken and callback. [More Info](http://docs.developer.amazonservices.com/en_US/apa_guide/APAGuide_ObtainProfile.html)

callback: err, tokenInfo

__Example:__

``` js
payment.api.getTokenInfo('access token from button', function(err, tokenInfo) {
  console.log(tokenInfo);
});
```

## api.getProfile(accessToken, callback)

getProfile taks two parameters: accesToken and callback. [More Info](http://docs.developer.amazonservices.com/en_US/apa_guide/APAGuide_ObtainProfile.html)

callback: err, profile

__Example:__

``` js
payment.api.getProfile('access token from button', function(err, profile) {
  console.log(profile);
});
```


## offAmazonPayments.*

All the methods in the offAmazonPayments object take two parameters: params and callback. 
The functions are all named the same as their respective API calls, except with a lowercase first letter.
[More Info](http://docs.developer.amazonservices.com/en_US/off_amazon_payments/OffAmazonPayments_Overview.html)
