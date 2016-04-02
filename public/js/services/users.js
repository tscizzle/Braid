angular.module('userService', [])

    .factory('Users', ['$http', function($http) {

        return {
            get: function() {
                return $http.get('/api/users');
            },
            getFriends: function(user_id) {
                return $http.get('/api/friendUsers/' + user_id);
            },
            delete: function(user_id) {
                return $http.delete('/api/users/' + user_id);
            }
        };

    }]);
