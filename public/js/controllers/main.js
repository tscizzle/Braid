angular.module('braidController', [])

    .controller('mainController', function() {

        var vm = this;


        // initialization

        vm.users = [];
        vm.selected_convo = undefined;
        vm.selected_user = undefined;
        vm.user_map = {};

    });
