var request = require('request');
var crypto = require('crypto');
var URL = require('url');
var xml2js = require('xml2js');

var error = require('./error');

var offAmazonPayments = require('./offAmazonPayments').offAmazonPayments;
var reports = require('./reports').reports;
var api = require('./api').api;
var notifications = require('./deliveryNotifications').notifications;

exports.amazon = Amazon;

// exposing these methods so they can be tested
exports.composeParams = composeParams;
exports.attachSignature = attachSignature;
exports.parseSNSResponse = parseSNSResponse;

function Amazon(config) {
  this.config = config;
  this.debug = config.debug;

  this.callApiMethod = callApiMethod;
  this.callMwsMethod = callMwsMethod;

  this.offAmazonPayments = new offAmazonPayments(this);
  this.reports = new reports(this);
  this.parseSNSResponse = parseSNSResponse;
  this.api = new api(this);
  this.notifications = new notifications(this);
}

function callApiMethod(action, params, bearer, callback) {
  if (arguments.length == 3) {
    callback = bearer;
    bearer = false;
  }

  var self = this;
  var opts = {
    url: self.config.environment.apiEndpoint + '/' + action,
    method: 'get'
  };

  if (params) {
    opts.qs = params;
  }

  if (bearer) {
    opts.headers = {
      'Authorization': 'bearer ' + bearer
    };
  }

  request(opts, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    var response = parseApiResponse(body);
    if (response instanceof Error) {
      return callback(response);
    } else {
      return callback(null, response);
    }
  });
}

function callMwsMethod(method, version, params, callback) {
  var self = this;
  var url = self.config.environment.mwsEndpoint;

  var required = {
    AWSAccessKeyId: self.config.mwsAccessKey,
    Action: method,
    SellerId: self.config.sellerId,
    Timestamp: getFormattedTimestamp(),
    Version: version
  };

  params = composeParams(params);

  for (var k in required) {
    if (!params.hasOwnProperty(k)) {
      params[k] = required[k];
    }
  }

  params = attachSignature(url, self.config.mwsSecretKey, params);

  var opts = {
    url: url,
    method: 'post',
    form: params
  };

  request(opts, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    parseMwsResponse(method, res.headers, body, callback);
  });
}

function composeParams(params, label, composed) {
  composed = safeObjectCast(composed);
  params = safeObjectCast(params);

  Object.keys(params).forEach(function(key) {
    var value = params[key];
    var newLabel = label ? label + "." + key : key;

    if (isObject(value)) {
      composeParams(value, newLabel, composed);
    } else {
      composed[newLabel] = value;
    }
  });

  return composed;
}

function attachSignature(url, secret, params) {
  var method = 'HmacSHA256';

  params.SignatureMethod = 'HmacSHA256';
  params.SignatureVersion = '2';

  var sortedParams = Object.keys(params).sort(function(a, b) {
    return a == b ? 0 : a < b ? -1 : 1;
  }).map(function(key) {
    return RFC3986Encode(key) + '=' + RFC3986Encode(params[key]);
  }).join('&');

  var parsedUrl = URL.parse(url);

  var hmac = crypto.createHmac('SHA256', secret);
  var stringToSign = [
    'POST',
    parsedUrl.hostname,
    (parsedUrl.pathname || '/'),
    sortedParams,
  ].join("\n");
  hmac.update(stringToSign);
  params.Signature = hmac.digest('base64');
  return params;
}

function getFormattedTimestamp(date) {
  date = date || new Date();

  var year = date.getUTCFullYear();
  var month = padNum(date.getUTCMonth() + 1);
  var day = padNum(date.getUTCDate());
  var hour = padNum(date.getUTCHours());
  var minute = padNum(date.getUTCMinutes());
  var second = padNum(date.getUTCSeconds());

  return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':' + second + 'z';
}

function RFC3986Encode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

function padNum(num, size, str) {
  switch (arguments.length) {
    case 1:
      size = 2;
    case 2:
      str = '0';
  }

  num = '' + num;
  while (num.length < size) {
    num = str + num;
  }

  return num;
}

/**
 * Parse the MWS response.
 *
 * @param {string} method
 * @param {Object[]} headers
 * @param {string} response
 * @param {function} callback
 */
