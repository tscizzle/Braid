angular.module('queueDirective', [])

    .controller('queueController', [function() {

        var vm = this;

        // define page control functions used in the template

        vm.unaddressedStrands = function() {
            if (vm.selected_user) {
                // TODO: make this "unaddressed" instead of "unread", where to
                // "address" a message it doesn't just have to be visible but
                // actually has to have its strand selected since being sent
                var unreadMessages = _.filter(vm.messages, function(message) {
                    return message.receiver_id === vm.selected_user._id && !message.time_read;
                });
                var unreadStrands = [];
                var already_handled_strands = [];
                _.each(unreadMessages, function(message) {
                    var strand_id = message.strand_id;
                    if (strand_id) {
                        if (already_handled_strands.indexOf(strand_id) === -1) {
                            unreadStrands.push(vm.strand_map[strand_id]);
                            already_handled_strands.push(strand_id);
                        };
                    };
                });
                return unreadStrands;
            };
        };

        vm.strandColor = function(strand) {
            return STRAND_COLOR_ORDER[strand.color_number];
        };

        vm.strandPreview = function(strand) {
            var strand_messages = _.filter(vm.messages, function(message) {
                return message.strand_id === strand._id;
            });
            console.log('strand_messages', strand_messages);
            if (strand_messages.length > 0) {
                var strands_last_message = _.max(strand_messages, function(message) {
                    return message.time_sent;
                });
                console.log('strands_last_message', strands_last_message);
                var text = strands_last_message.text;
                var text_length = text.length;
                var PREVIEW_LENGTH = 15;
                if (text_length <= PREVIEW_LENGTH) {
                    return text;
                } else {
                    return text.slice(0, 15) + ' ...';
                };
            };
        };


        // constants

        var STRAND_COLOR_ORDER = [
            '#EFBFFF',
            '#9EEFD0',
            '#FFFAAD',
            '#FFC99E',
            '#F2969F'
        ];
        STRAND_COLOR_ORDER[-1] = '#DDD';

        var COLOR_TO_FADED_MAP = {
            '#EFBFFF': '#F2DBFF',
            '#9EEFD0': '#CEF2ED',
            '#FFFAAD': '#EDFFD9',
            '#FFC99E': '#FFE6C2',
            '#F2969F': '#F2C2AE'
        };

        // initialization



    }])

    .directive('braidQueue', function() {
        return {
            restrict: 'E',
            scope: {
                messages: '=',
                strands: '=',
                selected_strand: '=selectedStrand',
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                strand_map: '=strandMap',
                friend_user_map: '=friendUserMap'
            },
            templateUrl: 'views/queue.html',
            controller: 'queueController',
            controllerAs: 'queueCtrl',
            bindToController: true
        };
    });
