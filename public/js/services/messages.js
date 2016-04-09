angular.module('messageService', [])

    .factory('Messages', ['$http', function($http) {

        return {
            get: function(convo_id) {
                return $http.get('/api/messages/' + convo_id);
            },
            create: function(messageData) {
                return $http.post('/api/messages', messageData);
            },
            delete: function(message_id, convo_id) {
                return $http.delete('/api/messages/' + message_id + '/' + convo_id);
            },
            assignMessagesToStrand: function(message_ids, strand_id, convo_id) {
                return $http.post('/api/assignMessagesToStrand/' + strand_id + '/' + convo_id, {message_ids: message_ids});
            },
            unassignMessageFromStrand: function(message_id, convo_id) {
                return $http.post('/api/unassignMessageFromStrand/' + convo_id, {message_id: message_id});
            }
        };

    }]);
