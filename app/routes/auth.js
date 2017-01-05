var crypto = require('crypto');
var mongoose = require('mongoose');
var sendgridAPI = require('../config/sendgrid-api');


module.exports = function(app, io, passport) {

    var User = require('../models/user')(io);

    var bob = require('../bob')(io);


    app.post('/register', function(req, res) {

        var userDoc = {username: req.body.username, email: req.body.email};

        User.register(new User(userDoc), req.body.password, function(err, user) {
            if (err) return res.status(500).json({err: err});

            bob.befriendBob(user, res, function(err, bobby) {
                if (err) {console.log('bobby err', err);};
            });

            passport.authenticate('local')(req, res, function() {
                return res.json({
                    message: 'Registration succeeded.'
                });
            });
        });

    });

    app.post('/login', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {return next(err);};

            if (!user) {
                return res.status(401).json({
                    err: info
                });
            };

            req.login(user, function(err) {
                if (err) {return res.status(500).json({err: 'Login failed.'});};

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

    app.post('/initiateResetPassword', function(req, res) {

        User.findOne({
            username: req.body.username
        }, function(err, user) {
            if (err) return res.status(500).send(err);

            if (!user) {
                return res.status(422).json({
                    err: 'No user found with that username.'
                });
            };

            var user_email = user.email;
            if (!user_email) {
                return res.status(422).json({
                    err: 'User does not have an email stored.'
                });
            }

            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');

                User.update({
                    username: req.body.username
                }, {
                    $set: {
                        resetPasswordToken: token,
                        resetPasswordExpires: Date.now() + (3600 * 1000) // token expires in an hour
                    }
                }, function(err, numAffected) {
                    if (err) return res.status(500).send(err);

                    var confirmation_link = 'http://' + req.headers.host + '/auth/?token=' + token;
                    var help_link = 'http://' + req.headers.host + '/help';

                    var from_email = 'Bob <bob@braid.space>';
                    var from_name = 'Braid Bob';
                    var subject = 'Braid Password Reset';
                    var email_body = (
                        '<p>You may follow this link ' +
                        '(<b><a href="' + confirmation_link + '">' + confirmation_link + '</a></b>) ' +
                        'to reset your password. The link will be valid for 1 hour.</p>' +
                        '<i style="font-size: 0.9em;">If this was not you, you may ignore this email ' +
                        '(or contact us if it happens again, using our info shown at ' +
                        '<b><a href="' + help_link + '">' + help_link + '</a></b>).</i>'
                    );
                    sendgridAPI.send({
                        to: user_email,
                        from: from_email,
                        fromname: from_name,
                        subject: subject,
                        html: email_body
                    }, function(err, json) {
                        if (err) return res.status(500).send(err);

                        return res.json({email: user_email});
                    });

                });

            });

        });

    });

    app.post('/resetPassword/:token', function(req, res) {

        User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: {$gt: Date.now()}
        }, function(err, user) {
            if (err) return res.status(500).send(err);

            if (!user) {
                return res.status(422).json({
                    err: 'Reset token is either invalid or expired.'
                });
            };

            user.setPassword(req.body.new_password, function(err) {
                if (err) return res.status(500).send(err);

                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    if (err) return res.status(500).send(err);

                    return res.json({success: true});
                });

            });

        });

    });

};
