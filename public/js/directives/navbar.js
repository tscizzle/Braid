angular.module('navbarDirective', [])

    .directive('braidNavbar', function() {
        return {
            restrict: 'E',
            scope: {
                selected_user: '=selectedUser'
            },
            templateUrl: 'views/navbar.html'
        };
    });
