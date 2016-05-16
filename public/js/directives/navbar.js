angular.module('navbarDirective', [])

    .directive('braidNavbar', function() {
        return {
            restrict: 'E',
            scope: {
                login_object: '=loginObject',
                selected_user: '=selectedUser'
            },
            templateUrl: 'views/navbar.html'
        };
    });
