var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var strandSchema = new Schema({
    convo_id: {type: ObjectId, ref: 'Convo', required: true}
});

module.exports = mongoose.model('Strand', strandSchema);
