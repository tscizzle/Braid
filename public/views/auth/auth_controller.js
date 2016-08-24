angular.module('braidAuth', [])

    .controller('authController', ['$routeParams', function($routeParams) {

        var vm = this;


        // initialization

        vm.auth_view = $routeParams.token ? 'reset_password' : 'login';
        vm.reset_password_token = $routeParams.token;

    }]);
