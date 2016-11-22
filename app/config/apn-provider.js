var apn = require('apn');

var apnProvider = new apn.Provider({
  cert: 'ignore/aps_development.pem', // TODO: make these strings of these files' contents? somehow make multi-line env vars?
  key: 'ignore/aps_key_development.pem' // TODO: make these strings of these files' contents? somehow make multi-line env vars?
});

module.exports = apnProvider;
