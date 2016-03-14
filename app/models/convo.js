var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(io) {

    var Message = mongoose.models.Message || require('./message')(io);
    var Strand = mongoose.models.Strand || require('./strand')(io);

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var convoSchema = new Schema({
        user_id_0: {type: ObjectId, ref: 'User', required: true},
        user_id_1: {type: ObjectId, ref: 'User', required: true}
    });

    convoSchema.post('remove', function() {
        // find, loop, and instance-level remove, instead of simply model-level remove all at once which doesn't trigger middleware hooks
        Message.find({convo_id: this._id}, function(err, messages) {
            _.each(messages, function(message) {
                message.remove();
            });
        });
        Strand.find({convo_id: this._id}, function(err, strands) {
            _.each(strands, function(strand) {
                strand.remove();
            });
        });
    });

    return mongoose.model('Convo', convoSchema);

};
