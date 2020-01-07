exports.config = config;

function config(cfg) {
  this.environment = cfg.environment;
  this.clientId = cfg.clientId;
  this.sellerId = cfg.sellerId;
  this.mwsAccessKey = cfg.mwsAccessKey;
  this.mwsSecretKey = cfg.mwsSecretKey;
  this.publicKeyId = cfg.publicKeyId;
  this.privateKey = cfg.privateKey;
}