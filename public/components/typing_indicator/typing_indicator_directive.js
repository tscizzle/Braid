angular.module('typingIndicatorDirective', [])

    .controller('typingIndicatorController', ['socket', 'helpers', function(socket, helpers) {

        var vm = this;


        // define page control functions used in the template

        vm.otherUserIsTyping = function() {
            var now = new Date();
            var SECOND = 1000;
            var just_typed = now - vm.last_typed < SECOND;
            var just_sent;
            if (vm.messages && vm.messages.length > 0) {
                just_sent = now - vm.messages[vm.messages.length - 1].time_sent < 0.1 * SECOND;
            } else {
                just_sent = false;
            };
            return just_typed && !just_sent;
        };


        // register socket listeners

        socket.on('other_user_typing', function(typing_data) {
            var typist = typing_data.typist;
            var recipient = typing_data.recipient;
            var typing_color = typing_data.typing_color;
            if (vm.selected_user && vm.selected_user._id === recipient && helpers.partnerIdFromSelectedConvo(vm) === typist) {
                vm.other_user_typing_color = typing_color;
                vm.last_typed = new Date();
            };
        });


        // initialization

        vm.last_typed = undefined;
        vm.other_user_typing_color = undefined;

    }])

    .directive('braidTypingIndicator', function() {
        return {
            restrict: 'E',
            scope: {
                messages: '=',
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser'
            },
            templateUrl: 'components/typing_indicator/typing_indicator.html',
            controller: 'typingIndicatorController',
            controllerAs: 'typIndCtrl',
            bindToController: true
        };
    });
