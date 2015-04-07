var errorTypes = Object.freeze({
  unknown: 'unknown',
  badToken: 'bad_token'
});

exports.unknown = makeError(errorTypes.unknown);
exports.badToken = makeError(errorTypes.badToken);
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