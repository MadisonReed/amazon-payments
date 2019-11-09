const https = require('https');
const url = require('url');

const deliveryTrackersAPI = {
  path: '/live/v1/deliveryTrackers',
  method: 'POST',
}

const signer = require("./api-signing").signatureHelper;

const carrierCodes = require("./carrierCodes.json");

function buildDeliveryDetails(trackingNumber, carrierCode) {

  // TODO validate tracking number

  // validate carrier code
  const validCodes = Object.keys(carrierCodes);
  if (validCodes.indexOf(carrierCode) === -1) {
    throw ("Invalid carrier code");
  }

  return [
    {
      "trackingNumber": trackingNumber,
      "carrierCode": carrierCode
    },
  ]
}

async function sendDeliveryNotification(orderReferenceId, deliveryDetails, payConfiguration) {

  // TODO check params
  if (orderReferenceId[0] !== "P") {
    throw ("Invalid order reference id")
  }

  // construct request
  const payload = {
    "amazonOrderReferenceId": orderReferenceId,
    "deliveryDetails": deliveryDetails
  }

  const payloadString = JSON.stringify(payload);
  const headers = signer.createPreSignedHeaders("", payConfiguration);
  const headersList = signer.getSignedHeadersString(headers);

  // sign request
  const canonicalRequest = signer.createCanonicalRequest(
    deliveryTrackersAPI.path,
    deliveryTrackersAPI.method,
    "",
    payloadString,
    headers
  )
  const stringToSign = signer.createStringToSign(canonicalRequest);
  console.log('canon:\n' + canonicalRequest);
  console.log('sign this! ' + stringToSign);
  const signature = signer.generateSignature(stringToSign, payConfiguration.privateKey);

  const authHeaderString = `${signer.signingAlgorithm} PublicKeyId=${payConfiguration.publicKeyId}, SignedHeaders=${headersList}, Signature=${signature}`;

  const httpHeaders = {};
  headers.forEach(hd => {
    httpHeaders[hd[0]] = hd[1][0];
  })

  httpHeaders['Authorization'] =authHeaderString;

  var options = {
    host: url.parse(payConfiguration.endpoint).hostname,
    port: 443,
    path: deliveryTrackersAPI.path,
    method: deliveryTrackersAPI.method,
    headers: httpHeaders,
    body: payloadString
  };

  // make request
  response = await callAPI(options);

  // check response
  switch (response.reasonCode) {
    case 200:
      // 200 OK
      console.log('success');
      break;
    case 400:
      // 400 	InvalidInputFormat 	The input provided is not in the required format.
      // 400 	InvalidParameterValue 	The[parameterName] parameter is required.
      // 400 	InvalidParameterValue 	The amazonOrderReferenceId that you submitted in this request is invalid.
      // 400 	InvalidParameterValue 	The trackingNumber or carrierCode that you submitted in this request is invalid.
      console.log(`Invalid: ${response.message}`);
    case 401:
      // 401 	UnauthorizedAccess 	The specified seller account is not authorized to execute this request.
      console.log(`Unauthorized: ${response.message}`);
    case 405:
      // 405 Not Allowed
    case 500:
      // 500 	InternalServerError 	There was an unknown error in the service. 
      console.log(`Service Error: ${response.message}`);
    default:
      console.log(`Unexpected error: ${response.reasonCode} ${response.message}`);
      break;
  }
};

async function callAPI(options) {
  return new Promise((resolve, reject) => {
    let returnData;
    console.log(JSON.stringify(options));
    const request = https.request(options, function (response) {
      response.setEncoding('utf8');

      response.on('data', chunk => {
        returnData += chunk;
      });

      response.on('end', () => {
        console.log(returnData);
        resolve(returnData);
      });

      response.on('error', error => {
        reject(error);
      });
    });
    request.end();
  })
}


module.exports.deliveryTracker = {
  carrierCodes,
  buildDeliveryDetails,
  sendDeliveryNotification,
  payConfiguration: signer.payConfiguration
}