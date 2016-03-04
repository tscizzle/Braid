var mongoose = require('mongoose');
var _ = require('underscore');
var Convo = require('./convo');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {type: String, required: true}
});

userSchema.pre('remove', function(next) {
    console.log('at least did pre remove');
    next();
});

userSchema.post('remove', function() {
    // find, loop, and instance-level remove, instead of simply model-level remove all at once which doesn't trigger middleware hooks
    Convo.find({$or: [{user_id_0: this._id}, {user_id_1: this._id}]}, function(err, convos) {
        _.each(convos, function(convo) {
            convo.remove();
        });
    });
});

module.exports = mongoose.model('User', userSchema);
