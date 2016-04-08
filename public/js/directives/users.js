angular.module('usersDirective', [])

    .controller('userController', ['$scope', 'socket', 'Users', function($scope, socket, Users) {

        var vm = this;


        // define CRUD functions used in the template

        vm.deleteUser = function(user_id) {

            Users.delete(user_id)
                .success(function(data) {
                    vm.users = data;
                    vm.selected_user = undefined;
                });

        };


        // register listeners

        var refreshUserMap = function() {
            var temp_user_map = {};
            _.each(vm.users, function(user) {
                temp_user_map[user._id] = user;
            });
            vm.user_map = temp_user_map;
        };

        var joinUserSocketRoom = function() {
            if (vm.selected_user) {
                socket.emit('room:join', vm.selected_user);
            };
        };

        var users_watcher = function(scope) {return vm.users;};
        var selected_user_watcher = function(scope) {return vm.selected_user;};
        $scope.$watch(users_watcher, refreshUserMap);
        $scope.$watch(selected_user_watcher, joinUserSocketRoom);


        // initialization

        vm.newUserFormData = {};

        Users.get()
            .success(function(data) {
                vm.users = data;

                joinUserSocketRoom();
            });

    }])

    .directive('braidUsers', function() {
        return {
            restrict: 'E',
            scope: {
                users: '=',
                selected_user: '=selectedUser',
                user_map: '=userMap'
            },
            templateUrl: 'views/users.html',
            controller: 'userController',
            controllerAs: 'userCtrl',
            bindToController: true
        };
    });
