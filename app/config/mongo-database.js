var mongoose = require('mongoose');

var MONGO_CONNECTION_STRING = process.env.MONGODB_URI || "mongodb://localhost:27017";

mongoose.connect(MONGO_CONNECTION_STRING);
