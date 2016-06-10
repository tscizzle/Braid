var _ = require('underscore');


module.exports = function(io) {

    return function(socket) {

        // TODO: put auth around sockets?

        socket.on('room:join', function(user_data) {
            // leave any other rooms
            _.each(socket.adapter.rooms, function(room) {
                socket.leave(room);
            });

            // then join this user room
            socket.join(user_data._id);
        });

        socket.on('this_user_typing', function(recipient, typing_color) {
            io.to(recipient).emit('other_user_typing', recipient, typing_color);
        });

    };

};
