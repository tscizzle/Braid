angular.module('messageService', [])

    .factory('Messages', ['$http', 'socket', function($http, socket) {

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
            assignMessagesToStrand: function(message_ids, strand_id, convo_id, user_ids) {
                return $http.post('/api/assignMessagesToStrand/' + strand_id + '/' + convo_id, {message_ids: message_ids, user_ids: user_ids})
            },
            removeMessageFromStrand: function(message_id, convo_id) {
                return $http.post('/api/removeMessageFromStrand/' + convo_id, {message_id: message_id})
            }
        };

    }]);
