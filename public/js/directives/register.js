angular.module('registerDirective', [])

    .controller('registerController', ['$location', 'auth', function($location, auth) {

        var vm = this;


        // define functions used in the template

        vm.register = function() {
            var verification = verifyPasswordStrength(vm.registerForm.password);
            if (verification.failed) {
                vm.register_error = verification.failure_message;
                return;
            };

            auth.register(vm.registerForm.username, vm.registerForm.password)
                .success(function() {
                    auth.login(vm.registerForm.username, vm.registerForm.password)
                        .success(function(data) {
                            vm.selected_user = data.user;
                            $location.path('/');
                            vm.registerForm = {};
                        })
                        .catch(function() {
                            vm.registerForm = {};
                        });
                })
                .catch(function(err) {
                    if (err.data) {
                        vm.register_error = err.data.err.message;
                    } else {
                        vm.register_error = 'An error occurred.';
                    };
                    vm.registerForm = {};
                });

        };

        vm.switchToLogin = function(){
            vm.login_object = true;
        };

        vm.registerErrorOpacity = function() {
            return vm.register_error ? 1 : 0;
        };


        // helpers

        var verifyPasswordStrength = function(pw) {
            var verification = {
                failed: false
            };

            var required_length = 10;
            if (pw.length < required_length) {
                verification.failed = true;
                verification.failure_message = 'Password must be at least ' + required_length + ' characters.';
            };

            return verification;
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
