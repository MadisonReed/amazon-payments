const Helper = require('./clientHelper.js');
const carrierCodes = require("./carrierCodes.json");

exports.notifications = notifications;

function notifications(_super) {
  this._super = _super;
}

notifications.prototype.carrierCodes = carrierCodes;

notifications.prototype.buildPayload = function (orderReferenceId, trackingNumber, carrierCode) {

  // validate order reference id
  if (orderReferenceId[0].match(/^[PS]\d{2}-\d{7}-\d{7}$/)) {
    throw ("Invalid order reference id")
  }

  // validate tracking number
  if (!trackingNumber || trackingNumber === '') {
    throw ("Tracking number missing")
  }

  // validate carrier code
  const validCodes = Object.keys(carrierCodes);
  if (validCodes.indexOf(carrierCode) === -1) {
    throw ("Invalid/unknown carrier code");
  }

  return {
    "amazonOrderReferenceId": orderReferenceId,
    "deliveryDetails": [
      {
        "trackingNumber": trackingNumber,
        "carrierCode": carrierCode
      },
    ]
  }
}

notifications.prototype.sendDeliveryNotification = async function (payload, config) {

  var options = {
    method: 'POST',
    headers: {},
    payload
  };

  let response;
  try {
    const environment = config.environment.Notifications;
    const preparedOptions = Helper.prepareOptions(options);
    preparedOptions.headers = Helper.signHeaders(config, environment, preparedOptions);
    response = await Helper.invokeApi(environment, preparedOptions);
  } catch (error) {
    console.log(error);
  }

  // check response
  switch (response.statusCode) {
    case 200:
      // 200 OK
      break;
    case 400:
      // 400 	InvalidInputFormat 	The input provided is not in the required format.
      // 400 	InvalidParameterValue 	The[parameterName] parameter is required.
      // 400 	InvalidParameterValue 	The amazonOrderReferenceId that you submitted in this request is invalid.
      // 400 	InvalidParameterValue 	The trackingNumber or carrierCode that you submitted in this request is invalid.
      console.log(`Invalid: ${response.body.message}`);
      break;
    case 401:
      // 401 	UnauthorizedAccess 	The specified seller account is not authorized to execute this request.
      console.log(`Unauthorized: ${response.message}`);
      break;
    case 403:
      // 403 Forbidden
      console.log(`Forbidden: ${response.message}`);
      break;
    case 405:
      // 405 Not Allowed
      console.log(`Not Allowed: ${response.message}`);
      break;
    case 500:
      // 500 	InternalServerError 	There was an unknown error in the service. 
      console.log(`Service Error: ${response.message}`);
      break;
    default:
      console.log(`Unexpected error: ${JSON.stringify(response)}`);
      break;
  }
  return response;
};
