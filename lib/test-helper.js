const url = require("url");
const pem = require('pem');
const fs = require("fs");
const signer = require("./api-signing").signatureHelper;
const testData = require("./test-signing-data.json");
const data = testData.data;
const ts = testData.timestamp;
const dateHeader = [];
const tsArray = [];
tsArray.push(ts);
dateHeader.push(["x-amz-pay-date", tsArray]);
const useCurrentTimestamp = false; // flag to indicate if timestamp from data or current timestamp to be used

const privateKey = fs.readFileSync("pay-delivery-notifications.pem");
pem.readPkcs12(privateKey, { p12Password: "" }, (err, cert) => {
    console.log(cert);
});

const publicKeyId = ''; // not used in the test data

const payCfg = signer.payConfiguration('EU', publicKeyId, privateKey )

data.forEach(element => {
  try {
    const path = url.parse(element.uri).path;

    const canonicalRequest = signer.createCanonicalRequest(path,
      element.method,
      element.parameters,
      element.payload,
      signer.createPreSignedHeaders(
        (useCurrentTimestamp ? "" : dateHeader),
        payCfg),
      );
    if (canonicalRequest === element.canonicalRequest) {
      console.log(`${element.name} - canonical request generated correctly`)
    } else {
      throw new Error(`Mismatch in canonical request:\nFound : ${canonicalRequest}\nWanted: ${element.canonicalRequest}`);
    }
    const stringToSign = signer.createStringToSign(canonicalRequest);
    if (stringToSign === element.stringToSign) { console.log(`${element.name} signed successfully`);}
    else {
      throw new Error(`Mismatch in signed string:\nFound : ${stringToSign}\nWanted: ${element.stringToSign}`);
    }
  } catch (error) {
    console.log(`${element.name} failed. reason: ${error.message}`);
  }
});
