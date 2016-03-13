var express  = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var database = require('./config/database');

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


// other config

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());


// routes

require('./app/routes/api')(app);


// application routes

app.get('/', function(req, res) {
    res.sendfile('./public/views/index.html');
});


// socket communication

io.sockets.on('connection', require('./app/routes/socket'));


// listen

var PORT = (process.env.PORT || 8080);
app.set('port', PORT);
server.listen(PORT);

console.log("Server listening on port " + PORT);


// run server with `node server.js` (or `nodemon server.js` if nodemon is installed)
