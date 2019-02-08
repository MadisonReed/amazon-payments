## Installation:

``` sh
npm install @madisonreed/amazon-payments
```

## Usage:

Initialize the amazonPayment object with the environment variable, and all required config parameters.

The `amazonPayments.Environment` object contains two properties: `Production` and `Sandbox`, pass one of these in the configuration object. Use `ProductionEU` and `SandboxEU` for European countries.

__Example:__

``` js
var amazonPayments = require('@madison-reed/amazon-payments');
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

getTokenInfo takes two parameters: accesToken and callback. [More Info](https://payments.amazon.com/documentation/lpwa/201749840#201749970)

callback: err, tokenInfo

__Example:__

``` js
payment.api.getTokenInfo('access token from button', function(err, tokenInfo) {
  console.log(tokenInfo);
});
```

## api.getProfile(accessToken, callback)

getProfile takes two parameters: accesToken and callback. [More Info](https://payments.amazon.com/documentation/lpwa/201749840#201749970)

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
[More Info](https://pay.amazon.com/us/developer/documentation/apireference/201751630)

__Exmaple:__
``` js
payment.offAmazonPayments.getAuthorizationDetails({
  AmazonAuthorizationId: 'P01-0000000-0000000-000000'
}, function(err, details) {
  // details will be the authorization details
});
```

## SNS Response handling

Version 0.1.2 added SNS response handling for dealing with [SNS messages](http://docs.aws.amazon.com/sns/latest/dg/welcome.html). This also includes support for [IPN](https://payments.amazon.com/documentation/lpwa/201750560) endpoints. This will check the signature and attempt to parse any XML within IPN requests, if the message is not JSON it will return the raw message data, otherwise it will be the parsed response. 

__Example:__
``` js
payment.parseSNSResponse(responseFromSns, function(err, parsed) {
  // parsed will contain the full response from SNS unless the message is an IPN notification, in which case it will be the JSON-ified XML from the message.
});
```
