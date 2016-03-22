angular.module('braidController', [])

    .controller('mainController', function() {

        var vm = this;

        window.VM = vm;


        // initialization

        vm.users = [];
        vm.selected_convo = undefined;
        vm.selected_user = undefined;
        vm.user_map = {};

        // TODO: check if anyone is logged in and if so then set them to selected_user

    });
