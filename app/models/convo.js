var mongoose = require('mongoose');
var Message = require('./message');
var Strand = require('./strand');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var convoSchema = new Schema({
    user_id_0: {type: ObjectId, ref: 'User', required: true},
    user_id_1: {type: ObjectId, ref: 'User', required: true}
});

convoSchema.post('remove', function() {
    Message.remove({convo_id: this._id}).exec();
    Strand.remove({convo_id: this._id}).exec();
});

module.exports = mongoose.model('Convo', convoSchema);
