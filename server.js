require('dotenv').config();

var express  = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var redisClient = require('./config/redis-client');
var RedisStore = require('connect-redis')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var database = require('./config/database');

var app = express();


// socket server

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


// other config

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(methodOverride());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    maxAge: Date.now() + 108000000, // 30 hour expire
    store: new RedisStore({client: redisClient.client}),
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// passport config

var User = require('./app/models/user')(io);
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// api routes

require('./app/routes/api')(app, io);


// application routes

app.get('/', function(req, res) {
    return res.sendfile('./public/views/index.html');
});


// authentication routes

require('./app/routes/auth')(app, io, passport);


// socket communication

io.sockets.on('connection', require('./app/routes/socket')(io));


// listen

var PORT = (process.env.PORT || 8080);
app.set('port', PORT);

server.listen(PORT);

console.log("Server listening on port " + PORT);


// run server with `node server.js` (or `nodemon server.js` if nodemon is installed)
