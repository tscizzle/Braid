angular.module('messageService', [])

    .factory('Messages', ['$http', function($http) {

        return {
            get: function(convo_id, num_messages_to_get) {
                return $http.get('/api/messages/' + convo_id + '/' + num_messages_to_get);
            },
            getUnreadMessageCounts: function(user_id) {
                return $http.get('/api/getUnreadMessageCounts/' + user_id);
            },
            create: function(messageData, num_messages_to_get) {
                return $http.post('/api/messages/' + num_messages_to_get, messageData);
            },
            createOnNewStrand: function(messageData, strandData, strand_message_ids, num_messages_to_get) {
                return $http.post('/api/messagesNewStrand', {
                    message: messageData,
                    strand: strandData,
                    strand_message_ids: {message_ids: strand_message_ids},
                    num_messages: num_messages_to_get,
                });
            },
            assignMessagesToStrand: function(message_ids, strand_id, convo_id, num_messages_to_get) {
                return $http.post('/api/assignMessagesToStrand/' + strand_id + '/' + convo_id, {
                    message_ids: message_ids,
                    num_messages: num_messages_to_get
                });
            },
            unassignMessageFromStrand: function(message_id, convo_id, num_messages_to_get) {
                return $http.post('/api/unassignMessageFromStrand/' + convo_id, {
                    message_id: message_id,
                    num_messages: num_messages_to_get
                });
            },
            markMessagesAsRead: function(message_ids, user_id, convo_id, time_read, num_messages_to_get) {
                return $http.post('/api/markMessagesAsRead/' + convo_id, {
                    message_ids: message_ids,
                    user_id: user_id,
                    time_read: time_read,
                    num_messages: num_messages_to_get
                });
            },
            markMessageAsAddressed: function(message_id, convo_id, num_messages_to_get) {
                return $http.post('/api/markMessageAsAddressed/' + message_id + '/' + convo_id, {
                    num_messages: num_messages_to_get
                });
            },
            markStrandMessagesAsAddressed: function(strand_id, convo_id, timestamp, num_messages_to_get) {
                return $http.post('/api/markStrandMessagesAsAddressed/' + strand_id + '/' + convo_id, {
                    timestamp: timestamp,
                    num_messages: num_messages_to_get
                });
            },
            delete: function(message_id, convo_id, num_messages_to_get) {
                return $http.delete('/api/messages/' + message_id + '/' + convo_id, {
                    num_messages: num_messages_to_get
                });
            }
        };

    }]);
