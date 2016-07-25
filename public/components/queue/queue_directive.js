angular.module('queueDirective', [])

    .controller('queueController',
                ['$scope', '$timeout', 'Messages',
                 function($scope, $timeout, Messages) {

        var vm = this;


        // define page control functions used in the template

        vm.clickUnstrandedPreview = function(message) {
            vm.selected_strand = undefined;

            // scroll to the addressed message
            var message_element = $('#message-' + message._id);
            var wrapper_element = $('.message-list-wrapper');
            var SECOND = 1000;
            wrapper_element.animate({
                scrollTop: message_element.position().top + wrapper_element.scrollTop()
            }, 0.1 * SECOND);
            // trigger the addressed message animation
            message_element.addClass('just-addressed-message');
            // this delay for removing the class should match the animation length,
            // which isn't great since the animation length is defined in css
            $timeout(function() {message_element.removeClass('just-addressed-message');}, 2 * SECOND);

            Messages.markMessageAsAddressed(message._id, vm.selected_convo._id, vm.num_messages)
                .success(function(data) {
                    vm.messages = data;
                });

        };

        vm.strandColor = function(strand) {
            return STRAND_COLOR_ORDER[strand.color_number];
        };

        vm.strandPreview = function(strand) {
            var strand_messages = _.filter(vm.messages, function(message) {
                return message.strand_id === strand._id;
            });
            if (strand_messages.length > 0) {
                var strands_last_message = _.max(strand_messages, function(message) {
                    return new Date(message.time_sent);
                });
                var text = strands_last_message.text;
                return text;
            };
        };


        // register listeners

        var refreshUnaddressedUnstrandedMessages = function() {
            if (vm.selected_user) {
                var unaddressed_unstranded_messages = _.filter(vm.messages, function(message) {
                    return message.receiver_id === vm.selected_user._id  && !message.addressed && !message.strand_id;
                });
                var sorted_unaddressed_unstranded_messages = _.sortBy(unaddressed_unstranded_messages, 'time_sent');
                vm.unaddressed_unstranded_messages = sorted_unaddressed_unstranded_messages;
            };
        };

        var refreshUnaddressedStrands = function() {
            if (vm.selected_user) {
                var unaddressed_strands = [];
                var unique_strand_ids = [];
                _.each(vm.messages, function(message) {
                    var strand_id = message.strand_id;
                    if (message.receiver_id === vm.selected_user._id  && !message.addressed && strand_id && unique_strand_ids.indexOf(strand_id) === -1) {
                        var strand = vm.strand_map[strand_id];
                        if (strand) {
                            unaddressed_strands.push(strand);
                            unique_strand_ids.push(strand_id);
                        };
                    };
                });
                var sorted_unaddressed_strands = _.sortBy(unaddressed_strands, function(strand) {
                    var strands_last_message = lastMessageInStrand(strand);
                    return strands_last_message ? new Date(strands_last_message.time_sent) : new Date(10e13);
                });
                vm.unaddressed_strands = sorted_unaddressed_strands;
            };
        };

        var messages_watcher = function() {return vm.messages;};
        var strand_map_watcher = function() {return vm.strand_map;};
        var selected_strand_watcher = function() {return vm.selected_strand;};
        $scope.$watch(messages_watcher, refreshUnaddressedUnstrandedMessages);
        $scope.$watchGroup([messages_watcher, strand_map_watcher, selected_strand_watcher], refreshUnaddressedStrands);


        // helpers

        var strandIsUnaddressed = function(strand) {
            return ((vm.selected_user._id === strand.user_id_0 && !strand.addressed.user_id_0) ||
                    (vm.selected_user._id === strand.user_id_1 && !strand.addressed.user_id_1));
        };

        var lastMessageInStrand = function(strand) {
            var strand_messages = _.filter(vm.messages, function(message) {
                return message.strand_id === strand._id;
            });
            var strands_last_message = _.max(strand_messages, function(message) {
                return new Date(message.time_sent);
            });
            return strands_last_message;
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

        vm.unaddressed_unstranded_messages = [];
        vm.unaddressed_strands = [];

        refreshUnaddressedUnstrandedMessages();
        refreshUnaddressedStrands();

    }])

    .directive('braidQueue', function() {
        return {
            restrict: 'E',
            scope: {
                messages: '=',
                strands: '=',
                num_messages: '=numMessages',
                selected_strand: '=selectedStrand',
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                strand_map: '=strandMap',
                friend_user_map: '=friendUserMap'
            },
            templateUrl: 'components/queue/queue.html',
            controller: 'queueController',
            controllerAs: 'queueCtrl',
            bindToController: true
        };
    });
