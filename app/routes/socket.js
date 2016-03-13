module.exports = function(socket) {

    socket.on('room:join', function(user_data) {
        // TODO: seems rooms are not joined properly at the beginning
        socket.join(user_data._id);
    });

    socket.on('message:send', function(message_data) {
        socket.to(message_data.receiver_id).emit('message:receive', message_data);
    });

};
