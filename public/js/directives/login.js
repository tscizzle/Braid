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
                .catch(function() {
                    vm.loginForm = {};
                });
        };


        // initialization

        vm.loginForm = {};

    }])

    .directive('braidLogin', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser'
            },
            templateUrl: 'views/login.html',
            controller: 'loginController',
            controllerAs: 'loginCtrl',
            bindToController: true
        };
    });
