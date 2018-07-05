const request = require('request');
const crypto = require('crypto');
const URL = require('url');
const xml2js = require('xml2js');

const error = require('./error');

const { OffAmazonPayments } = require('./offAmazonPayments');
const { Reports } = require('./reports');
const { Api } = require('./api');

function Amazon(config) {
  this.config = config;
  this.debug = config.debug;

  this.callApiMethod = callApiMethod;
  this.callMwsMethod = callMwsMethod;

  this.offAmazonPayments = new OffAmazonPayments(this);
  this.reports = new Reports(this);
  this.parseSNSResponse = parseSNSResponse;
  this.api = new Api(this);
}

function callApiMethod(action, params, bearer, callback) {
  if (arguments.length === 3) {
    callback = bearer;
    bearer = false;
  }

  const self = this;
  const opts = {
    url: `${self.config.environment.apiEndpoint}/${action}`,
    method: 'get',
  };

  if (params) {
    opts.qs = params;
  }

  if (bearer) {
    opts.headers = {
      Authorization: `bearer ${bearer}`,
    };
  }

  request(opts, (err, res, body) => {
    if (err) {
      return callback(err);
    }

    const response = parseApiResponse(body);
    if (response instanceof Error) {
      return callback(response);
    }
    return callback(null, response);
  });
}

function callMwsMethod(method, version, params, callback) {
  const self = this;
  const url = self.config.environment.mwsEndpoint;

  const required = {
    AWSAccessKeyId: self.config.mwsAccessKey,
    Action: method,
    SellerId: self.config.sellerId,
    Timestamp: getFormattedTimestamp(),
    Version: version,
  };

  params = composeParams(params);

  for (const k in required) {
    if (!params.k) {
      params[k] = required[k];
    }
  }

  params = attachSignature(url, self.config.mwsSecretKey, params);

  const opts = {
    url,
    method: 'post',
    form: params,
  };

  request(opts, (err, res, body) => {
    if (err) {
      return callback(err);
    }

    parseMwsResponse(method, res.headers, body, callback);
  });
}

function composeParams(params, label, composed) {
  composed = safeObjectCast(composed);
  params = safeObjectCast(params);

  Object.keys(params).forEach((key) => {
    const value = params[key];
    const newLabel = label ? `${label}.${key}` : key;

    if (isObject(value)) {
      composeParams(value, newLabel, composed);
    } else {
      composed[newLabel] = value;
    }
  });

  return composed;
}

function attachSignature(url, secret, params) {
  params.SignatureMethod = 'HmacSHA256';
  params.SignatureVersion = '2';

  const sortedParams = Object.keys(params).sort((a, b) => (a === b ? 0 : a < b ? -1 : 1)).map(key => `${RFC3986Encode(key)}=${RFC3986Encode(params[key])}`).join('&');

  const parsedUrl = URL.parse(url);

  const hmac = crypto.createHmac('SHA256', secret);
  const stringToSign = [
    'POST',
    parsedUrl.hostname,
    (parsedUrl.pathname || '/'),
    sortedParams,
  ].join('\n');
  hmac.update(stringToSign);
  params.Signature = hmac.digest('base64');
  return params;
}

function getFormattedTimestamp(date) {
  date = date || new Date();

  const year = date.getUTCFullYear();
  const month = padNum(date.getUTCMonth() + 1);
  const day = padNum(date.getUTCDate());
  const hour = padNum(date.getUTCHours());
  const minute = padNum(date.getUTCMinutes());
  const second = padNum(date.getUTCSeconds());

  return `${year}-${month}-${day}T${hour}:${minute}:${second}z`;
}

