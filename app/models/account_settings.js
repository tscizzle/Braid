var mongoose = require('mongoose');


module.exports = function() {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var accountSettingsSchema = new Schema({
        _id: {type: ObjectId, ref: 'User', required: true},
        sound_on: {type: Boolean, default: false},
        profile_pic_url: String,
        digest_enabled: {type: Boolean, default: true}
    });

    // if the model already exists, use the existing model
    return mongoose.models.AccountSettings || mongoose.model('AccountSettings', accountSettingsSchema);

};
