angular.module('registerDirective', [])

    .controller('registerController', ['$location', 'auth', function($location, auth) {

        var vm = this;


        // define functions used in the template

        vm.register = function() {
            var verification = {
                failed: false,
                failure_messages: []
            };

            verifyUsernameLength(verification, vm.registerForm.username);
            verifyPasswordStrength(verification, vm.registerForm.password);

            if (verification.failed) {
                vm.register_error = verification.failure_messages[0];
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

        var verifyUsernameLength = function(verification, username) {
            var maximum_length = 20;
            if (username.length > maximum_length) {
                verification.failed = true;
                verification.failure_messages.push('Username cannot be more than ' + maximum_length + ' characters');
            };
        };

        var verifyPasswordStrength = function(verification, password) {
            var minimum_length = 10;
            if (password.length < minimum_length) {
                verification.failed = true;
                verification.failure_messages.push('Password must be at least ' + minimum_length + ' characters');
            };
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
            templateUrl: 'components/register/register.html',
            controller: 'registerController',
            controllerAs: 'registerCtrl',
            bindToController: true
        };
    });
