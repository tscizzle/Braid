angular.module('braidFilters', [])

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
    });
