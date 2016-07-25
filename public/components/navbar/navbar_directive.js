angular.module('navbarDirective', [])

    .controller('navbarController',
                ['chat', 'AccountSettings', 'DEFAULT_PROFILE_PIC',
                 function(chat, AccountSettings, DEFAULT_PROFILE_PIC) {

        var vm = this;


        // define page control functions used in the template

        vm.logoDestination = function() {
            return vm.selected_user ? '/' : '/auth';
        };


        // initialization

        vm.account_settings = AccountSettings.account_settings;
        vm.default_pic = DEFAULT_PROFILE_PIC;

    }])

    .directive('braidNavbar', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser',
                title_notifications: '=titleNotifications'
            },
            templateUrl: 'components/navbar/navbar.html',
            controller: 'navbarController',
            controllerAs: 'navbarCtrl',
            bindToController: true
        };
    });
