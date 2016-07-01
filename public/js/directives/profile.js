angular.module('profileDirective', [])

    .controller('profileController', ['$scope', 'Users', 'UserSettings', function($scope, Users, UserSettings) {

        var vm = this;


        // define CRUD functions used in the template

        vm.updateUserSettings = function(field) {
            if (vm.selected_user) {
                var value = vm[field];
                console.log('field', field);
                console.log('value', value);

                UserSettings.set(vm.selected_user._id, field, value)
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

        var refreshUserSettings = function() {
            if (vm.selected_user) {

                UserSettings.get(vm.selected_user._id)
                    .success(function(data) {
                        _.extend(vm, data);
                    });

            };
        };

        var selected_user_watcher = function() {return vm.selected_user;};
        $scope.$watch(selected_user_watcher, refreshUserSettings);


        // initialization

        refreshUserSettings();

    }])

    .directive('braidProfile', function() {
        return {
            restrict: 'EA',
            scope: {
                selected_user: '=selectedUser',
            },
            controller: 'profileController',
            controllerAs: 'profileCtrl',
            bindToController: true
        };
    });
