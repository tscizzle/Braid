angular.module('userService', [])

    .factory('Users', ['$http', function($http) {

        return {
            get: function() {
                return $http.get('/api/users');
            },
            delete: function(user_id) {
                return $http.delete('/api/users/' + user_id);
            }
        };

    }]);
