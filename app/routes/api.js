var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(app, io) {

    var Message = require('../models/message')(io);
    var Strand = require('../models/strand')(io);
    var Convo = require('../models/convo')(io);
    var User = require('../models/user')(io);

    var ObjectId = mongoose.Types.ObjectId;


    // make sure that every request is authenticated with a logged in user

    var loggedIn = function(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.status(401).json({
                err: 'User not logged in.'
            });
        };
    };
    app.all("/api/*", loggedIn);


    // define a dynamic middleware-generating function that each route can use to suit its own auth needs

    var resourceBelongsToUser = function(reqPathToResourceId, resourceModel) {
        /*
        * reqPathToResourceId: array of strings, defining the path to the resource in the req. (e.g. ['params', 'convo_id'])
        * resourceModel: mongoose model, type of resource of which we are checking ownership
        */

        return function(req, res, next) {

            var it_checks_out = false;

            // specify where to find the reference to the users to which a resource belongs based on resourceModel
            var modelToUserIdPathsMap = function(m) {
                switch (m) {
                    case Message: return [['sender_id'], ['receiver_id']];
                    case Strand: return [['user_id_0'], ['user_id_1']];
                    case Convo: return [['user_id_0'], ['user_id_1']];
                    case User: return [['_id']];
                };
            };
            var resourcePathsToUserIds = modelToUserIdPathsMap(resourceModel);

            // get the resource id from the req based on reqPathToResourceId
            var resource_id = req;
            _.each(reqPathToResourceId, function(req_field_name) {
                resource_id = resource_id[req_field_name];
            });

            resourceModel.findOne({
                _id: resource_id
            }, function(err, resource) {

                _.each(resourcePathsToUserIds, function(path) {
                    var owner_id = resource;
                    _.each(path, function(resource_field_name) {
                        owner_id = owner_id[resource_field_name];
                    });
                    if (owner_id.equals(req.user._id)) {
                        it_checks_out = true;
                    };
                });

                if (it_checks_out) {
                    req.auth_checked = true;
                    next();
                } else {
                    res.status(401).json({
                        err: 'Logged in user does not have access to requested resource.'
                    });
                };
            });

        };

    };


    // apply the dynamic middleware-generating function to each route (there should be one for every api route)

    app.get('/api/messages/:convo_id', resourceBelongsToUser(['params', 'convo_id'], Convo));

    app.post('/api/messages', resourceBelongsToUser(['body', 'sender_id'], User));

    app.delete('/api/messages/:message_id/:convo_id', resourceBelongsToUser(['params', 'message_id'], Message),
                                                      resourceBelongsToUser(['params', 'convo_id'], Convo));

    // TODO: put in a custom function for checking that req.body.message_ids all have sender_id or receiver_id equal to req.user._id
    app.post('/api/assignMessagesToStrand/:strand_id/:convo_id', resourceBelongsToUser(['params', 'strand_id'], Strand),
                                                                 resourceBelongsToUser(['params', 'convo_id'], Convo));

    app.post('/api/unassignMessageFromStrand/:convo_id', resourceBelongsToUser(['body', 'message_id'], Message),
                                                         resourceBelongsToUser(['params', 'convo_id'], Convo));

    app.get('/api/strands/:convo_id', resourceBelongsToUser(['params', 'convo_id'], Convo));

    // TODO: put in a custom function for checking that either req.body.user_id_0 or req.body.user_id_1 are equal to req.user._id
    app.post('/api/strands', resourceBelongsToUser(['body', 'convo_id'], Convo));

    app.get('/api/convos/:user_id', resourceBelongsToUser(['params', 'user_id'], User));

    // TODO: put in a custom function for checking that either req.body.user_id_0 or req.body.user_id_1 are equal to req.user._id
    app.post('/api/convos', function(req, res, next) {req.auth_checked = true; next();});

    app.delete('/api/convos/:convo_id/:user_id', resourceBelongsToUser(['params', 'convo_id'], Convo),
                                                 resourceBelongsToUser(['params', 'user_id'], User));

    app.get('/api/users', function(req, res, next) {req.auth_checked = true; next();});

    app.delete('/api/users/:user_id', resourceBelongsToUser(['params', 'user_id'], User));


    // make sure that every request is approved by one of our auth-checking functions

    var authChecked = function(req, res, next) {
        if (req.auth_checked) {
            next();
        } else {
            res.status(500).json({
                err: 'Internal server error.'
            });
        };
    };
    app.all("/api/*", authChecked);


    // define the api route handlers

    // --- get messages for a convo
    app.get('/api/messages/:convo_id', function(req, res) {

        Message.find({
            'convo_id': req.params.convo_id
        }, function(err, messages) {
            if (err) {
                res.send(err)
            };

            res.json(messages);
        });

    });

    // --- create a message and send back the new message_id as well as messages for the convo after creation
    app.post('/api/messages', function(req, res) {

        Message.create({
            'text': req.body.text,
            'convo_id': req.body.convo_id,
            'sender_id': req.body.sender_id,
            'receiver_id': req.body.receiver_id,
            'time_sent': Date.parse(req.body.time_sent),
            'strand_id': req.body.strand_id
        }, function(err, message) {
            if (err) {
                res.send(err);
            };

            Message.find({
                'convo_id': req.body.convo_id
            }, function(err, messages) {
                if (err) {
                    res.send(err);
                };

                res.json(messages);
            });
        });

    });

    // --- delete a message and send back messages for the convo after deletion
    app.delete('/api/messages/:message_id/:convo_id', function(req, res) {

        Message.findOneAndRemove({
            '_id': req.params.message_id
        }, function(err, message) {
            if (err) {
                res.send(err);
            };

            // to trigger the middleware
            if (message) {
                message.remove();
            };

            Message.find({
                'convo_id': req.params.convo_id
            }, function(err, messages) {
                if (err) {
                    res.send(err);
                };

                res.json(messages);
            });
        });

    });

    // --- assign messages to a strand and send back messages for the convo after update
    app.post('/api/assignMessagesToStrand/:strand_id/:convo_id', function(req, res) {

        Message.update({
            _id: {$in: req.body.message_ids}
        }, {
            $set: {
                strand_id: req.params.strand_id
            }
        }, {
            multi: true
        }, function(err, numAffected) {

            // unfortunately have to call .emit() here instead of in a post hook on .update(), since mongoose doesn't have document middleware for .update()
            Convo.findOne({
                _id: req.params.convo_id
            }, function(err, convo) {
                var user_ids = [convo.user_id_0, convo.user_id_1];

                _.each(user_ids, function(user_id) {
                    io.to(user_id).emit('messages:receive_update', req.params.convo_id);
                });
            });

            Message.find({
                'convo_id': req.params.convo_id
            }, function(err, messages) {
                if (err) {
                    res.send(err);
                };

                res.json(messages);
            });
        });
    });

    // --- unassign a message from a strand and send back messages for the convo after update
    app.post('/api/unassignMessageFromStrand/:convo_id', function(req, res) {

        Message.update({
            _id: req.body.message_id
        }, {
            $unset: {
                strand_id: 1
            }
        }, function(err, numAffected) {

            // unfortunately have to call .emit() here instead of in a post hook on .update(), since mongoose doesn't have document middleware for .update()
            Convo.findOne({
                _id: req.params.convo_id
            }, function(err, convo) {
                var user_ids = [convo.user_id_0, convo.user_id_1];

                _.each(user_ids, function(user_id) {
                    io.to(user_id).emit('messages:receive_update', req.params.convo_id);
                });
            });

            Message.find({
                'convo_id': req.params.convo_id
            }, function(err, messages) {
                if (err) {
                    res.send(err);
                };

                res.json(messages);
            });
        });
    });

    // --- get strands for a convo
    app.get('/api/strands/:convo_id', function(req, res) {

        Strand.find({
            'convo_id': req.params.convo_id
        }, function(err, strands) {
            if (err) {
                res.send(err)
            };

            res.json(strands);
        });

    });

    // --- create a strand and send back the new strand_id as well as strands for the convo after creation
    app.post('/api/strands', function(req, res) {

        Strand.create({
            'convo_id': req.body.convo_id,
            'user_id_0': req.body.user_id_0,
            'user_id_1': req.body.user_id_1
        }, function(err, strand) {
            if (err) {
                res.send(err);
            };

            Strand.find({
                'convo_id': req.body.convo_id
            }, function(err, strands) {
                if (err) {
                    res.send(err);
                };

                res.json({strands: strands, new_strand: strand});
            });
        });

    });

    // --- get convos for a user
    app.get('/api/convos/:user_id', function(req, res) {

        Convo.find({
            $or: [{user_id_0: req.params.user_id}, {user_id_1: req.params.user_id}]
        }, function(err, convos) {
            if (err) {
                res.send(err);
            };

            res.json(convos);
        });

    });

    // --- create a convo and send back the new convo_id as well as convos for the user after creation
    app.post('/api/convos', function(req, res) {

        Convo.create({
            user_id_0: req.body.user_id_0,
            user_id_1: req.body.user_id_1
        }, function(err, convo) {
            if (err) {
                res.send(err);
            };

            Convo.find({
                $or: [{user_id_0: req.body.user_id_0}, {user_id_1: req.body.user_id_0}]
            }, function(err, convos) {
                if (err) {
                    res.send(err);
                };

                res.json({convos: convos, new_convo: convo});
            });
        });

    });

    // --- delete a convo and send back convos for the user after deletion
    app.delete('/api/convos/:convo_id/:user_id', function(req, res) {

        Convo.findOneAndRemove({
            _id: req.params.convo_id
        }, function(err, convo) {
            if (err) {
                res.send(err);
            };

            // to trigger the middleware
            if (convo) {
                convo.remove();
            };

            Convo.find({
                $or: [{user_id_0: req.params.user_id}, {user_id_1: req.params.user_id}]
            }, function(err, convos) {
                if (err) {
                    res.send(err)
                };

                res.json(convos);
            });
        });

    });

    // --- get all users
    app.get('/api/users', function(req, res) {

        User.find(function(err, users) {
            if (err) {
                res.send(err);
            };

            res.json(users);
        });

    });

    // --- delete user and send back all users after deletion
    app.delete('/api/users/:user_id', function(req, res) {

        User.findOneAndRemove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err) {
                res.send(err);
            };

            // to trigger the middleware
            if (user) {
                user.remove();
            };

            User.find(function(err, users) {
                if (err) {
                    res.send(err)
                };

                res.json(users);
            });
        });

    });

};
