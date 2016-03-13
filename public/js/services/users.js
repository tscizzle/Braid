angular.module('userService', [])

    .factory('Users', ['$http', function($http) {
        return {
            get: function() {
                return $http.get('/api/users');
            },
            create: function(userData) {
                return $http.post('/api/users', userData);
            },
            delete: function(user_id) {
                return $http.delete('/api/users/' + user_id);
            }
        }
    }]);
