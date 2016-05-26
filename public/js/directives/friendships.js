angular.module('friendshipsDirective', [])

    .controller('friendshipController', ['$scope', '$timeout', 'socket', 'Friendships', 'Convos', function($scope, $timeout, socket, Friendships, Convos) {

        var vm = this;


        // define CRUD functions used in the template

        vm.createFriendship = function() {
            if (vm.newFriendshipFormData.username) {
                vm.newFriendshipFormData.requester_id = vm.selected_user._id;

                Friendships.create(vm.newFriendshipFormData)
                    .success(function(data) {
                        vm.newFriendshipFormData = {};
                        vm.friendships = data;
                    }).catch(function(err) {
                        vm.friendship_error = {
                            message: err.data.err,
                            opacity: 1,
                            last_error: Date.now()
                        };

                        var delay = 3000;
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

        vm.friendshipsNeedingAnswer = function() {
            return _.filter(vm.friendships, vm.friendshipNeedsAnswer).length > 0;
        };

        vm.friendshipConvoIsSelected = function(friendship) {
            var friendship_convo = convoFromFriendship(friendship);
            if (vm.selected_convo && friendship_convo) {
                return friendship_convo._id === vm.selected_convo._id;
            };
        };

        vm.selectConvo = function(friendship) {
            var friendship_convo = convoFromFriendship(friendship);
            if (friendship && friendship.status === 'accepted' && !friendship_convo) {
                createConvo(friendship);
            } else if (friendship_convo) {
                vm.selected_convo = friendship_convo;
            };
        };


        // helpers

        var convoFromFriendship = function(friendship) {
            if (vm.selected_user) {
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


        // register listeners

        var refreshConvos = function() {
            if (vm.selected_user) {

                Convos.get(vm.selected_user._id)
                    .success(function(data) {
                        vm.convos = data;

                        var arbitrary_friendship = vm.friendships[0]
                        if (!vm.selected_convo && arbitrary_friendship) {
                            vm.selected_convo = convoFromFriendship(arbitrary_friendship);
                        };
                    });

            } else {
                vm.convos = [];
                vm.selected_convo = undefined;
            };
        };

        var friend_users_watcher = function(scope) {return vm.friend_users;};
        var selected_user_watcher = function(scope) {return vm.selected_user;};
        $scope.$watchGroup([friend_users_watcher, selected_user_watcher], refreshConvos);


        // register socket listeners

        socket.on('convos:receive_update', function() {
            refreshConvos();
        });


        // initialization

        vm.friendships = [];
        vm.convos = [];
        vm.hovered_friendship = undefined;
        vm.friendship_error = {
            message: '',
            opacity: 0,
            last_error: undefined
        };
        vm.newFriendshipFormData = {};
        vm.newConvoFormData = {user_id_1: ""};

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
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                friend_user_map: '=friendUserMap'
            },
            templateUrl: 'views/friendships.html',
            controller: 'friendshipController',
            controllerAs: 'friendshipCtrl',
            bindToController: true
        };
    });
