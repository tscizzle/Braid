angular.module('contactUsDirective', [])

    .directive('braidContactUs', function() {
        return {
            restrict: 'E',
            templateUrl: 'components/contact_us/contact_us.html'
        };
    });
