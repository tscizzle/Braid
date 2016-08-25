angular.module('loginDirective', [])

    .controller('loginController', ['$location', 'auth', function($location, auth) {

        var vm = this;


        // define functions used in the template

        vm.login = function() {
            vm.login_button_disabled = true;

            auth.login(vm.loginForm.username, vm.loginForm.password)
                .success(function(data) {
                    vm.selected_user = data.user;
                    $location.path('/');
                    vm.loginForm = {};
                    vm.login_button_disabled = false;
                })
                .catch(function(err) {
                    vm.loginForm = {};
                    vm.login_button_disabled = false;
                    vm.login_error = err.data.err.message;
                });

        };

        vm.loginErrorOpacity = function() {
            return vm.login_error ? 1 : 0;
        };

        // initialization

        vm.login_button_disabled = false;
        vm.login_error = '';
        vm.loginForm = {};

    }])

    .directive('braidLogin', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser',
                auth_view: '=authView'
            },
            templateUrl: 'components/login/login.html',
            controller: 'loginController',
            controllerAs: 'loginCtrl',
            bindToController: true
        };
    });
