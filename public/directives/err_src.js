angular.module('errSrcDirective', [])

    .directive('errSrc', ['$timeout', function($timeout) {
        return {
            link: function(scope, element, attrs) {
                element.bind('error', function() {
                    // using $timeout with no delay to safely call $apply, since
                    // it doesn't automagically call $apply/$digest because this
                    // change is 'outside' of angular
                    $timeout(function() {
                        if (attrs.src != attrs.errSrc) {
                            attrs.$set('src', attrs.errSrc);
                            scope.$digest();
                        };
                    });
                });
            }
        };
    }]);
