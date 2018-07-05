const error = require('./error');

exports.Api = Api;

function Api(_super) {
  this._super = _super;
}

Api.prototype.getTokenInfo = function getTokenInfo(accessToken, callback) {
  const self = this;
  const params = {
    access_token: accessToken,
  };

  self._super.callApiMethod('auth/o2/tokeninfo', params, (err, tokenInfo) => {
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
  const self = this;
  self.getTokenInfo(accessToken, (err) => {
    if (err) {
      return callback(err);
    }

    return self._super.callApiMethod('user/profile', null, accessToken, callback);
  });
};
