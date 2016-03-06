angular.module('convosDirective', [])

    .controller('convoController', ['$scope', 'Convos', function($scope, Convos) {

        var vm = this;


        // for debugging (can access controller variables in the CONVO_SCOPE object in the browser console)
        window.CONVO_SCOPE = vm;


        // initialization

        vm.convos = [];
        vm.potential_partners = [];
        vm.forms = {
            newConvoFormData: {user_id_1: ""}
        };


        // define CRUD functions used in the template

        vm.createConvo = function() {
            if (vm.forms.newConvoFormData.user_id_1) {
                vm.forms.newConvoFormData.user_id_0 = vm.selected_user._id;

                Convos.create(vm.forms.newConvoFormData)
                    .success(function(data) {
                        vm.forms.newConvoFormData = {};
                        vm.convos = data.convos;
                        vm.selected_convo = data.new_convo;

                        if (!vm.selected_convo) {
                            vm.selected_convo = vm.convos[0];
                        };
                    });

            };
        };

        vm.deleteConvo = function(convo_id, user_id) {

            Convos.delete(convo_id, user_id)
                .success(function(data) {
                    vm.convos = data;

                    if (convo_id === vm.selected_convo._id) {
                        vm.selected_convo = vm.convos[0];
                    };
                });

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
                        vm.selected_convo = vm.convos[0];
                    });

            } else {
                vm.convos = [];
                vm.selected_convo = undefined;
            };
        };

        var refreshPotentialPartners = function() {
            var already_convod = [];
            _.each(vm.convos, function(convo) {
                already_convod.push(convo.user_id_0, convo.user_id_1);
            });
            vm.potential_partners = vm.users.filter(function(user) {
                return (($.inArray(user._id, already_convod) === -1) && (user._id !== vm.selected_user._id));
            });
            vm.potential_partners.unshift({_id: "", username: ""});
        };

        var convos_watcher = function(scope) {return vm.convos;};
        var users_watcher = function(scope) {return vm.users;};
        var selected_convo_watcher = function(scope) {return vm.selected_convo;};
        var selected_user_watcher = function(scope) {return vm.selected_user;};
        $scope.$watchGroup([users_watcher, selected_user_watcher], refreshConvos);
        $scope.$watchGroup([convos_watcher, users_watcher, selected_convo_watcher], refreshPotentialPartners);

    }])

    .directive('braidConvos', function() {
        return {
            restrict: 'E',
            scope: {
                users: '=',
                selected_convo: '=selectedConvo',
                selected_user: '=selectedUser',
                user_map: '=userMap'
            },
            templateUrl: 'views/convos.html',
            controller: 'convoController',
            controllerAs: 'convoCtrl',
            bindToController: true
        };
    });
