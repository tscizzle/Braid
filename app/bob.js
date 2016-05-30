var mongoose = require('mongoose');


module.exports = function(io) {

    var Message = require('./models/message')(io);
    var Strand = require('./models/strand')(io);
    var Convo = require('./models/convo')(io);
    var User = require('./models/user')(io);
    var Friendship = require('./models/friendship')(io);

    var ObjectId = mongoose.Types.ObjectId;


    var createBob = function() {

        User.findOne({username: 'bob'}, function(err, user) {
            if (err) {
                return res.status(500).send(err);
            };

            if (!user) {
                // TODO: pass the password in as an environment variable
                User.register(new User({username: 'bob'}), process.env.BOB_PASSWORD, function(err, user) {
                    if (err) {
                        return res.status(500).json({
                            err: err
                        });
                    };
                });
            };
        });

    };


    var befriendBob = function(new_user) {

        User.findOne({username: 'bob'}, {_id: 1}, function(err, bob) {
            if (err) {
                return res.status(500).json({
                    err: err
                });
            };

            var bob_id = bob._id;
            var new_user_id = new_user._id;

            // TODO: make friendship between new_user and bob
            // TODO: make convo between new_user and bob
            // TODO: make
        });

    };


    return {
        createBob: createBob,
        befriendBob: befriendBob
    };

};
