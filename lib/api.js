var error=require('./error.js')
exports.api = Api;

function Api(_super) {
  this._super = _super;
}

Api.prototype.getTokenInfo = function getTokenInfo(accessToken, callback) {
  var self = this;
  var params = {
    access_token: accessToken
  };

  self._super.callApiMethod('auth/o2/tokeninfo', params, function(err, tokenInfo) {
    if (err) {
      return callback(err);
    }

    if (!tokenInfo) {
      return callback(error.badToken('No token info returned'));
    }

    if (tokenInfo.aud !== self._super.config.clientId) {
      return callback(error.badToken('Token does not belong to us', tokenInfo));
    }

    return callback(null, tokenInfo);
  });
};

Api.prototype.getProfile = function getProfile(accessToken, callback) {
  var self = this;
  self.getTokenInfo(accessToken, function(err, tokenInfo) {
    if (err) {
      return callback(err);
    }

    self._super.callApiMethod('user/profile', null, accessToken, callback);
  });
};
