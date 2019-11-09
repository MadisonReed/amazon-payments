// used to load private key
const pem = require('pem');
const fs = require("fs");

// fetch test cases
const testData = require("./test-notify-data.json");
const data = testData.data;
const publicKeyId = testData.publicKeyId;

const deliveryTracker = require("./deliveryTracker.js").deliveryTracker;

// make pay configuration
const privateKey = fs.readFileSync("pay-delivery-notifications.pem");
pem.readPkcs12(privateKey, { p12Password: "" }, (err, cert) => {
    console.log(cert);
});

const payCfg = deliveryTracker.payConfiguration('NA', publicKeyId, privateKey )

// run tests

data.forEach(testCase => {
  const deliveryDetails = deliveryTracker.buildDeliveryDetails(testCase.trackingNumber, testCase.carrierCode);
  const result = deliveryTracker.sendDeliveryNotification(testCase.oro, deliveryDetails, payCfg);
  if (result.code !== 200) {
    console.log(`${testCase.name} failed: ${result.code} ${result.message}`);
  } else {
    console.log(`${testCase.name} succeeded!`);
  }
});
