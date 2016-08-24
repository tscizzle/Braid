var sendgrid = require('sendgrid');

var api = sendgrid(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

module.exports = api;
