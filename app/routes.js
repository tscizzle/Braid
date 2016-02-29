var mongoose = require('mongoose');
var Convo = require('./models/convo');
var Message = require('./models/message');
var User = require('./models/user');

var ObjectId = mongoose.Types.ObjectId;

module.exports = function(app, passport) {

    // --- get all convos
    app.get('/api/convos', function(req, res) {

        Convo.find(function(err, convos) {
            if (err) {
                res.send(err);
            }

            res.json(convos);
        });

    });

    // --- create convo and send back all convos after creation
    app.post('/api/convos', function(req, res) {

        // TODO: make the creation of a convo include the users

        Convo.create({
            user_id_0: req.body.user_id_0,
            user_id_1: req.body.user_id_1
        }, function(err, convo) {
            if (err) {
                res.send(err);
            }

            Convo.find(function(err, convos) {
                if (err) {
                    res.send(err);
                }

                res.json(convos);
            });
        });

    });

    // --- delete convo and send back all convos after deletion
    app.delete('/api/convos/:convo_id', function(req, res) {

        Convo.remove({
            _id: req.params.convo_id
        }, function(err, convo) {
            if (err) {
                res.send(err);
            }

            Convo.find(function(err, convos) {
                if (err) {
                    res.send(err)
                }

                res.json(convos);
            });
        });

    });

    // --- get messages for a convo
    app.get('/api/messages/:convo_id', function(req, res) {

        Message.find({
            'convo_id': req.params.convo_id
        }, function(err, messages) {
            if (err) {
                res.send(err)
            }

            res.json(messages);
        });

    });

    // --- create a message and send back messages for a convo after creation
    app.post('/api/messages', function(req, res) {

        // TODO: make the creation of a message include the right sender and receiver

        Message.create({
            'text': req.body.text,
            'convo_id': req.body.convo_id,
            'sender_id': req.body.sender_id,
            'receiver_id': req.body.receiver_id,
            'time_sent': Date.parse(req.body.time_sent)
        }, function(err, convo) {
            if (err) {
                res.send(err);
            }

            Message.find({
                'convo_id': req.body.convo_id
            }, function(err, messages) {
                if (err) {
                    res.send(err);
                }

                res.json(messages);
            });
        });

    });

    // --- delete a message and send back messages for a convo after deletion
    app.delete('/api/messages/:message_id/:convo_id', function(req, res) {

        Message.remove({
            '_id': req.params.message_id
        }, function(err, message) {
            if (err) {
                res.send(err);
            }

            Message.find({
                'convo_id': req.params.convo_id
            }, function(err, messages) {
                if (err) {
                    res.send(err);
                }

                res.json(messages);
            });
        });

    });

    // --- get all users
    app.get('/api/users', function(req, res) {

        User.find(function(err, users) {
            if (err) {
                res.send(err);
            }

            res.json(users);
        });

    });

    // --- create user and send back all users after creation
    app.post('/api/users', function(req, res) {

        User.create({
            username: req.body.username,
        }, function(err, user) {
            if (err) {
                res.send(err);
            }

            User.find(function(err, users) {
                if (err) {
                    res.send(err);
                }

                res.json(users);
            });
        });

    });

    // --- delete user and send back all users after deletion
    app.delete('/api/users/:user_id', function(req, res) {

        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err) {
                res.send(err);
            }

            User.find(function(err, users) {
                if (err) {
                    res.send(err)
                }

                res.json(users);
            });
        });

    });

};
