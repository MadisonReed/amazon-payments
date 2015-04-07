var request = require('request');
var crypto = require('crypto');
var URL = require('url');
var qs = require('querystring');
var xml2js = require('xml2js');

var error = require('./error');

var offAmazonPayments = require('./offAmazonPayments').offAmazonPayments;
var api = require('./api').api;

exports.amazon = Amazon;

// exposing these methods so they can be tested
exports.composeParams = composeParams;
exports.attachSignature = attachSignature;

function Amazon(config) {
  this.config = config;
  this.debug = config.debug;

  this.callApiMethod = callApiMethod;
  this.callMwsMethod = callMwsMethod;

  this.offAmazonPayments = new offAmazonPayments(this);
  this.api = new api(this);
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

    parseMwsResponse(method, body, callback);
  });
}

function composeParams(params, label, composed) {
  composed = composed || {};
  
  Object.keys(params).forEach(function(key) {
    var value = params[key];
    var newLabel = label ? label + "." + key : key;

    if (Object.prototype.toString.call(value) === '[object Object]') {
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
    var param = {};
    param[key] = params[key];
    return qs.stringify(param).replace("%7E", "~");
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

function parseMwsResponse(method, response, callback) {
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
}

function parseApiResponse(response) {
  var parsed;
  try {
    parsed = JSON.parse(response);
  } catch(e) {
    return new Error(e);
  }

  if (parsed.error) {
    return error.apiError(parsed.error, parsed.error_description, parsed);
  } else {
    return parsed;
  }
}

function Response(method, rawResponse) {
  if (!rawResponse.hasOwnProperty(method + 'Response')) {
    return rawResponse;
  }
  var _response = rawResponse[method + 'Response'];
  var _result = _response[method + 'Result'];

  Object.defineProperty(this, 'requestId', {
    enumerable: false,
    get: function () {
      return _response.ResponseMetadata.RequestId;
    }
  });

  return _result;
}