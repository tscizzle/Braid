angular.module('usersDirective', [])

    .controller('userController', ['$scope', 'socket', 'Users', function($scope, socket, Users) {

        var vm = this;


        // initialization

        vm.forms = {
            newUserFormData: {}
        };

        Users.get()
            .success(function (data) {
                vm.users = data;
                vm.selected_user = vm.users[0];
            });


        // define CRUD functions used in the template

        vm.createUser = function() {
            if (vm.forms.newUserFormData.username) {

                Users.create(vm.forms.newUserFormData)
                    .success(function(data) {
                        vm.forms.newUserFormData = {};
                        vm.users = data.users;
                        vm.selected_user = data.new_user;

                        if (!vm.selected_user) {
                            vm.selected_user = vm.users[0];
                        };
                    });

            };
        };

        vm.deleteUser = function(user_id) {

            Users.delete(user_id)
                .success(function(data) {
                    vm.users = data;

                    if (user_id === vm.selected_user._id) {
                        vm.selected_user = vm.users[0];
                    };
                });

        };


        // define page control functions used in the template

        vm.selectUser = function(user) {
            vm.selected_user = user;
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
                // TODO: seems rooms are not joined properly at the beginning
                socket.emit('room:join', vm.selected_user);
            };
        };

        var users_watcher = function(scope) {return vm.users;};
        var selected_user_watcher = function(scope) {return vm.selected_user;};
        $scope.$watch(users_watcher, refreshUserMap);
        $scope.$watch(selected_user_watcher, joinUserSocketRoom);

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
