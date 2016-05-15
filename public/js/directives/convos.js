angular.module('convosDirective', [])

    .controller('convoController', ['$scope', 'socket', 'Convos', function($scope, socket, Convos) {

        var vm = this;


        // define CRUD functions used in the template

        vm.createConvo = function() {
            if (vm.newConvoFormData.user_id_1) {
                vm.newConvoFormData.user_id_0 = vm.selected_user._id;

                Convos.create(vm.newConvoFormData)
                    .success(function(data) {
                        vm.newConvoFormData = {};
                        vm.convos = data.convos;
                        vm.selected_convo = data.new_convo;

                        if (!vm.selected_convo) {
                            vm.selected_convo = vm.convos[0];
                        };
                    });

            };
        };

        vm.deleteConvo = function(convo_id) {
            if (vm.selected_user) {

                Convos.delete(convo_id, vm.selected_user._id)
                    .success(function(data) {
                        vm.convos = data;

                        if (convo_id === vm.selected_convo._id) {
                            vm.selected_convo = vm.convos[0];
                        };
                    });

            };
        };


        // define page control functions used in the template

        vm.selectConvo = function(convo) {
            vm.selected_convo = convo;
        };


        // register listeners

        var refreshConvos = function() {
            if (vm.selected_user) {

                Convos.get(vm.selected_user._id)
                    .success(function(data) {
                        vm.convos = data;

                        if (!vm.selected_convo) {
                            vm.selected_convo = vm.convos[0];
                        };
                    });

            } else {
                vm.convos = [];
                vm.selected_convo = undefined;
            };
        };

        var refreshPotentialPartners = function() {
            if (vm.selected_user) {
                var already_convod = [];
                _.each(vm.convos, function(convo) {
                    already_convod.push(convo.user_id_0, convo.user_id_1);
                });
                var friends = [];
                _.each(vm.friendships, function(friendship) {
                    if (friendship.status === 'accepted') {
                        if (friendship.requester_id !== vm.selected_user._id && vm.friend_user_map[friendship.requester_id]) {
                            friends.push(vm.friend_user_map[friendship.requester_id]);
                        };
                        if (friendship.target_id !== vm.selected_user._id && vm.friend_user_map[friendship.target_id]) {
                            friends.push(vm.friend_user_map[friendship.target_id]);
                        };
                    };
                });
                vm.potential_partners = friends.filter(function(friend) {
                    return (($.inArray(friend._id, already_convod) === -1) && (friend._id !== vm.selected_user._id));
                });
                vm.potential_partners.unshift({_id: "", username: ""});
            };
        };

        var convos_watcher = function(scope) {return vm.convos;};
        var friend_users_watcher = function(scope) {return vm.friend_users;};
        var selected_convo_watcher = function(scope) {return vm.selected_convo;};
        var selected_user_watcher = function(scope) {return vm.selected_user;};
        $scope.$watchGroup([friend_users_watcher, selected_user_watcher], refreshConvos);
        $scope.$watchGroup([convos_watcher, friend_users_watcher, selected_convo_watcher], refreshPotentialPartners);


        // register socket listeners

        socket.on('convos:receive_update', function() {
            refreshConvos();
        });


        // initialization

        vm.convos = [];
        vm.selected_convo = undefined;
        vm.potential_partners = [];
        vm.newConvoFormData = {user_id_1: ""};

    }])

    .directive('braidConvos', function() {
        return {
            restrict: 'E',
            scope: {
                friend_users: '=friendUsers',
                friendships: "=",
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                friend_user_map: '=friendUserMap'
            },
            templateUrl: 'views/convos.html',
            controller: 'convoController',
            controllerAs: 'convoCtrl',
            bindToController: true
        };
    });
