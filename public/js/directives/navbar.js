angular.module('navbarDirective', [])
    .directive('braidNavbar', function() {
      return {
        restrict: 'E',
        scope: {
            user: '='
        },
        templateUrl: 'views/navbar.html'
      };
    });
