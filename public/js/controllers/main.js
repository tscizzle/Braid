angular.module('braidMain', [])

    .controller('mainController',
                ['$scope', 'socket', 'auth', 'Users', 'Friendships', 'AccountSettings', 'DEFAULT_NUM_MESSAGES',
                 function($scope, socket, auth, Users, Friendships, AccountSettings, DEFAULT_NUM_MESSAGES) {

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

        var refreshAccountSettings = function() {
            if (vm.selected_user) {
                AccountSettings.refresh(vm.selected_user._id);
            };
        };

        var friend_users_watcher = function() {return vm.friend_users;};
        var friendships_watcher = function() {return vm.friendships;};
        var selected_user_watcher = function() {return vm.selected_user;};
        $scope.$watch(friendships_watcher, refreshFriendUsers);
        $scope.$watch(selected_user_watcher, refreshFriendships);
        $scope.$watch(friend_users_watcher, refreshFriendUserMap);
        $scope.$watch(selected_user_watcher, joinUserSocketRoom);
        $scope.$watch(selected_user_watcher, refreshAccountSettings);


        // register socket listeners

        socket.on('connect', function() {
            joinUserSocketRoom();
        });

        socket.on('messages:receive_update', function(data) {
            // play a sound
            var sound_on = AccountSettings.account_settings.sound_on;
            var now = new Date();
            var SECOND = 1000;
            var just_received_message_sound = now - vm.last_message_received_sound < SECOND;
            if (sound_on && data.play_message_sound && !just_received_message_sound) {
                ooooh.play();
                vm.last_message_received_sound = new Date();
            };
        });

        socket.on('friendships:receive_update', function() {
            refreshFriendships();
        });

        socket.on('account_settings:receive_update', function() {
            refreshAccountSettings();
        });


        // constants

        var DEFAULT_NUM_MESSAGES = 50;

        var ooooh = new Audio('audio/ooooh.wav');


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
        vm.last_message_received_sound = undefined;

        auth.getLoggedInUser()
            .success(function(data) {
                vm.selected_user = data.user;
                joinUserSocketRoom();
            });

        refreshAccountSettings();

    }]);
