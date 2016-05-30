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
                User.register(new User({username: 'bob'}), 'bobby_password', function(err, user) {
                    if (err) {
                        return res.status(500).json({
                            err: err
                        });
                    };
                });
            };
        });

    };


    var befriendBob = function(username) {

        console.log(username + ' befriended bob');

    };


    return {
        createBob: createBob,
        befriendBob: befriendBob
    };

};
