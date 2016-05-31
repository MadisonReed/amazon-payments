var errorTypes = Object.freeze({
  unknown: 'unknown',
  badToken: 'bad_token',
  missingParameter: 'missing_parameter',
  invalidSignatureVersion: 'invalid_signature_version',
  signatureMismatch: 'signature_mismatch',
  invalidCertificateDomain: 'invalid_certificate_domain',
  parseError: 'parse_error'
});

exports.unknown = makeError(errorTypes.unknown);
exports.badToken = makeError(errorTypes.badToken);
exports.missingParameter = makeError(errorTypes.missingParameter);
exports.invalidSignatureVersion = makeError(errorTypes.invalidSignatureVersion);
exports.signatureMismatch = makeError(errorTypes.signatureMismatch);
exports.invalidCertificateDomain = makeError(errorTypes.invalidCertificateDomain);
exports.parseError = makeError(errorTypes.parseError);
exports.apiError = apiError;

function makeError(type) {
  return function(message, body) {
    var err = new Error(message || "");
    err.type = type;
    err.name = type;
    err.body = body;
    return err;
  };
}

function apiError(type, message, body) {
  return new (makeError(type))(message, body);
}