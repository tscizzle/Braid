angular.module('braidFilters', [])

    .filter('partner', function() {
        return function(convo, selected_user) {
            if (convo) {
                if (convo.user_id_0 == selected_user._id) {
                    return convo.user_id_1;
                } else if (convo.user_id_1 == selected_user._id) {
                    return convo.user_id_0;
                };
            };
        };
    })
    .filter('username', function() {
        return function(user_id, username_map) {
            if (user_id) {
                return username_map[user_id];
            };
        };
    });
