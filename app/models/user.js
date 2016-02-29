var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    username: {type: String, required: true}
});
