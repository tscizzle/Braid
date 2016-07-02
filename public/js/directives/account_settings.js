angular.module('accountSettingsDirective', [])

    .controller('accountSettingsController', ['$scope', 'Users', 'AccountSettings', function($scope, Users, AccountSettings) {

        var vm = this;
        window.VM = vm;


        // define CRUD functions used in the template

        vm.updateAccountSettings = function(field) {
            if (vm.selected_user) {
                var value = vm[field];
                console.log('field', field);
                console.log('value', value);

                AccountSettings.set(vm.selected_user._id, field, value)
                    .success(function(data) {
                        _.extend(vm, data);
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


        // register listeners

        var refreshAccountSettings = function() {
            if (vm.selected_user) {

                AccountSettings.get(vm.selected_user._id)
                    .success(function(data) {
                        _.extend(vm, data);
                    });

            };
        };

        var selected_user_watcher = function() {return vm.selected_user;};
        $scope.$watch(selected_user_watcher, refreshAccountSettings);


        // initialization

        refreshAccountSettings();

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
