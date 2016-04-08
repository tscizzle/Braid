var mongoose = require('mongoose');
var _ = require('underscore');


module.exports = function(io) {

    var Convo = require('./convo')(io);

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var friendshipSchema = new Schema({
        requester_id: {type: ObjectId, ref: 'User', required: true},
        target_id: {type: ObjectId, ref: 'User', required: true},
        status: {type: String, required: true}
    });

    friendshipSchema.post('save', function() {
        io.to(this.requester_id).emit('friendships:receive_update');
        io.to(this.target_id).emit('friendships:receive_update');
    });

    friendshipSchema.post('remove', function() {
        io.to(this.requester_id).emit('friendships:receive_update');
        io.to(this.target_id).emit('friendships:receive_update');

        // find, loop, and instance-level remove, instead of simply model-level remove all at once which doesn't trigger middleware hooks
        Convo.find({
            $or: [{
                user_id_0: this.requester_id,
                user_id_1: this.target_id
            }, {
                user_id_0: this.target_id,
                user_id_1: this.requester_id
            }]
        }, function(err, convos) {
            _.each(convos, function(convo) {
                convo.remove();
            });
        });
    });

    // if the model already exists, use the existing model
    return mongoose.models.Friendship || mongoose.model('Friendship', friendshipSchema);

};
