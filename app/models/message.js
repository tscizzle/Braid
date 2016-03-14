var mongoose = require('mongoose');

module.exports = function(io) {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var messageSchema = new Schema({
        text: {type: String, required: true},
        convo_id: {type: ObjectId, ref: 'Convo', required: true},
        sender_id: {type: ObjectId, ref: 'User', required: true},
        receiver_id: {type: ObjectId, ref: 'User', required: true},
        time_sent: Date,
        time_received: Date,
        strand_id: {type: ObjectId, ref: 'Strand'}
    });

    messageSchema.post('save', function() {
        io.to(this.receiver_id).emit('messages:receive_update', this.convo_id);
        io.to(this.sender_id).emit('messages:receive_update', this.convo_id);
    });

    messageSchema.post('remove', function() {
        io.to(this.receiver_id).emit('messages:receive_update', this.convo_id);
        io.to(this.sender_id).emit('messages:receive_update', this.convo_id);
    });

    return mongoose.model('Message', messageSchema);

};
