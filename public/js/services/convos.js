angular.module('convoService', [])

    .factory('Convos', ['$http', function($http) {
        return {
            get: function(user_id) {
                return $http.get('/api/convos/' + user_id);
            },
            create: function(convoData) {
                return $http.post('/api/convos', convoData);
            },
            delete: function(convo_id, user_id) {
                return $http.delete('/api/convos/' + convo_id + '/' + user_id);
            }
        }
    }]);
