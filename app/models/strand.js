var mongoose = require('mongoose');


module.exports = function() {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var strandSchema = new Schema({
        convo_id: {type: ObjectId, ref: 'Convo', required: true, index: true},
        color_number: {type: Number, required: true},
        time_created: {type: Date, required: true},
        user_id_0: {type: ObjectId, ref: 'User', required: true},
        user_id_1: {type: ObjectId, ref: 'User', required: true}
    });

    // if the model already exists, use the existing model
    return mongoose.models.Strand || mongoose.model('Strand', strandSchema);

};
