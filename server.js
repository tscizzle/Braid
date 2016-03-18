var express  = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
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
app.use(require('express-session')({
    secret: 'keyboard cat',
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


// routes

require('./app/routes/api')(app, io);


// application routes
// TODO: take these routes out of here and into their own file

app.get('/', function(req, res) {
    res.sendfile('./public/views/index.html');
});

app.get('/register', function(req, res) {
    res.sendfile('./public/views/register.html');
});

app.post('/register', function(req, res) {
    User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
        if (err) {
            console.log(err); // TODO: log error until we have real error handling
            return res.sendfile('./public/views/register.html');
        };

        passport.authenticate('local')(req, res, function() {
            res.redirect('/');
        });
    });
});

app.get('/login', function(req, res) {
    res.sendfile('./public/views/login.html');
});

app.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


// socket communication

io.sockets.on('connection', require('./app/routes/socket'));


// listen

var PORT = (process.env.PORT || 8080);
app.set('port', PORT);

server.listen(PORT);

console.log("Server listening on port " + PORT);


// run server with `node server.js` (or `nodemon server.js` if nodemon is installed)
