// used to load private key
const fs = require("fs");

// fetch test cases
const testData = require("./test-notify-data.json");
const data = testData.data;
const publicKeyId = testData.publicKeyId;
const privateKey = fs.readFileSync("./pay-delivery-notifications.pem");


var amazonPayments = require('../amazonPayments.js');

var notifications = amazonPayments.connect({
  environment: amazonPayments.Environment.Sandbox,
  publicKeyId,
  privateKey,
}).notifications;

// run tests
async function runTest(notifications, testCase, config) {
  const result = await notifications.alexaDeliveryNotification(testCase.oro, testCase.trackingNumber, testCase.carrierCode);
  if (result.statusCode !== 200) {
    console.log(`${testCase.name} failed: ${JSON.stringify(result)}`);
  } else {
    console.log(`${testCase.name} succeeded!\n${JSON.stringify(result)}`);
  }
}

data.forEach(testCase => {
  try {
    runTest(notifications, testCase);
  } catch (error) {
    console.log(error);
  }  
});
