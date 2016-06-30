angular.module('navbarDirective', [])

    .controller('navbarController', ['chat', function(chat) {

        var vm = this;


        // define page control functions used in the template

        vm.showChatLink = function() {
            return chat.showing || !vm.selected_user;
        };

    }])

    .directive('braidNavbar', function() {
        return {
            restrict: 'E',
            scope: {
                login_object: '=loginObject',
                selected_user: '=selectedUser',
                title_notifications: '=titleNotifications',
                sound_on: '=soundOn'
            },
            templateUrl: 'views/navbar.html',
            controller: 'navbarController',
            controllerAs: 'navbarCtrl',
            bindToController: true
        };
    });
