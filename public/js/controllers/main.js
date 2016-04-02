angular.module('braidController', [])

    .controller('mainController', ['$scope', 'Auth', 'Users', 'Friendships', function($scope, Auth, Users, Friendships) {

        var vm = this;

        window.VM = vm;


        // register listeners

        var refreshFriendUsers = function() {
            if (vm.selected_user) {

                Users.getFriends(vm.selected_user._id)
                    .success(function(data) {
                        vm.friend_users = data;
                    });

            } else {
                vm.friend_users = [];
            };
        };

        var refreshFriendships = function() {
            if (vm.selected_user) {

                Friendships.get(vm.selected_user._id)
                    .success(function(data) {
                        vm.friendships = data;
                    });

            } else {
                vm.friendships = [];
            };
        };

        var refreshFriendUserMap = function() {
            var temp_friend_user_map = {};
            _.each(vm.friend_users, function(friend_user) {
                temp_friend_user_map[friend_user._id] = friend_user;
            });
            if (vm.selected_user) {
                temp_friend_user_map[vm.selected_user._id] = vm.selected_user;
            };
            vm.friend_user_map = temp_friend_user_map;
        };

        var friend_users_watcher = function(scope) {return vm.friend_users;};
        var friendships_watcher = function(scope) {return vm.friendships;};
        var selected_user_watcher = function(scope) {return vm.selected_user;};
        $scope.$watch(friendships_watcher, refreshFriendUsers);
        $scope.$watch(selected_user_watcher, refreshFriendships);
        $scope.$watch(friend_users_watcher, refreshFriendUserMap);


        // initialization

        vm.friend_users = [];
        vm.friendships = [];
        vm.selected_convo = undefined;
        vm.selected_user = undefined;
        vm.friend_user_map = {};

        Auth.getLoggedInUser()
            .success(function(data) {
                vm.selected_user = data.user;
            });

    }]);
