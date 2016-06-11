angular.module('queueDirective', [])

    .controller('queueController', ['$scope', function($scope) {

        var vm = this;


        // define page control functions used in the template

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

        var refreshUnaddressedStrands = function() {
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
                var sorted_unaddressed_strands = _.sortBy(unaddressed_strands, function(strand) {
                    var strands_last_message = lastMessageInStrand(strand);
                    return strands_last_message ? new Date(strands_last_message.time_sent) : new Date(10e13);
                });
                vm.unaddressed_strands = sorted_unaddressed_strands;
            };
        };

        var messages_watcher = function(scope) {return vm.messages;};
        var strand_map_watcher = function(scope) {return vm.strand_map;};
        $scope.$watchGroup([messages_watcher, strand_map_watcher], refreshUnaddressedStrands);


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

        vm.unaddressed_strands = [];

        refreshUnaddressedStrands();

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
