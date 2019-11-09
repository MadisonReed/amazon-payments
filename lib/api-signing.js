
const crypto = require('crypto');
const url = require('url');

const LINE_SEPARATOR = "\n";
const SALT_LENGTH = 20;
const TRAILER_FIELD = 1;
const AMAZON_SIGNATURE_ALGORITHM = 'AMZN-PAY-RSASSA-PSS';

function payConfiguration(region, publicKeyId, privateKey) {

  const endpoints = {
    'EU': "https://pay-api.amazon.eu",
    'NA': "https://pay-api.amazon.com",
    'JP': "https://pay-api.amazon.jp"
  };
  let endpoint = "";
  if (Object.keys(endpoints).indexOf(region.toUpperCase()) !== -1) {
    endpoint = endpoints[region];
  } else {
    endpoint = endpoints['NA'];
  }

  return {
    region: region.toLowerCase(),
    endpoint,
    publicKeyId,
    privateKey
  }
}

/**
 * Creates a string that includes the information from the request in a standardized(canonical) format.
 * @param uri The uri that needs to be executed
 * @param httpMethodName the HTTP request method(GET,PUT,POST etc) to be used
 * @param parameters the query parameters map
 * @param requestPayload the payload to be sent with the request
 * @param preSignedHeaders the mandatory headers required
 * @return a canonical request
 * @throws AmazonPayClientException
 * algorithm requested is not available in the environment
 */
function createCanonicalRequest(path, httpMethodName, parameters, requestPayload, preSignedHeaders) {
  let canonicalRequestString = httpMethodName;
  canonicalRequestString += LINE_SEPARATOR;
  canonicalRequestString += getCanonicalizedURI(path);
  canonicalRequestString += LINE_SEPARATOR;
  canonicalRequestString += getCanonicalizedQueryString(parameters);
  canonicalRequestString += LINE_SEPARATOR;
  canonicalRequestString += getCanonicalizedHeaderString(preSignedHeaders);
  canonicalRequestString += LINE_SEPARATOR;
  canonicalRequestString += getSignedHeadersString(preSignedHeaders);
  canonicalRequestString += LINE_SEPARATOR;
  canonicalRequestString += hashThenHexEncode(requestPayload);
  return canonicalRequestString;
}

/**
 * Creates the string that is going to be signed
 * @param canonicalRequest The canonical request generated using the createCanonicalRequest() method
 * @return the string to be signed
 * @throws NoSuchAlgorithmException exception thrown when the cryptographic
 * algorithm requested is not available in the environment
 */
function createStringToSign(canonicalRequest) {
  const hashedCanonicalRequest = hashThenHexEncode(canonicalRequest);

  let stringToSign = AMAZON_SIGNATURE_ALGORITHM;
  stringToSign += LINE_SEPARATOR;
  stringToSign += hashedCanonicalRequest;

  return stringToSign;
}

/**
 * Generates a signature for the string passed in
 * @param stringToSign the string to be signed
 * @param privateKey the private key to use for signing
 * @return the signature
 */
function generateSignature(stringToSign, privateKey) {
  const signerObject = crypto.createSign("RSA-SHA256");
  signerObject.update(stringToSign);
  const signature = signerObject.sign({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING, saltLength: SALT_LENGTH }, "base64");

  return signature;
}

/**
 * Creates the mandatory headers required in the request
 * @param uri the uri to be executed
 * @return a map of mandatory headers
 */
function createPreSignedHeaders(userHeaders, payConfiguration) {
  const headers = [];

  //List of Headers added by Amazon Pay
  const acceptHeaderValue = [];
  acceptHeaderValue.push("application/json");
  headers.push(["accept", acceptHeaderValue]);

  const contentHeaderValue = [];
  contentHeaderValue.push("application/json");
  headers.push(["content-type", contentHeaderValue]);

  const regionHeaderValue = [];
  regionHeaderValue.push(payConfiguration.region);
  headers.push(["x-amz-pay-region", regionHeaderValue]);

  const dateHeaderValue = [];
  dateHeaderValue.push(new Date().toISOString().replace(/[:-]/g,"").replace(/\..+/g,"Z"));
  headers.push(["x-amz-pay-date", dateHeaderValue]);

  const hostHeaderValue = [];
  hostHeaderValue.push(url.parse(payConfiguration.endpoint).hostname);
  headers.push(["x-amz-pay-host", hostHeaderValue]);

  //If no header is provided by the merchant, return the headers added by Amazon Pay
  if (userHeaders === null || userHeaders === "") {
    return headers;
  }

  //Executes only if header is sent by the merchant.
  //Converts the Merchant's header to lowercase for case insensitivity.
  userHeaders.forEach(function (header) {
    headersKeys = headers.map(currentHeaders => currentHeaders[0]); 
    const position = headersKeys.indexOf(header[0].toLowerCase());
    if (position !== -1) {
      // user header to overwrite generated header
      // remove existing 
      headers.splice(position,1);
    }
    // add user header
    headers.push([header[0], header[1]]);
  })
  return headers;
}

