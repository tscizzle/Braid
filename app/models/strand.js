var mongoose = require('mongoose');

module.exports = function(io) {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var strandSchema = new Schema({
        convo_id: {type: ObjectId, ref: 'Convo', required: true},
        color: String,
        time_created: Date
    });

    // if the model already exists, use the existing model
    return mongoose.models.Strand || mongoose.model('Strand', strandSchema);

};
