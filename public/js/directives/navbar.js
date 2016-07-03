angular.module('navbarDirective', [])

    .controller('navbarController',
                ['chat', 'AccountSettings', 'DEFAULT_PROFILE_PIC',
                 function(chat, AccountSettings, DEFAULT_PROFILE_PIC) {

        var vm = this;


        // define page control functions used in the template

        vm.showChatLink = function() {
            return chat.showing || !vm.selected_user;
        };


        // initialization

        vm.account_settings = AccountSettings.account_settings;
        vm.default_pic = DEFAULT_PROFILE_PIC;

    }])

    .directive('braidNavbar', function() {
        return {
            restrict: 'E',
            scope: {
                login_object: '=loginObject',
                selected_user: '=selectedUser',
                title_notifications: '=titleNotifications'
            },
            templateUrl: 'views/navbar.html',
            controller: 'navbarController',
            controllerAs: 'navbarCtrl',
            bindToController: true
        };
    });
