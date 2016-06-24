angular.module('logoutDirective', [])

    .controller('logoutController', ['$location', '$route', 'auth', function($location, $route, auth) {

        var vm = this;


        // define functions used in the template

        vm.logout = function() {
            auth.logout()
                .then(function() {
                    vm.login_object = true;
                    vm.selected_user = undefined;
                    vm.title_notifications = 0;

                    $location.path('/auth');
                });
        };

    }])

    .directive('braidLogout', function() {
        return {
            restrict: 'E',
            scope: {
                login_object: '=loginObject',
                selected_user: '=selectedUser',
                title_notifications: '=titleNotifications'
            },
            templateUrl: 'views/logout.html',
            controller: 'logoutController',
            controllerAs: 'logoutCtrl',
            bindToController: true
        };
    });
