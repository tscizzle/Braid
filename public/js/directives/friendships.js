angular.module('friendshipsDirective', [])

    .controller('friendshipController', ['$scope', 'socket', 'Users', 'Friendships', function($scope, socket, Users, Friendships) {

        var vm = this;


        // define CRUD functions used in the template

        vm.createFriendship = function() {
            if (vm.newFriendshipFormData.username) {
                vm.newFriendshipFormData.requester_id = vm.selected_user._id;

                Friendships.create(vm.newFriendshipFormData)
                    .success(function(data) {
                        vm.newFriendshipFormData = {};
                        vm.friendships = data;
                    });

            };
        };

        vm.acceptFriendship = function(friendship_id) {
            if (vm.selected_user) {

                Friendships.accept(friendship_id, vm.selected_user._id)
                    .success(function(data) {
                        vm.friendships = data;
                    });

            };
        };

        vm.deleteFriendship = function(friendship_id) {
            if (vm.selected_user) {

                Friendships.delete(friendship_id, vm.selected_user._id)
                    .success(function(data) {
                        vm.friendships = data;
                    });

            };
        };


        // initialization

        vm.friendships = [];
        vm.newFriendshipFormData = {};

        Friendships.get(vm.selected_user._id)
            .success(function(data) {
                vm.friendships = data;
            });

    }])

    .directive('braidFriendships', function() {
        return {
            restrict: 'E',
            scope: {
                friend_users: '=friendUsers',
                friendships: "=",
                selected_user: '=selectedUser',
                friend_user_map: '=friendUserMap'
            },
            templateUrl: 'views/friendships.html',
            controller: 'friendshipController',
            controllerAs: 'friendshipCtrl',
            bindToController: true
        };
    });
