angular.module('resetPasswordDirective', [])

    .controller('resetPasswordController',
                ['$location', '$route', 'auth', function($location, $route, auth) {

        var vm = this;


        // define functions used in the template

        vm.resetPassword = function() {
            var failure_messages = [];

            verifyPasswordStrength(failure_messages, vm.resetPWForm.new_password);
            verifyConfirmPasswordMatches(failure_messages, vm.resetPWForm.new_password, vm.resetPWForm.confirm_new_password);

            if (failure_messages.length > 0) {
                vm.reset_password_error = failure_messages[0];
                return;
            };

            auth.resetPassword(vm.resetPWForm.new_password, vm.reset_password_token)
                .success(function(res) {
                    vm.password_has_been_reset = true;
                })
                .catch(function(err) {
                    if (err.data) {
                        vm.reset_password_error = err.data.err;
                    } else {
                        vm.reset_password_error = 'An error occurred.';
                    };
                });

        };

        vm.resetPWErrorOpacity = function() {
            return vm.reset_password_error ? 1 : 0;
        };


        // helpers

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


        // initialization

        vm.password_has_been_reset = false;
        vm.reset_password_error = '';
        vm.resetPWForm = {};

    }])

    .directive('braidResetPassword', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser',
                auth_view: '=authView',
                reset_password_token: '=resetPasswordToken'
            },
            templateUrl: 'components/reset_password/reset_password.html',
            controller: 'resetPasswordController',
            controllerAs: 'resetPWCtrl',
            bindToController: true
        };
    });
