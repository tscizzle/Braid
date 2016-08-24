angular.module('registerDirective', [])

    .controller('registerController',
                ['$location', 'nodeValidator', 'auth',
                 function($location, nodeValidator, auth) {

        var vm = this;


        // define functions used in the template

        vm.register = function() {
            var failure_messages = [];

            verifyUsernameLength(failure_messages, vm.registerForm.username);
            verifyPasswordStrength(failure_messages, vm.registerForm.password);
            verifyConfirmPasswordMatches(failure_messages, vm.registerForm.password, vm.registerForm.confirm_password);
            verifyEmailIsValid(failure_messages, vm.registerForm.email);

            if (failure_messages.length > 0) {
                vm.register_error = failure_messages[0];
                return;
            };

            auth.register(vm.registerForm.username, vm.registerForm.password, vm.registerForm.email)
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
                });

        };

        vm.registerErrorOpacity = function() {
            return vm.register_error ? 1 : 0;
        };


        // helpers

        var verifyUsernameLength = function(failure_messages, username) {
            var maximum_length = 20;
            if (username && username.length > maximum_length) {
                failure_messages.push('Username cannot be more than ' + maximum_length + ' characters');
            };
        };

        var verifyPasswordStrength = function(failure_messages, password) {
            var minimum_length = 10;
            if (password && password.length < minimum_length) {
                failure_messages.push('Password must be at least ' + minimum_length + ' characters');
            };
        };

        var verifyConfirmPasswordMatches = function(failure_messages, password, confirm_password) {
            if (password !== confirm_password) {
                failure_messages.push('Passwords don\'t match');
            };
        };

        var verifyEmailIsValid = function(failure_messages, email) {
            // only if an email is provided, make sure it's a valid email string
            if (email && !nodeValidator.isEmail(email)) {
                failure_messages.push('Email provided is not a valid email');
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
                auth_view: '=authView'
            },
            templateUrl: 'components/register/register.html',
            controller: 'registerController',
            controllerAs: 'registerCtrl',
            bindToController: true
        };
    });
