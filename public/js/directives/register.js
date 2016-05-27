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
                .catch(function(err) {
                    vm.register_error = err.data.err.message;
                    vm.registerForm = {};
                });
        };

        vm.switchToLogin = function(){
            vm.login_object = true;
        };

        vm.registerErrorOpacity = function() {
            return vm.register_error ? 1 : 0;
        };

        // initialization

        vm.register_error = '';
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
