var _ = require('underscore');


module.exports = function(io) {

    return function(socket) {

        socket.on('room:join', function(user_data) {
            // leave any other rooms
            _.each(socket.rooms, function(room) {
                socket.leave(room);
            });

            // then join this user room
            socket.join(user_data._id);
        });

        socket.on('this_user_typing', function(recipient) {
            io.to(recipient).emit('other_user_typing', recipient)
        });

    };

};
