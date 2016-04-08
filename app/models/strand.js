var mongoose = require('mongoose');

module.exports = function(io) {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var strandSchema = new Schema({
        convo_id: {type: ObjectId, ref: 'Convo', required: true},
        color: {type: String, required: true},
        time_created: {Date, required: true},
        user_id_0: {type: ObjectId, ref: 'User', required: true},
        user_id_1: {type: ObjectId, ref: 'User', required: true}
    });

    // if the model already exists, use the existing model
    return mongoose.models.Strand || mongoose.model('Strand', strandSchema);

};
