angular.module('braidController', [])

    .controller('mainController', ['$scope', 'socket', 'auth', 'Users', 'Friendships', 'DEFAULT_NUM_MESSAGES', function($scope, socket, auth, Users, Friendships, DEFAULT_NUM_MESSAGES) {

        var vm = this;


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

        var joinUserSocketRoom = function() {
            if (vm.selected_user) {
                socket.emit('room:join', vm.selected_user);
            };
        };

        var friend_users_watcher = function() {return vm.friend_users;};
        var friendships_watcher = function() {return vm.friendships;};
        var selected_user_watcher = function() {return vm.selected_user;};
        $scope.$watch(friendships_watcher, refreshFriendUsers);
        $scope.$watch(selected_user_watcher, refreshFriendships);
        $scope.$watch(friend_users_watcher, refreshFriendUserMap);
        $scope.$watch(selected_user_watcher, joinUserSocketRoom);


        // register socket listeners

        socket.on('connect', function() {
            joinUserSocketRoom();
        });

        socket.on('friendships:receive_update', function() {
            refreshFriendships();
        });


        // constants

        var DEFAULT_NUM_MESSAGES = 50;


        // initialization

        vm.login_object = true;
        vm.title_notifications = 0;
        vm.messages = [];
        vm.strands = [];
        vm.num_messages = DEFAULT_NUM_MESSAGES;
        vm.friend_users = [];
        vm.friendships = [];
        vm.selected_strand = undefined;
        vm.selected_convo = undefined;
        vm.selected_user = undefined;
        vm.strand_map = {};
        vm.friend_user_map = {};

        auth.getLoggedInUser()
            .success(function(data) {
                vm.selected_user = data.user;
                joinUserSocketRoom();
            });

    }]);
