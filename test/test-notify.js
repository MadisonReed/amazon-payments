// used to load private key
const fs = require("fs");

// fetch test cases
const testData = require("./test-notify-data.json");
const data = testData.data;
const publicKeyId = testData.publicKeyId;
const privateKey = fs.readFileSync("./pay-delivery-notifications.pem");


var amazonPayments = require('../amazonPayments.js');

var pay = amazonPayments.connect({
  environment: amazonPayments.Environment.Sandbox,
  publicKeyId,
  privateKey,
});

// run tests
async function runTest(deliveryNotifications, testCase, config) {
  const notificationPayload = deliveryNotifications.buildPayload(testCase.oro, testCase.trackingNumber, testCase.carrierCode);
  const result = await deliveryNotifications.sendDeliveryNotification(notificationPayload, config);
  if (result.statusCode !== 200) {
    console.log(`${testCase.name} failed: ${JSON.stringify(result)}`);
  } else {
    console.log(`${testCase.name} succeeded!\n${JSON.stringify(result)}`);
  }
}

data.forEach(testCase => {
  try {
    runTest(pay.notifications, testCase, pay.config);
  } catch (error) {
    console.log(error);
  }  
});
