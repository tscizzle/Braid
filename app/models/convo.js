var mongoose = require('mongoose');
var _ = require('underscore');


module.exports = function(io) {

    var Message = require('./message')(io);
    var Strand = require('./strand')(io);

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var convoSchema = new Schema({
        user_id_0: {type: ObjectId, ref: 'User', required: true},
        user_id_1: {type: ObjectId, ref: 'User', required: true}
    });

    convoSchema.pre('validate', function(next) {
        Convo = mongoose.models.Convo;
        Convo.findOne({
            $or: [{
                user_id_0: this.user_id_0,
                user_id_1: this.user_id_1
            }, {
                user_id_0: this.user_id_1,
                user_id_1: this.user_id_0
            }]
        }, function(err, convo) {
            if (convo) {
                return next(Error('DuplicateConvo'));
            } else {
                return next();
            };
        });
    });

    convoSchema.post('save', function() {
        io.to(this.user_id_0).emit('convos:receive_update');
        io.to(this.user_id_1).emit('convos:receive_update');
    });

    convoSchema.post('remove', function() {
        io.to(this.user_id_0).emit('convos:receive_update');
        io.to(this.user_id_1).emit('convos:receive_update');

        // find, loop, and instance-level remove, instead of simply model-level remove all at once which doesn't trigger middleware hooks
        Message.find({convo_id: this._id}, function(err, messages) {
            _.each(messages, function(message) {
                message.remove();
            });
        });
        // find, loop, and instance-level remove, instead of simply model-level remove all at once which doesn't trigger middleware hooks
        Strand.find({convo_id: this._id}, function(err, strands) {
            _.each(strands, function(strand) {
                strand.remove();
            });
        });
    });

    // if the model already exists, use the existing model
    return mongoose.models.Convo || mongoose.model('Convo', convoSchema);

};
