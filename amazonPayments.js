const Config = require('./lib/config').config;
const Amazon = require('./lib/amazon').amazon;

function connect(opts) {
  return new Amazon(new Config(opts));
}

exports.connect = connect;
exports.Environment = require('./lib/environment');
