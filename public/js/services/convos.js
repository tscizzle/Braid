angular.module('convoService', [])
    .factory('Convos', function($http) {
        return {
            get: function() {
                return $http.get('/api/convos');
            },
            create: function(convoData) {
                return $http.post('/api/convos', convoData);
            },
            delete: function(convo_id) {
                return $http.delete('/api/convos/' + convo_id);
            }
        }
    });
