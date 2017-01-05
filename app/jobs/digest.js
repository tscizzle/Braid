var _ = require('underscore');
var sendgridAPI = require('../config/sendgrid-api');


var SECOND = 1000;
var MINUTE = 60 * SECOND;
var HOUR = 60 * MINUTE;
var DAY = 24 * HOUR;

function getDigestHTML(messages) {
    var convo_grouped_messages = _.groupBy(messages, 'convo_id');
    var sorted_convo_messages = _.mapObject(convo_grouped_messages, function(convo_messages, convo_id) {
        return _.sortBy(convo_messages, 'time_saved');
    });
    var convo_previews = _.map(_.values(sorted_convo_messages), function(convo_messages) {
        var first_message = convo_messages[0];
        var sender = first_message.sender_id; // TODO: make this the sender's username somehow
        return ('<p><b>' + 'Someone' + ' says:</b> ' +
                first_message.text.slice(0, 25) + (first_message.text.length > 25 ? '...' : '') +
                '</p>');
    }).join('');
    return `
      <html style="font-family: sans-serif;">
        <body style="margin: 0; text-align: center; padding: 3em; background-color: #FAFAFA; color: #777;">
          <h1> You've received messages on Braid. </h1>
          <div style="margin-bottom: 5em;">
            ${convo_previews}
          </div>
          <a style="color: #ffffff;
                    background-color: #43ac6a;
                    border: 1px solid transparent;
                    border-color: #3c9a5f;
                    padding: 8px 12px;
                    cursor: pointer;
                    font-size: 15px;
                    line-height: 1.4;" href="https://www.braid.space">
            Go To Braid
          </a>
        </body>
      </html>
    `;
}

module.exports = function(io) {

    var Message = require('../models/message')(io);
    var User = require('../models/user')(io);
    var AccountSettings = require('../models/account_settings')();

    var DIGEST_CYCLE = DAY;
    var this_time_triggered = new Date();

    var runDigestJob = function() {
        console.log('running digest job');
        var this_time_triggered = new Date();
        var cycle_start = new Date(this_time_triggered - DIGEST_CYCLE);
        User.find({
            email: {$exists: true},
            last_digest_time: {$not: {$gt: cycle_start}}
        }, function(err, users) {
            var user_ids = _.map(users, '_id');
            AccountSettings.find({
                _id: {$in: user_ids},
                digest_enabled: true
            }, function(err, account_settings) {
                var enabled_user_ids = _.map(account_settings, '_id');
                var eligible_users = _.filter(users, user => {
                  // can't just use _.contains(enabled_user_ids, user._id) because needs to use _.isEqual instead of ===
                  return _.find(enabled_user_ids, enabled_user_id => _.isEqual(enabled_user_id, user._id));
                });
                _.each(eligible_users, user => {
                    var message_query = {
                        time_read: {$exists: false},
                        receiver_id: user._id,
                        time_saved: {
                            $gte: user.last_digest_time || new Date('1970-01-02 00:00:00'),
                            $lt: this_time_triggered
                        }
                    };
                    Message.find(message_query, function(err, messages) {
                        if (!err && messages.length > 0) {
                            var to_email = user.email;
                            var from_email = 'Bob <bob@braid.space>';
                            var from_name = 'Braid Bob';
                            var subject = 'Unread Braid Messages';
                            var digestHTML = getDigestHTML(messages);
                            sendgridAPI.send({
                                to: to_email,
                                from: from_email,
                                fromname: from_name,
                                subject: subject,
                                html: digestHTML
                            }, function(err, res) {
                                if (!err && res.message === 'success') {
                                    User.update({
                                        _id: user._id
                                    }, {
                                        $set: {last_digest_time: this_time_triggered}
                                    }).exec();
                                };
                            });
                        }
                    });
                });
            });
        });
    };

    runDigestJob();
    setInterval(runDigestJob, DAY);
};
