var mongoose = require('mongoose');


module.exports = function(app, io, passport) {

    var User = require('../models/user')(io);

    var bob = require('../bob')(io);


    app.post('/register', function(req, res) {
        User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
            if (err) {
                return res.status(500).json({
                    err: err
                });
            };

            bob.befriendBob(req.body.username);

            passport.authenticate('local')(req, res, function() {
                return res.json({
                    message: 'Registration succeeded.'
                });
            });
        });
    });

    app.post('/login', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                return next(err);
            };

            if (!user) {
                return res.status(401).json({
                    err: info
                });
            };

            req.login(user, function(err) {
                if (err) {
                    return res.status(500).json({
                        err: 'Login failed.'
                    });
                };

                return res.json({
                    message: 'Login succeeded.',
                    user: user
                });
            });
        })(req, res, next);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        return res.json({
            message: 'Logout successful.'
        });
    });

    app.get('/loggedInUser', function(req, res) {
        if (req.user) {
            return res.json({
                user: req.user
            });
        } else {
            return res.json({
                message: 'No user is logged in.'
            });
        };
    });

};
