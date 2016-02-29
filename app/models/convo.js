var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Convo', {
    user_id_0: {type: ObjectId, required: true},
    user_id_1: {type: ObjectId, required: true}
});
