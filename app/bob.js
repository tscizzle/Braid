var mongoose = require('mongoose');
var _ = require('underscore');


module.exports = function(io) {

    var Message = require('./models/message')(io);
    var Strand = require('./models/strand')(io);
    var Convo = require('./models/convo')(io);
    var User = require('./models/user')(io);
    var Friendship = require('./models/friendship')(io);

    var ObjectId = mongoose.Types.ObjectId;


    var createBob = function() {

        User.findOne({username: 'bob'}, function(err, user) {
            if (!user) {

                User.register(new User({username: 'bob'}), process.env.BOB_PASSWORD);

            };
        });

    };


    var befriendBob = function(new_user, res, callback) {

        User.findOne({username: 'bob'}, {_id: 1}, function(err, bob) {
            if (err) {return callback(err, bob);};

            var bob_id = bob._id;
            var new_user_id = new_user._id;

            Friendship.create({
                requester_id: bob_id,
                target_id: new_user_id,
                status: 'accepted'
            }, function(err, friendship) {
                if (err) {return callback(err, bob);};

                Convo.create({
                    user_id_0: bob_id,
                    user_id_1: new_user_id
                }, function(err, convo) {
                    if (err) {return callback(err, bob);};

                    var convo_id = convo._id;

                    var intro_strands = [{
                        color_number: 0
                    }, {
                        color_number: 1
                    }, {
                        color_number: 2
                    }, {
                        color_number: 3
                    }];
                    _.each(intro_strands, function(strand) {
                        strand.convo_id = convo_id;
                        strand.time_created = new Date();
                        strand.user_id_0 = bob_id;
                        strand.user_id_1 = new_user_id;
                    });

                    Strand.create(intro_strands, function(err, strands) {
                        if (err) {return callback(err, bob);};

                        var strand_ids = _.map(strands, function(strand) {
                            return strand._id;
                        });
                        var strand_id_0 = strand_ids[0];
                        var strand_id_1 = strand_ids[1];
                        var strand_id_2 = strand_ids[2];
                        var strand_id_3 = strand_ids[3];

                        var intro_messages = [{
                            text: 'Hi! I\'m Bob. Here\'s a quick intro to using this thing!',
                            sender_id: bob_id,
                            receiver_id: new_user_id,
                            strand_id: strand_id_0
                        }, {
                            text: 'This Message is part of a Strand, as shown by its being colored.',
                            sender_id: bob_id,
                            receiver_id: new_user_id,
                            strand_id: strand_id_1
                        }, {
                            text: 'This Message is NOT part of a Strand, as shown by its NOT being colored.',
                            sender_id: bob_id,
                            receiver_id: new_user_id
                        }, {
                            text: 'Wow! And my Messages can be in the same Strand as your Messages?',
                            sender_id: new_user_id,
                            receiver_id: bob_id,
                            strand_id: strand_id_1
                        }, {
                            text: 'Yep. To respond to a particular Strand, first select that Strand by clicking any Message in that Strand, and then send a Message while that Strand is selected.',
                            sender_id: bob_id,
                            receiver_id: new_user_id,
                            strand_id: strand_id_1
                        }, {
                            text: 'When no Strand is selected, you can prime Messages that aren\'t in a Strand yet by clicking them, and then send a new Message to create a new Strand containing those primed messages.',
                            sender_id: bob_id,
                            receiver_id: new_user_id,
                            strand_id: strand_id_2
                        }, {
                            text: 'You can add friends by typing their username into the form in the Friends pane on the right and clicking Request.',
                            sender_id: bob_id,
                            receiver_id: new_user_id,
                            strand_id: strand_id_3
                        }, {
                            text: 'Unrelated point (great opportunity for a new Strand, try clicking me and then responding), do you like guacamole? I forgot to ask.',
                            sender_id: bob_id,
                            receiver_id: new_user_id
                        }];
                        _.each(intro_messages, function(message, index) {
                            var now = new Date();
                            var time_sent = now.setMinutes(now.getMinutes() - intro_messages.length + index);
                            message.convo_id = convo_id;
                            message.time_sent = time_sent;
                        });

                        Message.create(intro_messages, function(err, messages) {
                            if (err) {return callback(err, bob);};

                            return callback(err, bob);
                        });

                    });

                });

            });

        });

    };


    return {
        createBob: createBob,
        befriendBob: befriendBob
    };

};
