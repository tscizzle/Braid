angular.module('registerDirective', [])

    .controller('registerController', ['$location', '$route', 'auth', function($location, $route, auth) {

        var vm = this;


        // define functions used in the template

        vm.register = function() {
            auth.register(vm.registerForm.username, vm.registerForm.password)
                .success(function() {
                    auth.login(vm.registerForm.username, vm.registerForm.password)
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

        // Clicking on the "already registered" button sets the login_object to true
        vm.switchToLogin = function(){
            vm.login_object = true;
        };

        // initialization

        vm.registerForm = {};

    }])

    .directive('braidRegister', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser',
                login_object: '=loginObject'
            },
            templateUrl: 'views/register.html',
            controller: 'registerController',
            controllerAs: 'registerCtrl',
            bindToController: true
        };
    });
