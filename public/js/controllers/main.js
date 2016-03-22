angular.module('braidController', [])

    .controller('mainController', ['Auth', function(Auth) {

        var vm = this;

        window.VM = vm;


        // initialization

        vm.users = [];
        vm.selected_convo = undefined;
        vm.selected_user = undefined;
        vm.user_map = {};

        Auth.getLoggedInUser()
            .success(function(data) {
                vm.selected_user = data.user;
            });

    }]);
