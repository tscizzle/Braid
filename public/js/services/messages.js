angular.module('messageService', [])

    .factory('Messages', ['$http', function($http) {

        return {
            get: function(convo_id, num_messages_to_get) {
                return $http.get('/api/messages/' + convo_id + '/' + num_messages_to_get);
            },
            create: function(messageData, num_messages_to_get) {
                return $http.post('/api/messages/' + num_messages_to_get, messageData);
            },
            delete: function(message_id, convo_id, num_messages_to_get) {
                return $http.delete('/api/messages/' + message_id + '/' + convo_id, {num_messages: num_messages_to_get});
            },
            assignMessagesToStrand: function(message_ids, strand_id, convo_id, num_messages_to_get) {
                return $http.post('/api/assignMessagesToStrand/' + strand_id + '/' + convo_id, {message_ids: message_ids, num_messages: num_messages_to_get});
            },
            unassignMessageFromStrand: function(message_id, convo_id, num_messages_to_get) {
                return $http.post('/api/unassignMessageFromStrand/' + convo_id, {message_id: message_id, num_messages: num_messages_to_get});
            },
            markMessagesAsRead: function(message_ids, convo_id, time_read, num_messages_to_get) {
                return $http.post('/api/markMessagesAsRead/' + convo_id, {message_ids: message_ids, time_read: time_read, num_messages: num_messages_to_get});
            },
        };

    }]);
