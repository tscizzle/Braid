angular.module('loginDirective', [])

    .controller('loginController', ['$location', '$route', 'auth', function($location, $route, auth) {

        var vm = this;


        // define functions used in the template

        vm.login = function() {
            auth.login(vm.loginForm.username, vm.loginForm.password)
                .success(function(data) {
                    vm.selected_user = data.user;
                    $location.path('/');
                    $route.reload();
                    vm.loginForm = {};
                })
                .catch(function(err) {
                    vm.login_error = err.data.err.message;
                    vm.loginForm = {};
                });
        };

        vm.switchToRegister = function() {
            vm.login_object = false;
        };

        vm.loginErrorOpacity = function() {
            return vm.login_error ? 1 : 0;
        };

        // initialization

        vm.login_error = '';
        vm.loginForm = {};

    }])

    .directive('braidLogin', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser',
                login_object: '=loginObject'
            },
            templateUrl: 'views/login.html',
            controller: 'loginController',
            controllerAs: 'loginCtrl',
            bindToController: true
        };
    });
