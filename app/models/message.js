var mongoose = require('mongoose');


module.exports = function(io) {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var messageSchema = new Schema({
        text: {type: String, required: true},
        convo_id: {type: ObjectId, ref: 'Convo', required: true},
        sender_id: {type: ObjectId, ref: 'User', required: true},
        receiver_id: {type: ObjectId, ref: 'User', required: true},
        strand_id: {type: ObjectId, ref: 'Strand'},
        time_sent: {type: Date, required: true},
        time_saved: {type: Date, required: true},
        time_received: Date,
        time_read: Date,
        addressed: {type: Boolean, default: false}
    });

    messageSchema.post('save', function() {
        io.to(this.receiver_id).emit('messages:receive_update', {
            convo_id: this.convo_id,
            strand_id: this.strand_id,
            receiver_id: this.receiver_id,
            play_message_sound: true
        });
        io.to(this.sender_id).emit('messages:receive_update', {
            convo_id: this.convo_id,
            strand_id: this.strand_id,
            receiver_id: this.receiver_id
        });
    });

    messageSchema.post('remove', function() {
        io.to(this.receiver_id).emit('messages:receive_update', {
            convo_id: this.convo_id,
            strand_id: this.strand_id,
            receiver_id: this.receiver_id
        });
        io.to(this.sender_id).emit('messages:receive_update', {
            convo_id: this.convo_id,
            strand_id: this.strand_id,
            receiver_id: this.receiver_id
        });
    });

    // if the model already exists, use the existing model
    return mongoose.models.Message || mongoose.model('Message', messageSchema);

};
