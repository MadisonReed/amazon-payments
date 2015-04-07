var Config = require('./lib/config').config;
var Amazon = require('./lib/amazon').amazon;

exports.Environment = require('./lib/environment');

exports.connect = connect;

function connect(opts) {
  return new Amazon(new Config(opts));
}