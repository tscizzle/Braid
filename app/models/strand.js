var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.ObjectId;

module.exports = mongoose.model('Strand', {
    convo_id: {type: ObjectId, ref: 'Convo', required: true}
});
