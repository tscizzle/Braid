var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Message', {
    text: {type: String, required: true},
    convo_id: {type: ObjectId, ref: 'Convo', required: true},
    sender_id: {type: ObjectId, required: true},
    receiver_id: {type: ObjectId, required: true},
    time_sent: Date,
    time_received: Date,
    strand_id: {type: ObjectId, ref: 'Strand'}
});
