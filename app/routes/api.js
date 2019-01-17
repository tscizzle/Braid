var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(app, io) {
    var Message = require('../models/message')(io);
    var Strand = require('../models/strand')();
    var Convo = require('../models/convo')(io);
    var User = require('../models/user')(io);
    var Friendship = require('../models/friendship')(io);
    var AccountSettings = require('../models/account_settings')();

    var ObjectId = mongoose.Types.ObjectId;

    // make sure that every request is authenticated with a logged in user

    var loggedIn = function(req, res, next) {
        if (req.user) {
            return next();
        } else {
            return res.status(401).json({
                err: 'User not logged in.',
            });
        }
    };
    app.all('/api/*', loggedIn);

    // define a dynamic middleware-generating function that checks if a resource belongs to the logged in user

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
                    case Message:
                        return [['sender_id'], ['receiver_id']];
                    case Strand:
                        return [['user_id_0'], ['user_id_1']];
                    case Convo:
                        return [['user_id_0'], ['user_id_1']];
                    case User:
                        return [['_id']];
                    case Friendship:
                        return [['requester_id'], ['target_id']];
                    case AccountSettings:
                        return [['_id']];
                }
            };
            var resourcePathsToUserIds = modelToUserIdPathsMap(resourceModel);

            // get the resource id from the req based on reqPathToResourceId
            var resource_id = req;
            _.each(reqPathToResourceId, function(req_field_name) {
                resource_id = resource_id[req_field_name];
            });

            // if the request does not include the resource id, there is no ownership to check
            if (!resource_id) {
                return next();
            }

            resourceModel.findOne(
                {
                    _id: resource_id,
                },
                function(err, resource) {
                    if (!resource) {
                        return res.status(404).json({
                            err:
                                'One of the resources to be checked for auth does not exist.',
                        });
                    } else {
                        _.each(resourcePathsToUserIds, function(path) {
                            var owner_id = resource;
                            _.each(path, function(resource_field_name) {
                                owner_id = owner_id[resource_field_name];
                            });
                            if (owner_id.equals(req.user._id)) {
                                it_checks_out = true;
                            }
                        });

                        if (it_checks_out) {
                            return next();
                        } else {
                            return res.status(401).json({
                                err:
                                    'Logged in user does not have access to one of the involved resources.',
                            });
                        }
                    }
                }
            );
        };
    };

    // define some custom auth middleware for particular routes whose needs are outside the ability of the dynamic middleware-generating function

    var receiverIdIsFriend = function(reqPathToObj) {
        return function(req, res, next) {
            var resource = req;
            _.each(reqPathToObj, function(req_field_name) {
                resource = resource[req_field_name];
            });

            Friendship.find(
                {
                    $or: [
                        { requester_id: req.user._id },
                        { target_id: req.user._id },
                    ],
                    status: 'accepted',
                },
                function(err, friendships) {
                    var friend_ids = _.map(friendships, function(friendship) {
                        if (friendship.requester_id.equals(req.user._id)) {
                            return friendship.target_id;
                        } else if (friendship.target_id.equals(req.user._id)) {
                            return friendship.requester_id;
                        }
                    });

                    var isUsersFriend = function(other_user_id) {
                        return (
                            _.filter(friend_ids, function(friend_id) {
                                return friend_id == other_user_id;
                            }).length > 0
                        );
                    };

                    if (!isUsersFriend(resource.receiver_id)) {
                        return res.status(401).json({
                            err:
                                'Logged in user does not have access to one of the involved resources.',
                        });
                    } else {
                        return next();
                    }
                }
            );
        };
    };

    var messageIdsBelongToUser = function(reqPathToObj) {
        return function(req, res, next) {
            var resource = req;
            _.each(reqPathToObj, function(req_field_name) {
                resource = resource[req_field_name];
            });

            Message.find(
                {
                    _id: { $in: resource.message_ids },
                },
                function(err, messages) {
                    _.each(messages, function(message) {
                        if (
                            !(
                                message.sender_id.equals(req.user._id) ||
                                message.receiver_id.equals(req.user._id)
                            )
                        ) {
                            return res.status(401).json({
                                err:
                                    'Logged in user does not have access to one of the involved resources.',
                            });
                        }
                    });
                    return next();
                }
            );
        };
    };

    var userId0OrUserId1IsUser = function(reqPathToObj) {
        return function(req, res, next) {
            var resource = req;
            _.each(reqPathToObj, function(req_field_name) {
                resource = resource[req_field_name];
            });
            // use '==' instead of .equals() because these may be strings whereas we should use .equals() for ObjectId's
            if (
                !(
                    resource.user_id_0 == req.user._id ||
                    resource.user_id_1 == req.user._id
                )
            ) {
                return res.status(401).json({
                    err:
                        'Logged in user does not have access to one of the involved resources.',
                });
            } else {
                return next();
            }
        };
    };

    var otherUserIdXIsFriend = function(reqPathToObj) {
        return function(req, res, next) {
            var resource = req;
            _.each(reqPathToObj, function(req_field_name) {
                resource = resource[req_field_name];
            });

            Friendship.find(
                {
                    $or: [
                        { requester_id: req.user._id },
                        { target_id: req.user._id },
                    ],
                    status: 'accepted',
                },
                function(err, friendships) {
                    var friend_ids = _.map(friendships, function(friendship) {
                        if (friendship.requester_id.equals(req.user._id)) {
                            return friendship.target_id;
                        } else if (friendship.target_id.equals(req.user._id)) {
                            return friendship.requester_id;
                        }
                    });

                    var isUsersFriend = function(other_user_id) {
                        return (
                            _.filter(friend_ids, function(friend_id) {
                                return friend_id == other_user_id;
                            }).length > 0
                        );
                    };

                    // are user_id_0 and user_id_1 the logged in user and one of his/her friends
                    // use '==' instead of .equals() because these may be strings whereas we should use .equals() for ObjectId's
                    var ownersAreUserAndFriend =
                        (resource.user_id_0 == req.user._id &&
                            isUsersFriend(resource.user_id_1)) ||
                        (resource.user_id_1 == req.user._id &&
                            isUsersFriend(resource.user_id_0));

                    if (!ownersAreUserAndFriend) {
                        return res.status(401).json({
                            err:
                                'Logged in user does not have access to one of the involved resources.',
                        });
                    } else {
                        return next();
                    }
                }
            );
        };
    };

    var requesterIdOrTargetIdIsUser = function(paramsOrBody) {
        return function(req, res, next) {
            // use '==' instead of .equals() because these may be strings whereas we should use .equals() for ObjectId's
            if (
                !(
                    req[paramsOrBody].requester_id == req.user._id ||
                    req[paramsOrBody].target_id == req.user._id
                )
            ) {
                return res.status(401).json({
                    err:
                        'Logged in user does not have access to one of the involved resources.',
                });
            } else {
                return next();
            }
        };
    };

    var friendshipTargetIsUser = function(paramsOrBody) {
        return function(req, res, next) {
            Friendship.findOne(
                {
                    _id: req[paramsOrBody].friendship_id,
                },
                function(err, friendship) {
                    if (!friendship.target_id.equals(req.user._id)) {
                        return res.status(401).json({
                            err:
                                'Logged in user does not have access to one of the involved resources.',
                        });
                    } else {
                        return next();
                    }
                }
            );
        };
    };

    var userIdIsFriend = function(paramsOrBody) {
        return function(req, res, next) {
            Friendship.find(
                {
                    $or: [
                        { requester_id: req.user._id },
                        { target_id: req.user._id },
                    ],
                    status: 'accepted',
                },
                function(err, friendships) {
                    var friend_ids = _.map(friendships, function(friendship) {
                        if (friendship.requester_id.equals(req.user._id)) {
                            return friendship.target_id;
                        } else if (friendship.target_id.equals(req.user._id)) {
                            return friendship.requester_id;
                        }
                    });

                    var isUsersFriend = function(other_user_id) {
                        return (
                            _.filter(friend_ids, function(friend_id) {
                                return friend_id == other_user_id;
                            }).length > 0
                        );
                    };

                    if (!isUsersFriend(req[paramsOrBody].user_id)) {
                        return res.status(401).json({
                            err:
                                'Logged in user does not have access to one of the involved resources.',
                        });
                    } else {
                        return next();
                    }
                }
            );
        };
    };

    // define the api route handlers
    // every route should have authentication middleware preceding it

    // --- get messages for a convo
    app.get(
        '/api/messages/:convo_id/:num_messages',
        resourceBelongsToUser(['params', 'convo_id'], Convo)
    );
    app.get('/api/messages/:convo_id/:num_messages', function(req, res) {
        Message.find({
            convo_id: req.params.convo_id,
        })
            .sort({
                time_saved: -1,
            })
            .limit(parseInt(req.params.num_messages))
            .exec(function(err, messages) {
                if (err) return res.status(500).send(err);

                messages.reverse();
                return res.json(messages);
            });
    });

    // --- get counts of unread messages by convo
    app.get(
        '/api/getUnreadMessageCounts/:user_id',
        resourceBelongsToUser(['params', 'user_id'], User)
    );
    app.get('/api/getUnreadMessageCounts/:user_id', function(req, res) {
        const cursor = Message.aggregate([
            {
                $match: {
                    receiver_id: ObjectId(req.user._id),
                    time_read: { $exists: false },
                },
            },
            {
                $group: {
                    _id: '$convo_id',
                    num_unread_messages: {
                        $sum: 1,
                    },
                },
            },
        ])
            .cursor()
            .exec();

        var convo_unread_message_counts = {};
        cursor.each(function(err, message_count) {
            if (message_count) {
                convo_unread_message_counts[message_count._id] =
                    message_count.num_unread_messages;
            } else {
                return res.json(convo_unread_message_counts);
            }
        });
    });

    // --- create a message and send back the new message_id as well as messages for the convo after creation
    app.post(
        '/api/messages/:num_messages',
        resourceBelongsToUser(['body', 'sender_id'], User),
        resourceBelongsToUser(['body', 'strand_id'], Strand),
        resourceBelongsToUser(['body', 'convo_id'], Convo),
        receiverIdIsFriend(['body'])
    );
    app.post('/api/messages/:num_messages', function(req, res) {
        Message.create(
            {
                text: req.body.text,
                convo_id: req.body.convo_id,
                sender_id: req.body.sender_id,
                receiver_id: req.body.receiver_id,
                time_sent: Date.parse(req.body.time_sent),
                time_saved: Date.now(),
                strand_id: req.body.strand_id,
            },
            function(err, message) {
                if (err) return res.status(500).send(err);

                Message.find({
                    convo_id: req.body.convo_id,
                })
                    .sort({
                        time_saved: -1,
                    })
                    .limit(parseInt(req.params.num_messages))
                    .exec(function(err, messages) {
                        if (err) return res.status(500).send(err);

                        messages.reverse();
                        return res.json(messages);
                    });
            }
        );
    });

    // --- create a message on a new strand, potentially with some other messages, and send back messages, strands, and the new strand just created
    app.post(
        '/api/messagesNewStrand',
        resourceBelongsToUser(['body', 'message', 'sender_id'], User),
        resourceBelongsToUser(['body', 'message', 'convo_id'], Convo),
        receiverIdIsFriend(['body', 'message']),
        resourceBelongsToUser(['body', 'strand', 'convo_id'], Convo),
        userId0OrUserId1IsUser(['body', 'strand']),
        otherUserIdXIsFriend(['body', 'strand']),
        messageIdsBelongToUser(['body', 'strand_message_ids'])
    );
    app.post('/api/messagesNewStrand', function(req, res) {
        Strand.create(
            {
                convo_id: req.body.strand.convo_id,
                color_number: req.body.strand.color_number,
                time_created: Date.parse(req.body.strand.time_created),
                user_id_0: req.body.strand.user_id_0,
                user_id_1: req.body.strand.user_id_1,
            },
            function(err, new_strand) {
                if (err) return res.status(500).send(err);

                Message.update(
                    {
                        _id: { $in: req.body.strand_message_ids.message_ids },
                    },
                    {
                        $set: {
                            strand_id: new_strand._id,
                        },
                    },
                    {
                        multi: true,
                    },
                    function(err, numAffected) {
                        if (err) return res.status(500).send(err);

                        Message.create(
                            {
                                text: req.body.message.text,
                                convo_id: req.body.message.convo_id,
                                sender_id: req.body.message.sender_id,
                                receiver_id: req.body.message.receiver_id,
                                time_sent: Date.parse(
                                    req.body.message.time_sent
                                ),
                                time_saved: Date.now(),
                                strand_id: new_strand._id,
                            },
                            function(err, message) {
                                if (err) return res.status(500).send(err);

                                Strand.find(
                                    {
                                        convo_id: req.body.strand.convo_id,
                                    },
                                    function(err, strands) {
                                        if (err)
                                            return res.status(500).send(err);

                                        Message.find({
                                            convo_id: req.body.message.convo_id,
                                        })
                                            .sort({
                                                time_saved: -1,
                                            })
                                            .limit(
                                                parseInt(req.body.num_messages)
                                            )
                                            .exec(function(err, messages) {
                                                if (err)
                                                    return res
                                                        .status(500)
                                                        .send(err);

                                                messages.reverse();
                                                return res.json({
                                                    messages: messages,
                                                    strands: strands,
                                                    new_strand: new_strand,
                                                });
                                            });
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });

    // --- assign messages to a strand and send back messages for the convo after update
    app.post(
        '/api/assignMessagesToStrand/:strand_id/:convo_id',
        resourceBelongsToUser(['params', 'strand_id'], Strand),
        resourceBelongsToUser(['params', 'convo_id'], Convo),
        messageIdsBelongToUser(['body'])
    );
    app.post('/api/assignMessagesToStrand/:strand_id/:convo_id', function(
        req,
        res
    ) {
        Message.update(
            {
                _id: { $in: req.body.message_ids },
            },
            {
                $set: {
                    strand_id: req.params.strand_id,
                },
            },
            {
                multi: true,
            },
            function(err, numAffected) {
                if (err) return res.status(500).send(err);

                // unfortunately have to call .emit() here instead of in a post hook on .update(), since mongoose doesn't have document middleware for .update()
                Convo.findOne(
                    {
                        _id: req.params.convo_id,
                    },
                    function(err, convo) {
                        var user_ids = [convo.user_id_0, convo.user_id_1];

                        _.each(user_ids, function(user_id) {
                            io.to(user_id).emit('messages:receive_update', {
                                convo_id: req.params.convo_id,
                            });
                        });
                    }
                );

                Message.find({
                    convo_id: req.params.convo_id,
                })
                    .sort({
                        time_saved: -1,
                    })
                    .limit(parseInt(req.body.num_messages))
                    .exec(function(err, messages) {
                        if (err) return res.status(500).send(err);

                        messages.reverse();
                        return res.json(messages);
                    });
            }
        );
    });

    // --- unassign a message from a strand and send back messages for the convo after update
    app.post(
        '/api/unassignMessageFromStrand/:convo_id',
        resourceBelongsToUser(['body', 'message_id'], Message),
        resourceBelongsToUser(['params', 'convo_id'], Convo)
    );
    app.post('/api/unassignMessageFromStrand/:convo_id', function(req, res) {
        Message.update(
            {
                _id: req.body.message_id,
            },
            {
                $unset: {
                    strand_id: 1,
                },
            },
            function(err, numAffected) {
                if (err) return res.status(500).send(err);

                // unfortunately have to call .emit() here instead of in a post hook on .update(), since mongoose doesn't have document middleware for .update()
                Convo.findOne(
                    {
                        _id: req.params.convo_id,
                    },
                    function(err, convo) {
                        var user_ids = [convo.user_id_0, convo.user_id_1];

                        _.each(user_ids, function(user_id) {
                            io.to(user_id).emit('messages:receive_update', {
                                convo_id: req.params.convo_id,
                            });
                        });
                    }
                );

                Message.find({
                    convo_id: req.params.convo_id,
                })
                    .sort({
                        time_saved: -1,
                    })
                    .limit(parseInt(req.body.num_messages))
                    .exec(function(err, messages) {
                        if (err) return res.status(500).send(err);

                        messages.reverse();
                        return res.json(messages);
                    });
            }
        );
    });

    // --- mark messages as read and send back messages for the convo after update
    app.post(
        '/api/markMessagesAsRead/:convo_id',
        resourceBelongsToUser(['params', 'convo_id'], Convo),
        resourceBelongsToUser(['body', 'user_id'], User),
        messageIdsBelongToUser(['body'])
    );
    app.post('/api/markMessagesAsRead/:convo_id', function(req, res) {
        Message.update(
            {
                _id: { $in: req.body.message_ids },
                time_read: { $exists: false },
                receiver_id: req.body.user_id,
            },
            {
                $set: {
                    time_read: Date.parse(req.body.time_read),
                },
            },
            {
                multi: true,
            },
            function(err, numAffected) {
                if (err) return res.status(500).send(err);

                // unfortunately have to call .emit() here instead of in a post hook on .update(), since mongoose doesn't have document middleware for .update()
                Convo.findOne(
                    {
                        _id: req.params.convo_id,
                    },
                    function(err, convo) {
                        var user_ids = [convo.user_id_0, convo.user_id_1];

                        _.each(user_ids, function(user_id) {
                            io.to(user_id).emit('messages:receive_update', {
                                convo_id: req.params.convo_id,
                            });
                        });
                    }
                );

                /* Apple Dev account expired cuz I'm not using an iPhone. if want push notifications back, get account back and uncomment this */
                // User.findOne({
                //     _id: req.body.user_id
                // }, function(err, user) {
                //     user.sendPush();
                // });

                Message.find({
                    convo_id: req.params.convo_id,
                })
                    .sort({
                        time_saved: -1,
                    })
                    .limit(parseInt(req.body.num_messages))
                    .exec(function(err, messages) {
                        if (err) return res.status(500).send(err);

                        messages.reverse();
                        return res.json(messages);
                    });
            }
        );
    });

    // --- mark message as addressed and send back messages for the convo after update
    app.post(
        '/api/markMessageAsAddressed/:message_id/:convo_id',
        resourceBelongsToUser(['params', 'message_id'], Message),
        resourceBelongsToUser(['params', 'convo_id'], Convo)
    );
    app.post('/api/markMessageAsAddressed/:message_id/:convo_id', function(
        req,
        res
    ) {
        Message.update(
            {
                _id: req.params.message_id,
            },
            {
                $set: {
                    addressed: true,
                },
            },
            function(err, numAffected) {
                if (err) return res.status(500).send(err);

                Message.find({
                    convo_id: req.params.convo_id,
                })
                    .sort({
                        time_saved: -1,
                    })
                    .limit(parseInt(req.body.num_messages))
                    .exec(function(err, messages) {
                        if (err) return res.status(500).send(err);

                        messages.reverse();
                        return res.json(messages);
                    });
            }
        );
    });

    // --- mark messages in the strand as addressed and send back messages for the convo after update
    app.post(
        '/api/markStrandMessagesAsAddressed/:strand_id/:convo_id',
        resourceBelongsToUser(['params', 'strand_id'], Strand),
        resourceBelongsToUser(['params', 'convo_id'], Convo)
    );
    app.post(
        '/api/markStrandMessagesAsAddressed/:strand_id/:convo_id',
        function(req, res) {
            Message.update(
                {
                    strand_id: req.params.strand_id,
                    receiver_id: req.user._id,
                    time_saved: { $lt: new Date(req.body.timestamp) },
                },
                {
                    $set: {
                        addressed: true,
                    },
                },
                {
                    multi: true,
                },
                function(err, numAffected) {
                    if (err) return res.status(500).send(err);

                    Message.find({
                        convo_id: req.params.convo_id,
                    })
                        .sort({
                            time_saved: -1,
                        })
                        .limit(parseInt(req.body.num_messages))
                        .exec(function(err, messages) {
                            if (err) return res.status(500).send(err);

                            messages.reverse();
                            return res.json(messages);
                        });
                }
            );
        }
    );

    // --- delete a message and send back messages for the convo after deletion
    app.delete(
        '/api/messages/:message_id/:convo_id',
        resourceBelongsToUser(['params', 'message_id'], Message),
        resourceBelongsToUser(['params', 'convo_id'], Convo)
    );
    app.delete('/api/messages/:message_id/:convo_id', function(req, res) {
        Message.findOneAndRemove(
            {
                _id: req.params.message_id,
            },
            function(err, message) {
                if (err) return res.status(500).send(err);

                // to trigger the middleware
                if (message) {
                    message.remove();
                }

                Message.find({
                    convo_id: req.params.convo_id,
                })
                    .sort({
                        time_saved: -1,
                    })
                    .limit(parseInt(req.body.num_messages))
                    .exec(function(err, messages) {
                        if (err) return res.status(500).send(err);

                        messages.reverse();
                        return res.json(messages);
                    });
            }
        );
    });

    // --- get strands for a convo
    app.get(
        '/api/strands/:convo_id',
        resourceBelongsToUser(['params', 'convo_id'], Convo)
    );
    app.get('/api/strands/:convo_id', function(req, res) {
        Strand.find(
            {
                convo_id: req.params.convo_id,
            },
            function(err, strands) {
                if (err) return res.status(500).send(err);

                return res.json(strands);
            }
        );
    });

    // --- create a strand and send back the new strand_id as well as strands for the convo after creation
    app.post(
        '/api/strands',
        resourceBelongsToUser(['body', 'convo_id'], Convo),
        userId0OrUserId1IsUser(['body']),
        otherUserIdXIsFriend(['body'])
    );
    app.post('/api/strands', function(req, res) {
        Strand.create(
            {
                convo_id: req.body.convo_id,
                color_number: req.body.color_number,
                time_created: Date.parse(req.body.time_created),
                user_id_0: req.body.user_id_0,
                user_id_1: req.body.user_id_1,
            },
            function(err, strand) {
                if (err) return res.status(500).send(err);

                Strand.find(
                    {
                        convo_id: req.body.convo_id,
                    },
                    function(err, strands) {
                        if (err) return res.status(500).send(err);

                        return res.json({
                            strands: strands,
                            new_strand: strand,
                        });
                    }
                );
            }
        );
    });

    // --- get a single convo
    app.get(
        '/api/convo/:convo_id',
        resourceBelongsToUser(['params', 'convo_id'], Convo)
    );
    app.get('/api/convo/:convo_id', function(req, res) {
        Convo.findOne(
            {
                _id: req.params.convo_id,
            },
            function(err, convo) {
                if (err) return res.status(500).send(err);

                return res.json(convo);
            }
        );
    });

    // --- get convos for a user
    app.get(
        '/api/convos/:user_id',
        resourceBelongsToUser(['params', 'user_id'], User)
    );
    app.get('/api/convos/:user_id', function(req, res) {
        Convo.find(
            {
                $or: [
                    { user_id_0: req.params.user_id },
                    { user_id_1: req.params.user_id },
                ],
            },
            function(err, convos) {
                if (err) return res.status(500).send(err);

                return res.json(convos);
            }
        );
    });

    // --- get a convo for a pair of users
    app.get(
        '/api/convoFromUsers/:user_id_0/:user_id_1',
        userId0OrUserId1IsUser(['params']),
        otherUserIdXIsFriend(['params'])
    );
    app.get('/api/convoFromUsers/:user_id_0/:user_id_1', function(req, res) {
        Convo.findOne(
            {
                $or: [
                    {
                        user_id_0: req.params.user_id_0,
                        user_id_1: req.params.user_id_1,
                    },
                    {
                        user_id_0: req.params.user_id_1,
                        user_id_1: req.params.user_id_0,
                    },
                ],
            },
            function(err, convo) {
                if (err) return res.status(500).send(err);

                return res.json(convo);
            }
        );
    });

    // --- create a convo and send back the new convo_id as well as convos for the user after creation
    app.post(
        '/api/convos',
        userId0OrUserId1IsUser(['body']),
        otherUserIdXIsFriend(['body'])
    );
    app.post('/api/convos', function(req, res) {
        Convo.create(
            {
                user_id_0: req.body.user_id_0,
                user_id_1: req.body.user_id_1,
            },
            function(err, convo) {
                if (err) {
                    if (err.message === 'DuplicateConvo') {
                        return res.status(422).json({
                            err: 'Convo with those users already exists.',
                        });
                    } else {
                        return res.status(500).send(err);
                    }
                }

                Convo.find(
                    {
                        $or: [
                            { user_id_0: req.body.user_id_0 },
                            { user_id_1: req.body.user_id_0 },
                        ],
                    },
                    function(err, convos) {
                        if (err) return res.status(500).send(err);

                        return res.json({ convos: convos, new_convo: convo });
                    }
                );
            }
        );
    });

    // --- delete a convo and send back convos for the user after deletion
    app.delete(
        '/api/convos/:convo_id/:user_id',
        resourceBelongsToUser(['params', 'convo_id'], Convo),
        resourceBelongsToUser(['params', 'user_id'], User)
    );
    app.delete('/api/convos/:convo_id/:user_id', function(req, res) {
        Convo.findOneAndRemove(
            {
                _id: req.params.convo_id,
            },
            function(err, convo) {
                if (err) return res.status(500).send(err);

                // to trigger the middleware
                if (convo) {
                    convo.remove();
                }

                Convo.find(
                    {
                        $or: [
                            { user_id_0: req.params.user_id },
                            { user_id_1: req.params.user_id },
                        ],
                    },
                    function(err, convos) {
                        if (err) return res.status(500).send(err);

                        return res.json(convos);
                    }
                );
            }
        );
    });

    // --- get a single username
    // this route doesn't have any special authentication
    app.get('/api/username/:user_id', function(req, res) {
        User.findOne(
            {
                _id: req.params.user_id,
            },
            {
                username: 1,
            },
            function(err, user) {
                if (err) return res.status(500).send(err);

                return res.json(user);
            }
        );
    });

    // --- get all usernames
    // this route doesn't have any special authentication
    app.get('/api/usernames', function(req, res) {
        var user_query = {};
        if (req.query.substring) {
            user_query.username = { $regex: req.query.substring };
        }

        User.find(
            user_query,
            {
                username: 1,
            },
            function(err, users) {
                if (err) return res.status(500).send(err);

                return res.json(users);
            }
        );
    });

    // --- get all users who are friends of the user
    app.get(
        '/api/friendUsernames/:user_id',
        resourceBelongsToUser(['params', 'user_id'], User)
    );
    app.get('/api/friendUsernames/:user_id', function(req, res) {
        Friendship.find(
            {
                $or: [
                    { requester_id: req.params.user_id },
                    { target_id: req.params.user_id },
                ],
            },
            function(err, friendships) {
                if (err) return res.status(500).send(err);

                var friend_ids = _.map(friendships, function(friendship) {
                    if (friendship.requester_id == req.params.user_id) {
                        return friendship.target_id;
                    } else if (friendship.target_id == req.params.user_id) {
                        return friendship.requester_id;
                    }
                });

                User.find(
                    {
                        _id: { $in: friend_ids },
                    },
                    {
                        username: 1,
                    },
                    function(err, friend_users) {
                        if (err) return res.status(500).send(err);

                        return res.json(friend_users);
                    }
                );
            }
        );
    });

    // --- update a user to have a new device and send back the user after update
    app.post(
        '/api/addDeviceIDForUser/:user_id',
        resourceBelongsToUser(['params', 'user_id'], User)
    );
    app.post('/api/addDeviceIDForUser/:user_id', function(req, res) {
        User.findOneAndUpdate(
            {
                _id: req.params.user_id,
                'devices.id': { $ne: req.body.device_id },
            },
            {
                $push: {
                    devices: {
                        id: req.body.device_id,
                        platform: req.body.platform,
                        time_stored: new Date(),
                    },
                },
            },
            {
                runValidators: true,
                new: true,
            },
            function(err, user) {
                if (err) return res.status(500).send(err);

                return res.json(user);
            }
        );
    });

    // --- delete user and send back all users after deletion
    app.delete(
        '/api/users/:user_id',
        resourceBelongsToUser(['params', 'user_id'], User)
    );
    app.delete('/api/users/:user_id', function(req, res) {
        User.findOneAndRemove(
            {
                _id: req.params.user_id,
            },
            function(err, user) {
                if (err) return res.status(500).send(err);

                // to trigger the middleware
                if (user) {
                    user.remove();
                }

                User.find(function(err, users) {
                    if (err) return res.status(500).send(err);

                    return res.json(users);
                });
            }
        );
    });

    // --- get friendships for a user
    app.get(
        '/api/friendships/:user_id',
        resourceBelongsToUser(['params', 'user_id'], User)
    );
    app.get('/api/friendships/:user_id', function(req, res) {
        Friendship.find(
            {
                $or: [
                    { requester_id: req.params.user_id },
                    { target_id: req.params.user_id },
                ],
            },
            function(err, friendships) {
                if (err) return res.status(500).send(err);

                return res.json(friendships);
            }
        );
    });

    // --- create a friendship and send back the new friendship_id as well as friendships for the user after creation
    app.post('/api/friendships', requesterIdOrTargetIdIsUser('body'));
    app.post('/api/friendships', function(req, res) {
        User.findOne(
            {
                username: req.body.username,
            },
            function(err, user) {
                if (err) return res.status(500).send(err);

                if (!user) {
                    return res.status(422).json({
                        err: 'No user found with that username.',
                    });
                } else if (user._id.equals(req.user._id)) {
                    return res.status(422).json({
                        err: 'Target user is the same as the requesting user.',
                    });
                } else {
                    Friendship.create(
                        {
                            requester_id: req.body.requester_id,
                            target_id: user._id,
                            status: 'pending',
                        },
                        function(err, friendship) {
                            if (err) {
                                if (err.message === 'DuplicateFriendship') {
                                    return res.status(422).json({
                                        err:
                                            'Friendship with those users already exists.',
                                    });
                                } else {
                                    return res.status(500).send(err);
                                }
                            }

                            Friendship.find(
                                {
                                    $or: [
                                        { requester_id: req.body.requester_id },
                                        { target_id: req.body.requester_id },
                                    ],
                                },
                                function(err, friendships) {
                                    if (err) return res.status(500).send(err);

                                    return res.json(friendships);
                                }
                            );
                        }
                    );
                }
            }
        );
    });

    // --- update a friendship to be accepted and send back friendships for the user after update
    app.post(
        '/api/friendships/accept/:friendship_id/:user_id',
        resourceBelongsToUser(['params', 'friendship_id'], Friendship),
        resourceBelongsToUser(['params', 'user_id'], User),
        friendshipTargetIsUser('params')
    );
    app.post('/api/friendships/accept/:friendship_id/:user_id', function(
        req,
        res
    ) {
        Friendship.update(
            {
                _id: req.params.friendship_id,
            },
            {
                $set: {
                    status: 'accepted',
                },
            },
            function(err, numAffected) {
                if (err) return res.status(500).send(err);

                // unfortunately have to call .emit() here instead of in a post hook on .update(), since mongoose doesn't have document middleware for .update()
                Friendship.findOne(
                    {
                        _id: req.params.friendship_id,
                    },
                    function(err, friendship) {
                        var user_ids = [
                            friendship.requester_id,
                            friendship.target_id,
                        ];

                        _.each(user_ids, function(user_id) {
                            io.to(user_id).emit(
                                'friendships:receive_update',
                                req.params.user_id
                            );
                        });
                    }
                );

                Friendship.find(
                    {
                        $or: [
                            { requester_id: req.params.user_id },
                            { target_id: req.params.user_id },
                        ],
                    },
                    function(err, friendships) {
                        if (err) return res.status(500).send(err);

                        return res.json(friendships);
                    }
                );
            }
        );
    });

    // --- delete a friendship and send back friendships for the user after deletion
    app.delete(
        '/api/friendships/:friendship_id/:user_id',
        resourceBelongsToUser(['params', 'friendship_id'], Friendship),
        resourceBelongsToUser(['params', 'user_id'], User)
    );
    app.delete('/api/friendships/:friendship_id/:user_id', function(req, res) {
        Friendship.findOneAndRemove(
            {
                _id: req.params.friendship_id,
            },
            function(err, friendship) {
                if (err) return res.status(500).send(err);

                // to trigger the middleware
                if (friendship) {
                    friendship.remove();
                }

                Friendship.find(
                    {
                        $or: [
                            { requester_id: req.params.user_id },
                            { target_id: req.params.user_id },
                        ],
                    },
                    function(err, friendships) {
                        if (err) return res.status(500).send(err);

                        return res.json(friendships);
                    }
                );
            }
        );
    });

    // --- get an account settings for a user
    app.get(
        '/api/account_settings/:user_id',
        resourceBelongsToUser(['params', 'user_id'], AccountSettings)
    );
    app.get('/api/account_settings/:user_id', function(req, res) {
        AccountSettings.findOne(
            {
                _id: req.params.user_id,
            },
            function(err, account_settings) {
                if (err) return res.status(500).send(err);

                return res.json(account_settings);
            }
        );
    });

    // --- get a profile pic for a friend
    app.get(
        '/api/account_settings/friendProfilePic/:user_id',
        userIdIsFriend('params')
    );
    app.get('/api/account_settings/friendProfilePic/:user_id', function(
        req,
        res
    ) {
        AccountSettings.findOne(
            {
                _id: req.params.user_id,
            },
            {
                profile_pic_url: 1,
            },
            function(err, account_settings) {
                if (err) return res.status(500).send(err);

                return res.json(account_settings);
            }
        );
    });

    // --- update an account settings and send it back after update
    app.post(
        '/api/account_settings/:user_id',
        resourceBelongsToUser(['params', 'user_id'], AccountSettings)
    );
    app.post('/api/account_settings/:user_id', function(req, res) {
        var updateDoc = {};
        updateDoc[req.body.field] = req.body.value;

        AccountSettings.findOneAndUpdate(
            {
                _id: req.params.user_id,
            },
            {
                $set: updateDoc,
            },
            {
                runValidators: true,
                new: true,
            },
            function(err, account_settings) {
                if (err) return res.status(500).send(err);

                io.to(account_settings._id).emit(
                    'account_settings:receive_update'
                );

                return res.json(account_settings);
            }
        );
    });
};