function parseMwsResponse(method, headers, response, callback) {
  // if it's XML, then we an parse correctly
  if (headers && headers['content-type'] == 'text/xml') {
    xml2js.parseString(response, {explicitArray: false}, function(err, result) {
      if (err) {
        return callback(err);
      }

      if (result.ErrorResponse) {
        err = {
          Code: 'Unknown',
          Message: 'Unknown MWS error'
        };

        if (result.ErrorResponse.Error) {
          err = result.ErrorResponse.Error;
        }

        return callback(error.apiError(err.Code, err.Message, result));
      } else {
        callback(null, new Response(method, result));
      }
    });
  } else {
    callback(null, new Response(method, { "Response": response }));
  }
}

function parseApiResponse(response) {
  var parsed;
  try {
    parsed = JSON.parse(response);
  } catch(e) {
    return error.parseError("Could not parse Amazon response.", response);
  }

  if (parsed.error) {
    return error.apiError(parsed.error, parsed.error_description, parsed);
  } else {
    return parsed;
  }
}

function parseSNSResponse(response, callback) {
  var defaultHostPattern = /^sns\.[a-zA-Z0-9\-]{3,}\.amazonaws\.com(\.cn)?$/;

  var required = [
    'Message',
    'MessageId',
    'SignatureVersion',
    'Signature',
    'SigningCertURL',
    'Timestamp',
    'TopicArn',
    'Type'
  ];

  var signable = [
    'Message',
    'MessageId',
    'Subject',
    'SubscribeURL',
    'Timestamp',
    'Token',
    'TopicArn',
    'Type',
  ];

  for (var i = 0; i < required.length; i ++) {
    if (!response.hasOwnProperty(required[i])) {
      return callback(error.missingParameter('Missing parameter on SNS response: ' + required[i]));
    }
  }

  if (response.SignatureVersion != 1) {
    return callback(error.invalidSignatureVersion('Unknown SNS Signature version: ' + response.SignatureVersion));
  }

  var verifier = crypto.createVerify('SHA1');

  signable.forEach(function(key) {
    if (response.hasOwnProperty(key)) {
      verifier.update(key + '\n' + response[key] + '\n');
    }    
  });

  var parsed = URL.parse(response.SigningCertURL);
  if (parsed.protocol !== 'https:' || parsed.path.substr(-4) !== '.pem' || !defaultHostPattern.test(parsed.host)) {
    return callback(error.invalidCertificateDomain('The certificate is located on an invalid domain.'));
  }

  request(response.SigningCertURL, function(err, res, cert) {
    if (err) {
      return callback(err);
    }

    var isValid = verifier.verify(cert, response.Signature, 'base64');

    if (!isValid) {
      return callback(error.signatureMismatch('Signature mismatch, unverified response'));
    }

    if (response.Type != 'Notification') {
      return callback(null, response);
    }

    parseIPNMessage(response.Message, function (err, message) {
      if (err) {
        return callback(err);
      }

      callback(null, message);
    });
  });
}

function parseIPNMessage(message, callback) {
  message = safeJSONParse(message);
  if (!isObject(message) || !message.NotificationData) {
    return callback(null, message);
  }

  var type = message.NotificationType;

  var xmlKeys = {
    PaymentRefund: ['RefundNotification', 'RefundDetails'],
    PaymentCapture: ['CaptureNotification', 'CaptureDetails'],
    PaymentAuthorize: ['AuthorizationNotification', 'AuthorizationDetails'],
    OrderReferenceNotification: ['OrderReferenceNotification', 'OrderReference'],
    BillingAgreementNotification: ['BillingAgreementNotification', 'BillingAgreement']
  };

  xml2js.parseString(message.NotificationData, {explicitArray: false}, function(err, result) {
    if (err) {
      return callback(err);
    }

    var keys = xmlKeys[type] || [];
    message.NotificationData = new Response(type, result, keys[0], keys[1]);
    callback(null, message);
  });
}

function Response(method, rawResponse, primaryKey, subKey) {
  primaryKey = primaryKey || method + 'Response';
  subKey = subKey || method + 'Result';
  if (!rawResponse.hasOwnProperty(primaryKey)) {
    return rawResponse;
  }

  var _response = rawResponse[primaryKey];
  var _result = _response[subKey];

  if (_response.ResponseMetadata) {
    Object.defineProperty(this, 'requestId', {
      enumerable: false,
      get: function () {
        return _response.ResponseMetadata.RequestId;
      }
    });
  }

  return _result;
}

function safeJSONParse(data) {
  var parsed;
  try {
    parsed = JSON.parse(data);
  } catch(e) {
    parsed = data;
  }
  return parsed;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function safeObjectCast(obj) {
  if (!isObject(obj)) {
    return {};
  }
  return obj;
}