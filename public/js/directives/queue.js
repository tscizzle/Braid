angular.module('queueDirective', [])

    .controller('queueController', [function() {

        var vm = this;


        // define page control functions used in the template

        vm.unaddressedStrands = function() {
            if (vm.selected_user) {
                var unaddressed_strands = [];
                var unique_strand_ids = [];
                _.each(vm.messages, function(message) {
                    var strand_id = message.strand_id;
                    if (strand_id && unique_strand_ids.indexOf(strand_id) === -1) {
                        unique_strand_ids.push(strand_id);
                        var strand = vm.strand_map[strand_id];
                        if (strand && strandIsUnaddressed(strand)) {
                            unaddressed_strands.push(strand);
                        };
                    };
                });
                // TODO: order by time_sent of last message
                return unaddressed_strands;
            };
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
                var text_length = text.length;
                var PREVIEW_LENGTH = 15;
                if (text_length <= PREVIEW_LENGTH) {
                    return text;
                } else {
                    return text.slice(0, 15) + ' ...';
                };
            };
        };


        // helpers

        var strandIsUnaddressed = function(strand) {
            return ((vm.selected_user._id === strand.user_id_0 && !strand.addressed.user_id_0) ||
                    (vm.selected_user._id === strand.user_id_1 && !strand.addressed.user_id_1));
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
