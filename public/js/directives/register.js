angular.module('registerDirective', [])

    .controller('registerController', ['$location', '$route', 'Auth', function($location, $route, Auth) {

        var vm = this;


        // define functions used in the template

        vm.register = function() {
            Auth.register(vm.registerForm.username, vm.registerForm.password)
                .success(function() {
                    Auth.login(vm.registerForm.username, vm.registerForm.password)
                        .success(function(data) {
                            vm.selected_user = data.user;
                            $location.path('/');
                            $route.reload();
                            vm.registerForm = {};
                        })
                        .catch(function() {
                            vm.registerForm = {};
                        });
                })
                .catch(function() {
                    vm.registerForm = {};
                });
        };


        // initialization

        vm.registerForm = {};

    }])

    .directive('braidRegister', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser'
            },
            templateUrl: 'views/register.html',
            controller: 'registerController',
            controllerAs: 'registerCtrl',
            bindToController: true
        };
    });
