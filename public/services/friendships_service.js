angular.module('friendshipService', [])

    .factory('Friendships', ['$http', function($http) {

        return {
            get: function(user_id) {
                return $http.get('/api/friendships/' + user_id);
            },
            create: function(friendshipData) {
                return $http.post('/api/friendships', friendshipData);
            },
            accept: function(friendship_id, user_id) {
                return $http.post('/api/friendships/accept/' + friendship_id + '/' + user_id);
            },
            delete: function(friendship_id, user_id) {
                return $http.delete('/api/friendships/' + friendship_id + '/' + user_id);
            }
        };

    }]);
