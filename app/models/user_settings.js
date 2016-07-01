var mongoose = require('mongoose');


module.exports = function(io) {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var userSettingsSchema = new Schema({
        _id: {type: ObjectId, ref: 'User', required: true},
        sound_on: {type: Boolean, default: false}
    });

    // if the model already exists, use the existing model
    return mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema);

};
