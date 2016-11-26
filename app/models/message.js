var mongoose = require('mongoose');
var _ = require('underscore');
var apn = require('apn');
var apnProvider = require('../config/apn-provider');


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

    messageSchema.post('save', function() {
        var user_model = this.model('User');
        var message_model = this.model('Message');
        var receiver_id = this.receiver_id;
        var sender_id = this.sender_id;
        var text = this.text;
        user_model.findOne(receiver_id).exec(function(err, receiver) {
            var devices = receiver.devices;
            user_model.findOne(sender_id).exec(function(err, sender) {
                var sender_username = sender.username;
                message_model.count({
                    receiver_id: receiver_id,
                    time_read: {
                        $exists: false
                    }
                }).exec(function(err, unread_count) {
                    _.each(devices, function(device) {
                        var device_id = device.id;
                        var note = new apn.Notification();
                        note.expiry = Math.floor(Date.now() / 1000) + 3600;
                        note.title = sender_username;
                        note.body = text;
                        note.badge = unread_count;
                        apnProvider.send(note, device_id).then(function(result) {
                            if (!_.isEmpty(result.failed)) {
                                console.log('\nERROR SENDING PUSH AFTER MESSAGE SEND\n', result.failed);
                            };
                        });
                    });
                });
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
