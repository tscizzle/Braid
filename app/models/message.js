var mongoose = require('mongoose');
var _ = require('underscore');


module.exports = function(io) {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var messageSchema = new Schema({
        text: {type: String, required: true},
        convo_id: {type: ObjectId, ref: 'Convo', required: true, index: true},
        sender_id: {type: ObjectId, ref: 'User', required: true},
        receiver_id: {type: ObjectId, ref: 'User', required: true},
        strand_id: {type: ObjectId, ref: 'Strand'},
        time_sent: {type: Date, required: true},
        time_saved: {type: Date, required: true, index: true},
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

    messageSchema.post('save', function() {
        var user_model = this.model('User');
        var message_model = this.model('Message');
        var receiver_id = this.receiver_id;
        var sender_id = this.sender_id;
        var text = this.text;
        var payload = {convo_id: this.convo_id};
        user_model.findOne(receiver_id).exec(function(err, receiver) {
            user_model.findOne(sender_id).exec(function(err, sender) {
                var sender_username = sender.username;
                receiver.sendPush(sender_username, text, payload);
            });
        });
    });

    messageSchema.post('save', function() {
        var convo_model = this.model('Convo');
        convo_model.findOne(this.convo_id).exec(function(err, convo) {
            if (convo) convo.setLastMessageTime();
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

    messageSchema.post('remove', function() {
        var convo_model = this.model('Convo');
        convo_model.findOne(this.convo_id).exec(function(err, convo) {
            if (convo) convo.setLastMessageTime();
        });
    });

    // if the model already exists, use the existing model
    return mongoose.models.Message || mongoose.model('Message', messageSchema);

};
