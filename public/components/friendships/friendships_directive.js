angular.module('friendshipsDirective', [])

    .controller('friendshipController',
                ['$scope', '$timeout', '$location', 'socket', 'Messages', 'Friendships', 'Convos',
                 function($scope, $timeout, $location, socket, Messages, Friendships, Convos) {

        var vm = this;


        // define CRUD functions used in the template

        vm.createFriendship = function() {
            if (vm.newFriendshipFormData.username) {
                vm.newFriendshipFormData.requester_id = vm.selected_user._id;

                Friendships.create(vm.newFriendshipFormData)
                    .success(function(data) {
                        vm.newFriendshipFormData = {};
                        vm.friendships = data;
                    })
                    .catch(function(err) {
                        vm.friendship_error = {
                            message: err.data.err,
                            opacity: 1,
                            last_error: Date.now()
                        };

                        var SECOND = 1000;
                        var delay = 5 * SECOND;
                        $timeout(friendshipErrorDisappear(delay), delay);
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
                        vm.selected_convo = undefined;
                    });

            };
        };


        // define page control functions used in the template

        vm.friendshipNeedsAnswer = function(friendship) {
            if (vm.selected_user) {
                return friendship.status === 'pending' && friendship.target_id === vm.selected_user._id;
            };
        };

        vm.conditionalStatus = function(friendship) {
            if (vm.selected_user) {
                return (friendship.status !== 'accepted' && friendship.requester_id === vm.selected_user._id) ? '(' + friendship.status + ')' : '';
            };
        };

        vm.showAcceptButton = function(friendship) {
            if (vm.selected_user) {
                return friendship.status === 'pending' && friendship.target_id === vm.selected_user._id;
            };
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

        vm.showFriendshipNotificationBubble = function() {
            return _.filter(vm.friendships, vm.friendshipNeedsAnswer).length > 0 && !vm.show_friendships;
        };

        vm.friendshipConvoIsSelected = function(friendship) {
            var friendship_convo = convoFromFriendship(friendship);
            if (vm.selected_convo && friendship_convo) {
                return friendship_convo._id === vm.selected_convo._id && $location.path() === '/';
            };
        };

        vm.selectConvo = function(friendship) {
            var friendship_convo = convoFromFriendship(friendship);
            if (friendship && friendship.status === 'accepted' && !friendship_convo) {
                $location.path('/');
                createConvo(friendship);
            } else if (friendship_convo) {
                $location.path('/');
                vm.selected_convo = friendship_convo;
            };
        };

        vm.showConvoUnreadNotificationBubble = function(friendship) {
            if (friendship) {
                return vm.convo_unread_message_counts[friendship._id];
            };
        };

        vm.showTotalUnreadNotificationBubble = function() {
            return vm.totalUnreadMessages() && !vm.show_friendships;
        };

        vm.totalUnreadMessages = function() {
            // sum the unread messages from all convos
            return _.reduce(vm.convo_unread_message_counts, function(memo, num) {
                return memo + num;
            }, 0);
        };


        // helpers

        var convoFromFriendship = function(friendship) {
            if (friendship) {
                var matching_convo = _.find(vm.convos, function(convo) {
                    var convo_pair = [convo.user_id_0, convo.user_id_1].sort();
                    var freindship_pair = [friendship.requester_id, friendship.target_id].sort();
                    return convo_pair[0] === freindship_pair[0] && convo_pair[1] === freindship_pair[1];
                });
                return matching_convo;
            };
        };

        var partnerIdFromFriendship = function(friendship) {
            if (vm.selected_user) {
                if (friendship.requester_id === vm.selected_user._id) {
                    return friendship.target_id;
                } else if (friendship.target_id === vm.selected_user._id) {
                    return friendship.requester_id;
                };
            };
        };

        var createConvo = function(friendship) {
            vm.newConvoFormData.user_id_1 = partnerIdFromFriendship(friendship);
            if (vm.newConvoFormData.user_id_1) {
                vm.newConvoFormData.user_id_0 = vm.selected_user._id;

                Convos.create(vm.newConvoFormData)
                    .success(function(data) {
                        vm.newConvoFormData = {};
                        vm.convos = data.convos;
                        vm.selected_convo = data.new_convo;
                    });

            };
        };

        var friendshipErrorDisappear = function(disappearDelay) {
            return function() {
                if (Date.now() - vm.friendship_error.last_error >= disappearDelay) {
                    vm.friendship_error.opacity = 0;
                };
            };
        };

        var refreshUnreadMessageCounts = function() {
            if (vm.selected_user) {

                Messages.getUnreadMessageCounts(vm.selected_user._id)
                    .success(function(unread_messages_data) {
                        _.each(vm.friendships, function(friendship) {
                            var convo = convoFromFriendship(friendship);
                            if (convo) {
                                vm.convo_unread_message_counts[friendship._id] = parseInt(unread_messages_data[convo._id]) || 0;
                            };
                        });
                    });

            };
        };


        // register listeners

        var refreshConvos = function() {
            if (vm.selected_user) {

                Convos.get(vm.selected_user._id)
                    .success(function(data) {
                        vm.convos = data;

                        var noFriendshipIsSelected = !_.any(vm.friendships, vm.friendshipConvoIsSelected);
                        var arbitrary_friendship = vm.friendships[0];
                        if (noFriendshipIsSelected && arbitrary_friendship) {
                            vm.selected_convo = convoFromFriendship(arbitrary_friendship);
                        };
                    });

            } else {
                vm.convos = [];
                vm.selected_convo = undefined;
            };
        };

        var resetTitleNotifications = function() {
            vm.title_notifications = vm.totalUnreadMessages();
        };

        var friendships_watcher = function() {return vm.friendships;};
        var friend_users_watcher = function() {return vm.friend_users;};
        var selected_user_watcher = function() {return vm.selected_user;};
        var unread_messages_watcher = function() {return vm.totalUnreadMessages()};
        $scope.$watchGroup([friendships_watcher, selected_user_watcher], refreshUnreadMessageCounts)
        $scope.$watchGroup([friend_users_watcher, selected_user_watcher], refreshConvos);
        $scope.$watch(unread_messages_watcher, resetTitleNotifications);


        // register socket listeners

        socket.on('messages:receive_update', function() {
            refreshUnreadMessageCounts();
        });

        socket.on('convos:receive_update', function() {
            refreshConvos();
        });


        // initialization

        vm.convos = [];
        vm.show_friendships = true;
        vm.hovered_friendship = undefined;
        vm.convo_unread_message_counts = {};
        vm.friendship_error = {
            message: '',
            opacity: 0,
            last_error: undefined
        };
        vm.newFriendshipFormData = {};
        vm.newConvoFormData = {};

        if (vm.selected_user) {

            Friendships.get(vm.selected_user._id)
                .success(function(data) {
                    vm.friendships = data;
                    refreshUnreadMessageCounts();
                });

        };

    }])

    .directive('braidFriendships', function() {
        return {
            restrict: 'E',
            scope: {
                friend_users: '=friendUsers',
                friendships: "=",
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                friend_user_map: '=friendUserMap',
                title_notifications: '=titleNotifications'
            },
            templateUrl: 'components/friendships/friendships.html',
            controller: 'friendshipController',
            controllerAs: 'friendshipCtrl',
            bindToController: true
        };
    });