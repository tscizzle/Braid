angular.module('logoutDirective', [])

    .controller('logoutController', ['$location', '$route', 'auth', function($location, $route, auth) {

        var vm = this;


        // define functions used in the template

        vm.logout = function() {
            auth.logout()
                .then(function() {
                    vm.selected_user = undefined;
                    $location.path('/');
                    $route.reload();
                });
        };

    }])

    .directive('braidLogout', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser'
            },
            templateUrl: 'views/logout.html',
            controller: 'logoutController',
            controllerAs: 'logoutCtrl',
            bindToController: true
        };
    });
