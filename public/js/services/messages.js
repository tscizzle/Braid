angular.module('messageService', [])
    .factory('Messages', function($http) {
        return {
            get: function(convo_id) {
                return $http.get('/api/messages/' + convo_id);
            },
            create: function(messageData) {
                return $http.post('/api/messages', messageData);
            },
            delete: function(message_id, convo_id) {
                return $http.delete('/api/messages/' + message_id + '/' + convo_id);
            }
        };
    });
