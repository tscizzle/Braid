angular.module('friendshipsDirective', [])

    .controller('friendshipController', ['$scope', 'Users', 'Friendships', function($scope, Users, Friendships) {

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


        // define page control functions used in the template

        vm.showFriendship = function(friendship) {
            return vm.show_all || friendship.status === 'pending';
        };

        vm.friendshipNeedsAnswer = function(friendship) {
            return friendship.status === 'pending' && friendship.target_id === vm.selected_user._id;
        };

        vm.conditionalStatus = function(friendship) {
            return (friendship.status !== 'accepted' && friendship.requester_id === vm.selected_user._id) ? '(' + friendship.status + ')' : '';
        };

        vm.showAcceptButton = function(friendship) {
            return friendship.status === 'pending' && friendship.target_id === vm.selected_user._id;
        };

        vm.hoverFriendship = function(friendship) {
            vm.hovered_friendship = friendship._id;
        };

        vm.unhoverFriendship = function(friendship) {
            vm.hovered_friendship = undefined;
        };

        vm.friendshipOpacity = function(friendship) {
            return (vm.hovered_friendship === friendship._id || vm.showAcceptButton(friendship)) ? 1 : 0;
        };

        vm.friendshipsNeedingAnswer = function() {
            return _.filter(vm.friendships, vm.friendshipNeedsAnswer).length > 0;
        };


        // initialization

        vm.friendships = [];
        vm.show_all = false;
        vm.hovered_friendship = undefined;
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
