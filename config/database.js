// var fs = require('fs');
var mongoose = require('mongoose');

// Used for MongoLab (remote Mongo)
// var mongo_domain = fs.readFileSync(__dirname + '/../envs/dev/MONGO_DOMAIN', 'utf8').trim();
// var mongo_port = fs.readFileSync(__dirname + '/../envs/dev/MONGO_PORT', 'utf8').trim();
// var mongo_db = fs.readFileSync(__dirname + '/../envs/dev/MONGO_DB', 'utf8').trim();
// var mongo_user = fs.readFileSync(__dirname + '/../envs/dev/MONGO_USER', 'utf8').trim();
// var mongo_password = fs.readFileSync(__dirname + '/../envs/dev/MONGO_PASSWORD', 'utf8').trim();

// var mongo_connection_string = "mongodb://" + mongo_domain + ":" + mongo_port + "/" + mongo_db;
// var mongo_connection_options = {
//     user: mongo_user,
//     pass: mongo_password
// };
// mongoose.connect(mongo_connection_string, mongo_connection_options); // don't know why this doesn't work for MongoLab
mongoose.connect("mongodb://localhost:27017");

// module.exports = {
//     mongo_connection_string: mongo_connection_string,
//     mongo_connection_options: mongo_connection_options
// };
