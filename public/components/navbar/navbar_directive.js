angular.module('navbarDirective', [])

    .controller('navbarController',
                ['$location', 'chat', 'AccountSettings', 'DEFAULT_PROFILE_PIC',
                 function($location, chat, AccountSettings, DEFAULT_PROFILE_PIC) {

        var vm = this;


        // define CRUD functions used in the template

        vm.updateSoundOn = function() {
            if (vm.selected_user) {

                AccountSettings.set(vm.selected_user._id, 'sound_on', vm.account_settings.sound_on)
                    .success(function(data) {
                        AccountSettings.refresh(vm.selected_user._id);
                    });

            };
        };


        // define page control functions used in the template

        vm.logoDestination = function() {
            return vm.selected_user ? '/' : '/auth';
        };

        vm.goToHelp = function() {
            $location.path('/help');
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
