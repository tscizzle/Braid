angular.module('userService', [])

    .factory('Users', ['$http', function($http) {

        return {
            getUsernames: function() {
                return $http.get('/api/usernames');
            },
            getFriendUsernames: function(user_id) {
                return $http.get('/api/friendUsernames/' + user_id);
            },
            delete: function(user_id) {
                return $http.delete('/api/users/' + user_id);
            }
        };

    }]);
