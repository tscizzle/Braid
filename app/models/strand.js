var mongoose = require('mongoose');

module.exports = function(io) {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var strandSchema = new Schema({
        convo_id: {type: ObjectId, ref: 'Convo', required: true}
    });

    return mongoose.model('Strand', strandSchema);

};
