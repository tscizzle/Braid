angular.module('initiateResetPasswordDirective', [])

    .controller('initiateResetPasswordController', ['$location', 'auth', function($location, auth) {

        var vm = this;


        // define functions used in the template

        vm.initiateResetPassword = function() {

            auth.initiateResetPassword(vm.initResetPWForm.username)
                .success(function(res) {
                    vm.password_reset_initiated = true;
                    vm.initiate_reset_password_error = '';
                    vm.initResetPWForm = {};
                })
                .catch(function(err) {
                    if (err.data) {
                        vm.initiate_reset_password_error = err.data.err;
                    } else {
                        vm.initiate_reset_password_error = 'An error occurred.';
                    };
                });

        };

        vm.initResetPWErrorOpacity = function() {
            return vm.initiate_reset_password_error ? 1 : 0;
        };


        // initialization

        vm.password_reset_initiated = false;
        vm.initiate_reset_password_error = '';
        vm.initResetPWForm = {};

    }])

    .directive('braidInitiateResetPassword', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser',
                auth_view: '=authView',
                reset_password_token: '=resetPasswordToken'
            },
            templateUrl: 'components/initiate_reset_password/initiate_reset_password.html',
            controller: 'initiateResetPasswordController',
            controllerAs: 'initResetPWCtrl',
            bindToController: true
        };
    });
