angular.module('accountSettingsDirective', [])

    .controller('accountSettingsController', ['Users', 'AccountSettings', function(Users, AccountSettings) {

        var vm = this;


        // define CRUD functions used in the template

        vm.updateAccountSettings = function(field) {
            if (vm.selected_user) {
                var value = vm.account_settings[field];

                AccountSettings.set(vm.selected_user._id, field, value)
                    .success(function(data) {
                        AccountSettings.refresh(vm.selected_user._id);
                    });

            };
        };

        vm.deleteUser = function() {
            if (vm.selected_user) {

                Users.delete(vm.selected_user._id)
                    .success(function(data) {
                        // TODO: handle successful deletion of the user
                        console.log('user deleted?');
                    });

            };
        };


        // initialization

        vm.account_settings = AccountSettings.account_settings;

    }])

    .directive('braidAccountSettings', function() {
        return {
            restrict: 'EA',
            scope: {
                selected_user: '=selectedUser',
            },
            templateUrl: 'views/account_settings.html',
            controller: 'accountSettingsController',
            controllerAs: 'actSetCtrl',
            bindToController: true
        };
    });