/**
 * Generates a string that is a list of headers names that are included in the canonical headers.
 * This is to identify which headers are a part of the signing process.
 * @param preSignedHeaders the mandatory header
 * @return the string of signed headers
 */
function getSignedHeadersString(preSignedHeaders) {
  let sortedHeaders = {};
  if (preSignedHeaders !== "") {
    sortedHeaders = preSignedHeaders.sort(
      function (a, b) {
        const x = a[0].toLowerCase();
        const y = b[0].toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      }
    )
  } else {
    return preSignedHeaders;
  };

  let headerString = "";

  sortedHeaders.forEach(function (header) {
    headerString += ";";
    headerString += header[0].trim().replace("\\s", " ");
  })
  return headerString.slice(1);
}

/**
 * Generates a canonical headers string that consists of a list of all HTTP headers
 * that are included with the request.
 * @param preSignedHeaders the mandatory headers
 * @return the canonical header string
 */
function getCanonicalizedHeaderString(preSignedHeaders) {
  let sortedHeaders = {};
  if (preSignedHeaders !== "") {
    sortedHeaders = preSignedHeaders.sort(
      function (a, b) {
        const x = a[0].toLowerCase();
        const y = b[0].toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      }
    )
  } else {
    return preSignedHeaders;
  };

  let headerString = "";

  sortedHeaders.forEach(function (header) {
    headerString += header[0].trim().replace("\\s", " ");
    headerString += ":";

    let headerValues = header[1];
    if (headerValues != null) {
      let headerValuesString = "";
      headerValues.forEach(function (headerValue) {
        headerValuesString += ",";
        headerValuesString += headerValue.trim().replace("\\s", " ");
      })
      headerString += headerValuesString.slice(1);
    }
    headerString += LINE_SEPARATOR;
  })
  return headerString;
}

/**
 * Generates a canonical string that consists of all the query parameters
 * @param parameters the query parameters of the request
 * @return the canonical query string
 * @throws AmazonPayClientException
 */
function getCanonicalizedQueryString(parameters) {
  /**
   * Signing protocol expects the param values also to be sorted after url
   * encoding in addition to sorted parameter names.
   */
  const encodedParams = {};

  if (parameters != null) {
    Object.keys(parameters).forEach(function (key) {
      encodedParams[encodeURIComponent(key)] = encodeURIComponent(parameters[key]);
    });
  }

  let canonicalQueryString = "";
  Object.keys(encodedParams).sort().forEach(function (key) {
    canonicalQueryString += "&";
    canonicalQueryString += key;
    canonicalQueryString += "=";
    canonicalQueryString += encodedParams[key];
  })

  return canonicalQueryString.slice(1);
}

/**
 * Generates a canonical URI string
 * @param path the path of the uri provided
 * @return canonical URI string
 */
function getCanonicalizedURI(path) {
  if (path == null || path === "") {
    return "/";
  } else {
    if (path.startsWith("/")) {
      return path;
    } else {
      return `/${path}`;
    }
  }
}

/**
 * Generates a Hex encoded string from a hashed value of the payload string
 * @param requestPayload the payload to be hashed
 * @return the hashed payload string
 * @throws NoSuchAlgorithmException exception thrown when the cryptographic
 * algorithm requested is not available in the environment
 */
function hashThenHexEncode(requestPayload) {
  const sha256 = crypto.createHash("sha256");
  const payload = (requestPayload);
  sha256.update(payload, "utf8"); //utf8 here
  return sha256.digest('hex');
}


module.exports.signatureHelper = {
  payConfiguration,
  createCanonicalRequest,
  createStringToSign,
  generateSignature,
  createPreSignedHeaders,
  getSignedHeadersString,
  getCanonicalizedHeaderString,
  getCanonicalizedQueryString,
  getCanonicalizedURI,
  hashThenHexEncode,
  signingAlgorithm: AMAZON_SIGNATURE_ALGORITHM,
}