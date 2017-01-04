var mongoose = require('mongoose');
var _ = require('underscore');
var passportLocalMongoose = require('passport-local-mongoose');
var apn = require('apn');
var apnProvider = require('../config/apn-provider');


module.exports = function(io) {

    var Message = require('./message')(io);
    var Convo = require('./convo')(io);
    var Friendship = require('./friendship')(io);
    var AccountSettings = require('./account_settings')();

    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        username: {type: String, required: true, unique: true},
        email: String,
        devices: [{
            id: {type: String, required: true},
            platform: {type: String, required: true, enum: ['ios']},
            time_stored: {type: Date, required: true},
            _id: false
        }],
        last_digest_time: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date
    });

    userSchema.pre('save', function(next) {
        if (this.isNew) {
            AccountSettings.create({
                _id: this._id
            }, function(err, account_settings) {
                if (err) return next(err);

                next();
            });
        } else {
            next();
        };
    });

    userSchema.post('remove', function() {
        // find, loop, and instance-level remove, instead of simply model-level remove all at once which doesn't trigger middleware hooks
        Convo.find({$or: [{user_id_0: this._id}, {user_id_1: this._id}]}, function(err, convos) {
            _.each(convos, function(convo) {
                convo.remove();
            });
        });
    });

    userSchema.post('remove', function() {
        // find, loop, and instance-level remove, instead of simply model-level remove all at once which doesn't trigger middleware hooks
        Friendship.find({$or: [{requester_id: this._id}, {target_id: this._id}]}, function(err, friendships) {
            _.each(friendships, function(friendship) {
                friendship.remove();
            });
        });
    });

    userSchema.post('remove', function() {
        AccountSettings.remove({_id: this._id});
    });

    userSchema.methods.sendPush = function(title, body, payload) {
        var receiver_id = this._id;
        var devices = this.devices;
        Message.count({
            receiver_id: receiver_id,
            time_read: {
                $exists: false
            }
        }).exec(function(err, unread_count) {
            var note = new apn.Notification();
            note.expiry = Math.floor(Date.now() / 1000) + 3600;
            if (title) note.title = title;
            if (body) note.body = body;
            if (payload) note.payload = payload;
            note.badge = unread_count;
            _.each(devices, function(device) {
                if (device.platform === 'ios') {
                    var device_id = device.id;
                    apnProvider.send(note, device_id)
                        .then(function(result) {
                            if (!_.isEmpty(result.failed)) {
                                console.log('\nERROR SENDING PUSH:\n', result.failed);
                            };
                        });
                }
            });
        });
    };

    userSchema.plugin(passportLocalMongoose);

    // if the model already exists, use the existing model
    return mongoose.models.User || mongoose.model('User', userSchema);

};