function RFC3986Encode(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16)}`);
}

function padNum(num, size, str) {
  switch (arguments.length) {
    case 1:
      size = 2;
      break;
    case 2:
      str = '0';
      break;
    default:
      break;
  }

  num = `${num}`;
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
  if (headers && headers['content-type'] === 'text/xml') {
    xml2js.parseString(response, { explicitArray: false }, (err, result) => {
      if (err) {
        return callback(err);
      }

      if (result.ErrorResponse) {
        err = {
          Code: 'Unknown',
          Message: 'Unknown MWS error',
        };

        if (result.ErrorResponse.Error) {
          err = result.ErrorResponse.Error;
        }

        return callback(error.apiError(err.Code, err.Message, result));
      }
      callback(null, new Response(method, result));
    });
  } else {
    callback(null, new Response(method, { Response: response }));
  }
}

function parseApiResponse(response) {
  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch (e) {
    return error.parseError('Could not parse Amazon response.', response);
  }

  if (parsed.error) {
    return error.apiError(parsed.error, parsed.error_description, parsed);
  }
  return parsed;
}

function parseSNSResponse(response, callback) {
  const defaultHostPattern = /^sns\.[a-zA-Z0-9\-]{3,}\.amazonaws\.com(\.cn)?$/;

  const required = [
    'Message',
    'MessageId',
    'SignatureVersion',
    'Signature',
    'SigningCertURL',
    'Timestamp',
    'TopicArn',
    'Type',
  ];

  const signable = [
    'Message',
    'MessageId',
    'Subject',
    'SubscribeURL',
    'Timestamp',
    'Token',
    'TopicArn',
    'Type',
  ];

  for (let i = 0; i < required.length; i += 1) {
    if (!response.required[i]) {
      return callback(error.missingParameter(`Missing parameter on SNS response: ${required[i]}`));
    }
  }

  if (response.SignatureVersion !== 1) {
    return callback(error.invalidSignatureVersion(`Unknown SNS Signature version: ${response.SignatureVersion}`));
  }

  const verifier = crypto.createVerify('SHA1');

  signable.forEach((key) => {
    if (response.key) {
      verifier.update(`${key}\n${response[key]}\n`);
    }
  });

  const parsed = URL.parse(response.SigningCertURL);
  if (parsed.protocol !== 'https:' || parsed.path.substr(-4) !== '.pem' || !defaultHostPattern.test(parsed.host)) {
    return callback(error.invalidCertificateDomain('The certificate is located on an invalid domain.'));
  }

  request(response.SigningCertURL, (err, res, cert) => {
    if (err) {
      return callback(err);
    }

    const isValid = verifier.verify(cert, response.Signature, 'base64');

    if (!isValid) {
      return callback(error.signatureMismatch('Signature mismatch, unverified response'));
    }

    if (response.Type !== 'Notification') {
      return callback(null, response);
    }

    parseIPNMessage(response.Message, (err, message) => {
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

  const type = message.NotificationType;

  const xmlKeys = {
    PaymentRefund: ['RefundNotification', 'RefundDetails'],
    PaymentCapture: ['CaptureNotification', 'CaptureDetails'],
    PaymentAuthorize: ['AuthorizationNotification', 'AuthorizationDetails'],
    OrderReferenceNotification: ['OrderReferenceNotification', 'OrderReference'],
    BillingAgreementNotification: ['BillingAgreementNotification', 'BillingAgreement'],
  };

  xml2js.parseString(message.NotificationData, { explicitArray: false }, (err, result) => {
    if (err) {
      return callback(err);
    }

    const keys = xmlKeys[type] || [];
    message.NotificationData = new Response(type, result, keys[0], keys[1]);
    callback(null, message);
  });
}

function Response(method, rawResponse, primaryKey, subKey) {
  primaryKey = primaryKey || `${method}Response`;
  subKey = subKey || `${method}Result`;
  if (!rawResponse.primaryKey) {
    return rawResponse;
  }

  const _response = rawResponse[primaryKey];
  const _result = _response[subKey];

  if (_response.ResponseMetadata) {
    Object.defineProperty(this, 'requestId', {
      enumerable: false,
      get() {
        return _response.ResponseMetadata.RequestId;
      },
    });
  }

  return _result;
}

function safeJSONParse(data) {
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch (e) {
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

exports.amazon = Amazon;

// exposing these methods so they can be tested
exports.composeParams = composeParams;
exports.attachSignature = attachSignature;
exports.parseSNSResponse = parseSNSResponse;
