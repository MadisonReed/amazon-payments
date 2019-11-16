// used to load private key
const fs = require("fs");

// fetch test cases
const testData = require("./test-notify-data.json");
const data = testData.data;
const publicKeyId = testData.publicKeyId;

const deliveryTracker = require("../lib/deliveryTracker.js");

// make pay configuration
const privateKey = fs.readFileSync("./pay-delivery-notifications.pem");

const configArgs = {
  sandbox: false,
  publicKeyId: publicKeyId,
  privateKey: privateKey,
  region: 'NA'
};

// run tests
async function runTest(deliveryTracker, testCase, configArgs) {
  const notificationPayload = deliveryTracker.buildPayload(testCase.oro, testCase.trackingNumber, testCase.carrierCode);
  const result = await deliveryTracker.sendDeliveryNotification(notificationPayload, configArgs);
  if (result.statusCode !== 200) {
    console.log(`${testCase.name} failed: ${JSON.stringify(result)}`);
  } else {
    console.log(`${testCase.name} succeeded!\n${JSON.stringify(result)}`);
  }
}

data.forEach(testCase => {
  try {
    runTest(deliveryTracker, testCase, configArgs);
  } catch (error) {
    console.log(error);
  }  
});
