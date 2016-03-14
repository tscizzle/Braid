module.exports = function(socket) {

    socket.on('room:join', function(user_data) {
        socket.join(user_data._id);
    });

};
