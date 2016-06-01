var mongoose = require('mongoose');

var MONGO_CONNECTION_STRING = process.env.MONGOLAB_URI || "mongodb://localhost:27017"
console.log('MONGO_CONNECTION_STRING', MONGO_CONNECTION_STRING);

mongoose.connect(MONGO_CONNECTION_STRING);
