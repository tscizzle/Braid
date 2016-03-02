var mongoose = require('mongoose');

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

module.exports = mongoose.model('Message', messageSchema);
