angular.module('braidFilters', [])

    .filter('pageTitle', function() {
        return function(num_notifications) {
            return num_notifications > 0 ? '(' + num_notifications + ') Braid' : 'Braid';
        };
    })

    .filter('partner', function() {
        return function(convo, selected_user) {
            if (convo && selected_user) {
                if (convo.user_id_0 == selected_user._id) {
                    return convo.user_id_1;
                } else if (convo.user_id_1 == selected_user._id) {
                    return convo.user_id_0;
                };
            };
        };
    })

    .filter('friend', function() {
        return function(friendship, selected_user) {
            if (friendship && selected_user) {
                if (friendship.requester_id == selected_user._id) {
                    return friendship.target_id;
                } else if (friendship.target_id == selected_user._id) {
                    return friendship.requester_id;
                };
            };
        };
    })

    .filter('username', function() {
        return function(user_id, user_map) {
            if (user_id) {
                if (user_map[user_id]) {
                    return user_map[user_id].username;
                } else {
                    return user_id
                };
            };
        };
    })

    .filter('dateStretchy', ['$filter', function($filter) {
        return function(datestring) {
            var datetime = new Date(datestring);
            var right_now = new Date();
            var time_since = right_now - datetime;
            var DAY = 24 * 3600 * 1000;

            var date_formats;
            if (datetime.toDateString() === right_now.toDateString()) { // today
                date_formats = ['shortTime'];
            } else if (time_since < 7 * DAY) { // within a week
                date_formats = ['EEE', 'shortTime'];
            } else { // more than a week ago
                date_formats = ['mediumDate'];
            };

            var joined_formats = _.map(date_formats, function(date_format) {
                return $filter('date')(datetime, date_format);
            }).join(' ');

            return joined_formats;
        };
    }])

    .filter('cutoffText', function() {
        return function(text) {
            if (text) {
                var text_length = text.length;
                var PREVIEW_LENGTH = 15;
                if (text_length <= PREVIEW_LENGTH) {
                    return text;
                } else {
                    return text.slice(0, PREVIEW_LENGTH) + '...';
                };
            };
        };
    });
